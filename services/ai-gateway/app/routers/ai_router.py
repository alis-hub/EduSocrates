"""
AI Gateway Chat Router — Core streaming & session endpoints.
Sessions and audit log are now Redis-backed with in-memory fallback.
"""
import json
import uuid
import time
from typing import List, Dict, Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.guardrails.pipeline import (
    layer1_sanitize, layer2_classify_intent, layer5_verify_output, ThreatLevel, IntentCategory
)
from app.pii.redactor import redact_pii
from app.prompts.socratic_prompt import (
    build_system_prompt, build_student_turn_message, get_answer_key_terms, SAFE_FALLBACK_RESPONSE
)
from app.services.llm_provider import stream_llm_response
from app.services import redis_client

router = APIRouter(prefix="/ai", tags=["ai-gateway"])

# In-memory fallback stores (used when Redis is unavailable)
_sessions_fallback: Dict[str, dict] = {}
_audit_fallback: List[dict] = []


# ─── Pydantic Models ───────────────────────────────────────────────────────── #

class SessionStartRequest(BaseModel):
    school_id: str
    student_id: str
    coursework_id: str
    subject_name: str
    assignment_title: str
    assignment_description: str
    ai_system_notes: Optional[str] = None
    ai_guidance_mode: str = "SOCRATIC_STRICT"
    teacher_guidance: Optional[str] = None


class SessionStartResponse(BaseModel):
    session_id: str
    message: str = "Socratic session initialized."


class ChatStreamRequest(BaseModel):
    session_id: str
    student_message: str


# ─── Session Helpers ───────────────────────────────────────────────────────── #

async def _get_session(session_id: str) -> Optional[dict]:
    """Get session from Redis, fall back to in-memory dict."""
    session = await redis_client.session_get(session_id)
    if session is None:
        session = _sessions_fallback.get(session_id)
    return session


async def _set_session(session_id: str, data: dict) -> None:
    """Persist session to Redis and in-memory fallback."""
    await redis_client.session_set(session_id, data)
    _sessions_fallback[session_id] = data


async def _append_audit(school_id: str, entry: dict) -> None:
    """Append audit entry to Redis and in-memory fallback."""
    await redis_client.audit_append(school_id, entry)
    _audit_fallback.append(entry)


# ─── Session Start ─────────────────────────────────────────────────────────── #

@router.post("/session/start", response_model=SessionStartResponse)
async def start_session(request: SessionStartRequest):
    """Initialize a new Socratic AI tutoring session for a student."""
    session_id = str(uuid.uuid4())
    system_prompt = build_system_prompt(
        subject_name=request.subject_name,
        assignment_title=request.assignment_title,
        assignment_description=request.assignment_description,
        ai_system_notes=request.ai_system_notes or "",
        teacher_guidance=request.teacher_guidance or "",
        ai_guidance_mode=request.ai_guidance_mode,
    )
    answer_key_terms = get_answer_key_terms(request.ai_system_notes or "")


    session_data = {
        "school_id": request.school_id,
        "student_id": request.student_id,
        "coursework_id": request.coursework_id,
        "ai_guidance_mode": request.ai_guidance_mode,
        "system_prompt": system_prompt,
        "answer_key_terms": answer_key_terms,
        "message_history": [],
        "turn_count": 0,
        "hint_count": 0,
        "created_at": time.time(),
    }
    await _set_session(session_id, session_data)
    return SessionStartResponse(session_id=session_id)


# ─── Streaming Chat ────────────────────────────────────────────────────────── #

@router.post("/chat/stream")
async def chat_stream(request: ChatStreamRequest, background_tasks: BackgroundTasks):
    """
    5-Layer Defense-in-Depth Socratic AI Chat Streaming Endpoint (SSE).
    Sessions are stored in Redis with in-memory fallback.
    """
    session = await _get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")

    raw_message = request.student_message

    # ── PII Redaction ─────────────────────────────────────────────────────── #
    sanitized_message, pii_found = redact_pii(raw_message)

    # ── Layer 1: Pre-Sanitization ─────────────────────────────────────────── #
    guard1 = layer1_sanitize(sanitized_message)

    # ── Layer 2: Semantic Intent Classification ───────────────────────────── #
    intent = layer2_classify_intent(sanitized_message)
    if guard1.intent_category != IntentCategory.EDUCATIONAL:
        intent = guard1.intent_category

    audit_entry = {
        "session_id": request.session_id,
        "student_id": session["student_id"],
        "school_id": session["school_id"],
        "coursework_id": session.get("coursework_id"),
        "timestamp": time.time(),
        "student_message": raw_message[:500],
        "threat_level": guard1.threat_level.value,
        "intent_category": intent.value,
        "matched_patterns": guard1.matched_patterns,
        "pii_detected": pii_found,
        "response_intercepted": False,
    }

    # Block outright if flagged as high threat
    if guard1.threat_level == ThreatLevel.BLOCKED:
        audit_entry["response_intercepted"] = True
        await _append_audit(session["school_id"], audit_entry)

        def blocked_stream():
            msg = (
                "I'm here to help you learn through exploration! 😊 "
                "Let's focus on understanding the concepts step by step. "
                "What aspect of the problem would you like to start exploring? "
                "Think about what you already know about the subject matter."
            )
            yield f"data: {json.dumps({'token': msg, 'done': False, 'intercepted': True})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

        return StreamingResponse(blocked_stream(), media_type="text/event-stream")

    # ── Layer 3: Context Injection (already done in system_prompt) ────────── #
    session["turn_count"] += 1

    # ── Hint throttling for SOCRATIC_HINTS_ONLY mode ──────────────────────── #
    if (session.get('ai_guidance_mode') == 'SOCRATIC_HINTS_ONLY'
            and session.get('hint_count', 0) >= 2):
        wrapped_message = build_student_turn_message(
            sanitized_message + ' [INSTRUCTOR CONSTRAINT: hint limit reached this cycle — redirect with a question, do not provide another hint]',
            session['turn_count']
        )
    else:
        wrapped_message = build_student_turn_message(sanitized_message, session['turn_count'])

    message_history = session["message_history"] + [
        {"role": "user", "content": wrapped_message}
    ]

    answer_key_terms = session["answer_key_terms"]
    system_prompt = session["system_prompt"]

    async def generate_sse():
        """Streaming SSE generator with Layer 5 output verification."""
        accumulated = ""
        intercepted = False

        try:
            # ── Layer 4: Constrained LLM Inference (streaming) ───────────── #
            async for token in stream_llm_response(system_prompt, message_history):
                accumulated += token

                # ── Layer 5: Real-time Output Verification ────────────────── #
                is_safe, verified_chunk = layer5_verify_output(accumulated, answer_key_terms)

                if not is_safe:
                    intercepted = True
                    audit_entry["response_intercepted"] = True
                    await _append_audit(session["school_id"], audit_entry)
                    yield f"data: {json.dumps({'token': verified_chunk, 'done': False, 'intercepted': True})}\n\n"
                    break
                else:
                    yield f"data: {json.dumps({'token': token, 'done': False})}\n\n"

            if not intercepted:
                # Store assistant response in session history (persisted to Redis)
                session["message_history"].append({"role": "user", "content": wrapped_message})
                session["message_history"].append({"role": "assistant", "content": accumulated})
                if session.get('ai_guidance_mode') == 'SOCRATIC_HINTS_ONLY':
                    session['hint_count'] = (session.get('hint_count', 0) + 1) % 3
                await _set_session(request.session_id, session)
                await _append_audit(session["school_id"], audit_entry)

            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception:
            yield f"data: {json.dumps({'token': SAFE_FALLBACK_RESPONSE, 'done': False, 'error': True})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(generate_sse(), media_type="text/event-stream")


# ─── Teacher Audit Analytics ──────────────────────────────────────────────── #

@router.get("/teacher/analytics/audit")
async def get_audit_log(
    school_id: str,
    limit: int = 100,
    coursework_id: Optional[str] = None,
    flagged_only: bool = False,
):
    """Returns recent AI session audit entries for teacher review (Redis-backed)."""
    entries = await redis_client.audit_get(school_id, limit * 2)
    # Fallback to in-memory if Redis returned nothing
    if not entries:
        entries = [a for a in _audit_fallback if a.get("school_id") == school_id]
        entries = entries[::-1]

    if coursework_id:
        entries = [e for e in entries if e.get("coursework_id") == coursework_id]
    if flagged_only:
        entries = [e for e in entries if e.get("response_intercepted") or e.get("threat_level") == "BLOCKED"]

    entries = entries[:limit]
    return {
        "school_id": school_id,
        "total_entries": len(entries),
        "entries": entries,
    }



# ─── Session Messages (Teacher Transcript) ────────────────────────────────── #

@router.get("/sessions/{session_id}/messages")
async def get_session_messages(session_id: str):
    """Return full message history for a session (teacher transcript view)."""
    session = await _get_session(session_id)
    if not session:
        return {"session_id": session_id, "messages": [], "expired": True}
    return {
        "session_id": session_id,
        "student_id": session.get("student_id"),
        "coursework_id": session.get("coursework_id"),
        "turn_count": session.get("turn_count", 0),
        "messages": session.get("message_history", []),
    }


# ─── Global Audit (Super Admin) ───────────────────────────────────────────── #

@router.get("/global-audit")
async def get_global_audit(limit: int = 200):
    """Returns cross-school audit log entries for Super Admin monitoring."""
    entries = await redis_client.audit_get_all(limit)
    if not entries:
        # Fallback
        entries = sorted(_audit_fallback, key=lambda e: e.get("timestamp", 0), reverse=True)[:limit]
    return {"total_entries": len(entries), "entries": entries}


# ─── Health ───────────────────────────────────────────────────────────────── #

@router.get("/health")
async def health():
    redis = await redis_client.get_redis()
    return {
        "status": "ok",
        "service": "EduSocrates AI Gateway",
        "redis": "connected" if redis else "unavailable (fallback active)",
    }
