"""
AI Gateway Chat Router — Core streaming, Public Learning Hub, & Teacher Sandbox endpoints (v2.3.0).
Sessions and audit log are Redis-backed with in-memory fallback.
"""
import json
import uuid
import time
from typing import List, Dict, Optional, Any

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
from app.services.llm_provider import stream_llm_response, generate_llm_text
from app.services import redis_client

router = APIRouter(prefix="/ai", tags=["ai-gateway"])

# In-memory fallback stores (used when Redis is unavailable)
_sessions_fallback: Dict[str, dict] = {}
_audit_fallback: List[dict] = []


# ─── Pydantic Models ───────────────────────────────────────────────────────── #

class SessionStartRequest(BaseModel):
    school_id: str = "00000000-0000-0000-0000-000000000000"
    student_id: str = "anonymous"
    coursework_id: Optional[str] = None
    subject_name: str
    assignment_title: str
    assignment_description: str
    ai_system_notes: Optional[str] = None
    ai_guidance_mode: str = "SOCRATIC_STRICT"
    teacher_guidance: Optional[str] = None
    session_type: str = "COURSEWORK"  # 'COURSEWORK' | 'PUBLIC_HUB_SANDBOX'
    difficulty_level: str = "HIGH_SCHOOL"  # 'ELEMENTARY' | 'HIGH_SCHOOL' | 'AP_UNDERGRAD'
    sandbox_mode: str = "EXPLANATION"  # 'EXPLANATION' | 'CHECK_MY_LOGIC' | 'TOY_PROBLEM' | 'CODE_DEBUG'
    socratic_system_prompt_override: Optional[str] = None


class SessionStartResponse(BaseModel):
    session_id: str
    message: str = "Socratic session initialized."


class ChatStreamRequest(BaseModel):
    session_id: str
    student_message: str


class HubSandboxStreamRequest(BaseModel):
    topic: str
    message: str
    level: str = "HIGH_SCHOOL"  # 'ELEMENTARY' | 'HIGH_SCHOOL' | 'AP_UNDERGRAD'
    mode: str = "EXPLANATION"   # 'EXPLANATION' | 'CHECK_MY_LOGIC' | 'TOY_PROBLEM' | 'CODE_DEBUG'
    ai_guidance_mode: str = "SOCRATIC_STRICT"
    rubric_or_notes: Optional[str] = None
    history: List[Dict[str, str]] = Field(default_factory=list)
    school_id: str = "00000000-0000-0000-0000-000000000000"
    student_id: str = "anonymous"


class FlashcardGenerateRequest(BaseModel):
    topic: Optional[str] = None
    subject_area: str = "General Science"
    assignment_title: Optional[str] = None
    assignment_description: Optional[str] = None
    rubric: Optional[str] = None
    card_count: int = Field(default=10, ge=3, le=15)


class PracticeQuizGenerateRequest(BaseModel):
    subject: str
    topic: Optional[str] = None
    difficulty_level: str = "HIGH_SCHOOL"
    question_count: int = Field(default=5, ge=2, le=15)
    coursework_description: Optional[str] = None


class QuizDebriefRequest(BaseModel):
    subject: str
    missed_items: List[Dict[str, Any]]  # [{question_text, chosen_option, correct_option, misconception_explanation}]


class ConceptEvaluateRequest(BaseModel):
    node_title: str
    node_description: str
    checkpoint_prompt: str
    student_answer: str


class DiscussionModerateRequest(BaseModel):
    thread_title: str
    thread_body: str
    subject_tag: str = "General"
    recent_replies: List[str] = Field(default_factory=list)


# ─── Session Helpers ───────────────────────────────────────────────────────── #

async def _get_session(session_id: str) -> Optional[dict]:
    session = await redis_client.session_get(session_id)
    if session is None:
        session = _sessions_fallback.get(session_id)
    return session


async def _set_session(session_id: str, data: dict) -> None:
    await redis_client.session_set(session_id, data)
    _sessions_fallback[session_id] = data


async def _append_audit(school_id: str, entry: dict) -> None:
    await redis_client.audit_append(school_id, entry)
    _audit_fallback.append(entry)


# ─── Session Start ─────────────────────────────────────────────────────────── #

@router.post("/session/start", response_model=SessionStartResponse)
async def start_session(request: SessionStartRequest):
    """Initialize a new Socratic AI tutoring session (Coursework or Public Hub)."""
    session_id = str(uuid.uuid4())
    system_prompt = build_system_prompt(
        subject_name=request.subject_name,
        assignment_title=request.assignment_title,
        assignment_description=request.assignment_description,
        ai_system_notes=request.ai_system_notes or "",
        teacher_guidance=request.teacher_guidance or "",
        ai_guidance_mode=request.ai_guidance_mode,
        session_type=request.session_type,
        difficulty_level=request.difficulty_level,
        sandbox_mode=request.sandbox_mode,
        socratic_system_prompt_override=request.socratic_system_prompt_override,
    )
    answer_key_terms = get_answer_key_terms(request.ai_system_notes or "")

    session_data = {
        "school_id": request.school_id,
        "student_id": request.student_id,
        "coursework_id": request.coursework_id,
        "session_type": request.session_type,
        "difficulty_level": request.difficulty_level,
        "sandbox_mode": request.sandbox_mode,
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


# ─── Streaming Chat (Session-Based) ────────────────────────────────────────── #

@router.post("/chat/stream")
async def chat_stream(request: ChatStreamRequest, background_tasks: BackgroundTasks):
    """5-Layer Defense-in-Depth Socratic AI Chat Streaming Endpoint (SSE)."""
    session = await _get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")

    raw_message = request.student_message
    sanitized_message, pii_found = redact_pii(raw_message)
    guard1 = layer1_sanitize(sanitized_message)
    intent = layer2_classify_intent(sanitized_message)
    if guard1.intent_category != IntentCategory.EDUCATIONAL:
        intent = guard1.intent_category

    audit_entry = {
        "session_id": request.session_id,
        "student_id": session["student_id"],
        "school_id": session["school_id"],
        "coursework_id": session.get("coursework_id"),
        "session_type": session.get("session_type", "COURSEWORK"),
        "timestamp": time.time(),
        "student_message": raw_message[:500],
        "threat_level": guard1.threat_level.value,
        "intent_category": intent.value,
        "matched_patterns": guard1.matched_patterns,
        "pii_detected": pii_found,
        "response_intercepted": False,
    }

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

    session["turn_count"] += 1
    if (
        session.get("ai_guidance_mode") == "SOCRATIC_HINTS_ONLY"
        and session.get("hint_count", 0) >= 2
    ):
        wrapped_message = build_student_turn_message(
            sanitized_message
            + " [INSTRUCTOR CONSTRAINT: hint limit reached this cycle — redirect with a question, do not provide another hint]",
            session["turn_count"],
        )
    else:
        wrapped_message = build_student_turn_message(sanitized_message, session["turn_count"])

    message_history = session["message_history"] + [{"role": "user", "content": wrapped_message}]
    answer_key_terms = session["answer_key_terms"]
    system_prompt = session["system_prompt"]

    async def generate_sse():
        accumulated = ""
        intercepted = False
        try:
            async for token in stream_llm_response(system_prompt, message_history):
                accumulated += token
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
                session["message_history"].append({"role": "user", "content": wrapped_message})
                session["message_history"].append({"role": "assistant", "content": accumulated})
                if session.get("ai_guidance_mode") == "SOCRATIC_HINTS_ONLY":
                    session["hint_count"] = (session.get("hint_count", 0) + 1) % 3
                await _set_session(request.session_id, session)
                await _append_audit(session["school_id"], audit_entry)

            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception:
            yield f"data: {json.dumps({'token': SAFE_FALLBACK_RESPONSE, 'done': False, 'error': True})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(generate_sse(), media_type="text/event-stream")


# ─── Public Hub Sandbox / Code Debug / Teacher Simulator Stream ────────────── #

@router.post("/hub/sandbox/stream")
async def hub_sandbox_stream(request: HubSandboxStreamRequest):
    """
    Stateless SSE endpoint for Universal Public Learning Hub Sandbox,
    Socratic Code Debugger, and Try-as-a-Teacher Simulator.
    Applies full 5-layer defense-in-depth pipeline.
    """
    sanitized_message, pii_found = redact_pii(request.message)
    guard1 = layer1_sanitize(sanitized_message)
    intent = layer2_classify_intent(sanitized_message)
    if guard1.intent_category != IntentCategory.EDUCATIONAL:
        intent = guard1.intent_category

    audit_entry = {
        "session_id": "hub-sandbox",
        "student_id": request.student_id,
        "school_id": request.school_id,
        "coursework_id": None,
        "session_type": "PUBLIC_HUB_SANDBOX",
        "timestamp": time.time(),
        "student_message": request.message[:500],
        "threat_level": guard1.threat_level.value,
        "intent_category": intent.value,
        "matched_patterns": guard1.matched_patterns,
        "pii_detected": pii_found,
        "response_intercepted": False,
    }

    if guard1.threat_level == ThreatLevel.BLOCKED:
        audit_entry["response_intercepted"] = True
        await _append_audit(request.school_id, audit_entry)

        def blocked_stream():
            msg = (
                "Let's focus on discovering the concept together! 🔍 "
                "Instead of jumping past the reasoning, what principle in "
                f"{request.topic} do you think connects to your question?"
            )
            yield f"data: {json.dumps({'token': msg, 'done': False, 'intercepted': True})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

        return StreamingResponse(blocked_stream(), media_type="text/event-stream")

    system_prompt = build_system_prompt(
        subject_name=request.topic,
        assignment_title=request.topic,
        assignment_description=request.rubric_or_notes or f"Exploring {request.topic} in {request.mode} mode.",
        ai_system_notes=request.rubric_or_notes or "",
        ai_guidance_mode=request.ai_guidance_mode,
        session_type="PUBLIC_HUB_SANDBOX" if not request.rubric_or_notes else "COURSEWORK",
        difficulty_level=request.level,
        sandbox_mode=request.mode,
    )
    answer_key_terms = get_answer_key_terms(request.rubric_or_notes or "")

    msgs: List[Dict[str, str]] = []
    for idx, h in enumerate(request.history[-10:]):
        r = "user" if h.get("role") in ("user", "student") else "assistant"
        c = h.get("content", "")
        if r == "user":
            c = build_student_turn_message(c, idx + 1)
        msgs.append({"role": r, "content": c})
    msgs.append({"role": "user", "content": build_student_turn_message(sanitized_message, len(msgs) + 1)})

    async def generate_sse():
        accumulated = ""
        intercepted = False
        try:
            async for token in stream_llm_response(system_prompt, msgs):
                accumulated += token
                is_safe, verified_chunk = layer5_verify_output(accumulated, answer_key_terms)
                if not is_safe:
                    intercepted = True
                    audit_entry["response_intercepted"] = True
                    await _append_audit(request.school_id, audit_entry)
                    yield f"data: {json.dumps({'token': verified_chunk, 'done': False, 'intercepted': True})}\n\n"
                    break
                yield f"data: {json.dumps({'token': token, 'done': False})}\n\n"
            if not intercepted:
                await _append_audit(request.school_id, audit_entry)
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception:
            yield f"data: {json.dumps({'token': SAFE_FALLBACK_RESPONSE, 'done': False, 'error': True})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(generate_sse(), media_type="text/event-stream")


# ─── AI Flashcard Deck Generator (Topic OR Assignment-Driven) ─────────────── #

def _fallback_flashcards(topic: str, subject: str, count: int) -> List[Dict[str, str]]:
    templates = [
        ("Core Principle of {t}", "What fundamental law or conserved quantity governs {t}?", "Connect how changing one input variable shifts the system outcome in {t}.", "{t} in {s} relies on identifying invariant quantities and isolating causal relationships before solving."),
        ("Boundary Conditions & Edge Cases", "What happens in {t} when key variables approach zero or infinity?", "Test extreme values mentally before trusting an algebraic formula.", "Checking limiting cases validates physical/logical consistency and prevents sign or domain errors."),
        ("Decomposing Components", "Can a multi-part problem in {t} be split along independent axes or sub-problems?", "Break the scenario into orthogonal directions or base cases.", "Independent components preserve structure separately and recombine using standard rules."),
        ("Common Misconception Check", "Why might intuition mislead someone at first glance in {t}?", "Compare instantaneous state versus accumulated change over time.", "Distinguishing rates from totals and causes from symptoms resolves most errors in {t}."),
        ("Symbolic Representation", "Which variables or units must align before combining terms in {t}?", "Verify dimensional or type consistency across both sides of the relation.", "Consistent units and well-defined symbols ensure equations model reality accurately."),
        ("Diagnostic Self-Test Step", "If your computed result doubled unexpectedly, which term in {t} was squared or inverted?", "Inspect proportional scaling (linear vs. quadratic) in the governing equation.", "Scaling analysis checks how output sensitivity depends on each parameter."),
        ("Inverse & Reverse Reasoning", "Suppose you know the outcome of {t} — how do you work backward to initial conditions?", "Trace the causal chain in reverse and check uniqueness.", "Backward reasoning tests conceptual mastery rather than memorized forward steps."),
        ("Real-World Analogy", "What everyday phenomenon mirrors the mechanics of {t}?", "Visualize a tangible classroom or physical example before writing notation.", "Analogies anchor abstract symbols in physical or intuitive mental models."),
        ("Key Assumption Verification", "What hidden assumption (e.g., frictionless, continuous, base case) makes {t} hold?", "List the idealizations required before applying the theorem.", "Every model applies only within its explicit domain of validity."),
        ("Synthesis Question", "How would you explain the core idea of {t} to a peer without using formulas?", "Focus on the why behind the relationship, not the final equation.", "True understanding means articulating why a principle holds before computing with it."),
    ]
    cards = []
    for i in range(count):
        title, c1, c2, df = templates[i % len(templates)]
        cards.append({
            "concept_title": title.format(t=topic, s=subject),
            "clue_tier_1": c1.format(t=topic, s=subject),
            "clue_tier_2": c2.format(t=topic, s=subject),
            "terminal_definition": df.format(t=topic, s=subject),
        })
    return cards


@router.post("/hub/flashcards/generate")
async def generate_flashcards(request: FlashcardGenerateRequest):
    """Generate a Socratic 2-tier clue flashcard deck from topic or assignment + rubric."""
    focus = request.assignment_title or request.topic or request.subject_area
    sys_prompt = (
        "You are an expert curriculum designer for EduSocrates. "
        "Generate a JSON array of flashcards with progressive Socratic clues. "
        "Each item MUST have exact keys: concept_title, clue_tier_1, clue_tier_2, terminal_definition."
    )
    user_prompt = (
        f"Create {request.card_count} Socratic flashcards for Subject: '{request.subject_area}', "
        f"Topic/Assignment: '{focus}'. "
        f"Context/Description: {request.assignment_description or 'General conceptual mastery'}. "
        f"Rubric focus: {request.rubric or 'Core principles, common pitfalls, and step reasoning'}. "
        "Return ONLY valid JSON: {\"cards\": [{\"concept_title\":..., \"clue_tier_1\":..., \"clue_tier_2\":..., \"terminal_definition\":...}]}"
    )

    raw = await generate_llm_text(sys_prompt, user_prompt, temperature=0.35, json_mode=True)
    if raw:
        try:
            parsed = json.loads(raw)
            cards = parsed.get("cards", parsed) if isinstance(parsed, dict) else parsed
            if isinstance(cards, list) and len(cards) > 0:
                normalized = [
                    {
                        "concept_title": str(c.get("concept_title", f"Concept {i+1}")),
                        "clue_tier_1": str(c.get("clue_tier_1", "")),
                        "clue_tier_2": str(c.get("clue_tier_2", "")),
                        "terminal_definition": str(c.get("terminal_definition", "")),
                    }
                    for i, c in enumerate(cards[: request.card_count])
                ]
                return {"title": f"{focus} Study Deck", "subject_area": request.subject_area, "cards": normalized}
        except Exception:
            pass

    return {
        "title": f"{focus} Study Deck",
        "subject_area": request.subject_area,
        "cards": _fallback_flashcards(focus, request.subject_area, request.card_count),
    }


# ─── AI Practice Quiz Generator & Misconception Debrief ────────────────────── #

def _fallback_quiz(subject: str, topic: str, level: str, count: int) -> List[Dict[str, Any]]:
    base = [
        {
            "question_text": f"[{level}] When analyzing a problem in {topic} ({subject}), what is the most reliable first diagnostic step?",
            "options": [
                "Plug numbers directly into the longest memorized formula",
                "Identify known quantities, system boundaries, and governing principles",
                "Assume all variables scale linearly",
                "Ignore units until the final step",
            ],
            "correct_option_index": 1,
            "misconception_explanation": f"Jumping straight to formulas without checking boundaries or units in {topic} often applies an equation outside its valid assumptions.",
        },
        {
            "question_text": f"[{level}] If an intermediate variable in {topic} doubles while other conditions remain fixed, why should you check scaling behavior?",
            "options": [
                "Because output changes depend on whether the variable enters linearly, quadratically, or inversely",
                "Because doubling any input always doubles the final answer",
                "Scaling never affects proportional relationships",
                "Only constants change during scaling",
            ],
            "correct_option_index": 0,
            "misconception_explanation": "Assuming every relationship is strictly linear misses quadratic, exponential, or inverse dependencies.",
        },
        {
            "question_text": f"[{level}] Which check best catches an algebraic or logical error mid-way through solving {topic}?",
            "options": [
                "Verify dimensional/unit consistency and limiting edge cases",
                "Round every intermediate value to 1 significant digit",
                "Switch variables arbitrarily",
                "Skip checking sign conventions",
            ],
            "correct_option_index": 0,
            "misconception_explanation": "Dimensional analysis and extreme-value testing immediately surface misplaced factors or inverted signs.",
        },
        {
            "question_text": f"[{level}] In {subject} ({topic}), why is breaking a composite scenario into independent parts effective?",
            "options": [
                "Each orthogonal or modular piece satisfies simpler conservation/invariant rules",
                "It eliminates the need for any initial conditions",
                "It guarantees zero error without checking",
                "Parts can only be studied separately if constants are equal",
            ],
            "correct_option_index": 0,
            "misconception_explanation": "Decomposing along independent dimensions prevents conflating unrelated quantities.",
        },
        {
            "question_text": f"[{level}] What distinguishes deep conceptual mastery of {topic} from rote calculation?",
            "options": [
                "Explaining why a principle applies and predicting what breaks if an assumption is removed",
                "Memorizing solved examples word-for-word",
                "Solving problems only when numbers match textbook exercises",
                "Avoiding visual or physical intuition",
            ],
            "correct_option_index": 0,
            "misconception_explanation": "Rote memorization fails as soon as surface numbers or boundary conditions change.",
        },
    ]
    out = []
    for i in range(count):
        item = dict(base[i % len(base)])
        if i >= len(base):
            item["question_text"] = f"Q{i+1}: " + item["question_text"]
        out.append(item)
    return out


@router.post("/hub/quizzes/generate")
async def generate_practice_quiz(request: PracticeQuizGenerateRequest):
    """Generate a custom ungraded practice quiz with misconception explanations."""
    topic = request.topic or request.subject
    sys_prompt = (
        "You are an assessment architect for EduSocrates. Generate diagnostic multiple-choice questions "
        "designed to reveal conceptual misconceptions."
    )
    user_prompt = (
        f"Generate {request.question_count} MCQs for Subject: '{request.subject}', Topic: '{topic}', "
        f"Difficulty: '{request.difficulty_level}'. Context: {request.coursework_description or 'Self-assessment'}. "
        "Return ONLY valid JSON: {\"title\":..., \"questions\": [{\"question_text\":..., \"options\": [4 strings], "
        "\"correct_option_index\": 0..3, \"misconception_explanation\":...}]}"
    )

    raw = await generate_llm_text(sys_prompt, user_prompt, temperature=0.35, json_mode=True)
    if raw:
        try:
            parsed = json.loads(raw)
            qs = parsed.get("questions", [])
            if isinstance(qs, list) and len(qs) > 0:
                cleaned = []
                for q in qs[: request.question_count]:
                    opts = q.get("options", [])
                    if len(opts) >= 2:
                        cleaned.append({
                            "question_text": str(q.get("question_text", "")),
                            "options": [str(o) for o in opts[:4]],
                            "correct_option_index": int(q.get("correct_option_index", 0)),
                            "misconception_explanation": str(q.get("misconception_explanation", "Review the underlying principle carefully.")),
                        })
                if cleaned:
                    return {
                        "title": str(parsed.get("title", f"{topic} Practice Quiz")),
                        "subject": request.subject,
                        "questions": cleaned,
                    }
        except Exception:
            pass

    return {
        "title": f"{topic} Practice Quiz ({request.difficulty_level})",
        "subject": request.subject,
        "questions": _fallback_quiz(request.subject, topic, request.difficulty_level, request.question_count),
    }


@router.post("/hub/quizzes/debrief")
async def generate_quiz_debrief(request: QuizDebriefRequest):
    """Generate Socratic Misconception Debriefs for missed practice quiz questions."""
    if not request.missed_items:
        return {"debrief": [{"socratic_guidance": "Perfect score! Consider trying an AP/Undergrad challenge next to test edge cases.", "guiding_question": "What assumption would break if we removed an idealization in this topic?"}]}

    sys_prompt = (
        "You are EduSocrates conducting a post-quiz Socratic Misconception Debrief. "
        "Never scold the learner. Address WHY their chosen distractor looked tempting and ask ONE targeted guiding question."
    )
    user_prompt = (
        f"Subject: {request.subject}. Missed questions JSON: {json.dumps(request.missed_items[:8])}. "
        "Return ONLY JSON: {\"debrief\": [{\"question_text\":..., \"socratic_guidance\":..., \"guiding_question\":...}]}"
    )

    raw = await generate_llm_text(sys_prompt, user_prompt, temperature=0.3, json_mode=True)
    if raw:
        try:
            parsed = json.loads(raw)
            debrief = parsed.get("debrief", [])
            if isinstance(debrief, list) and debrief:
                return {"debrief": debrief}
        except Exception:
            pass

    fallback = []
    for item in request.missed_items:
        fallback.append({
            "question_text": item.get("question_text", ""),
            "socratic_guidance": item.get("misconception_explanation") or "Let's look closely at why your selected option differs from the governing rule.",
            "guiding_question": f"Comparing your choice ('{item.get('chosen_option', '')}') with the core concept in {request.subject}, what key condition did the distractor overlook?",
        })
    return {"debrief": fallback}


# ─── Knowledge Map Concept Checkpoint Evaluator ────────────────────────────── #

@router.post("/hub/concepts/evaluate")
async def evaluate_concept_checkpoint(request: ConceptEvaluateRequest):
    """Evaluate a learner's Socratic checkpoint explanation to unlock downstream DAG nodes."""
    sys_prompt = (
        "You are EduSocrates evaluating a student's conceptual explanation for a Knowledge Map checkpoint. "
        "Score 0-100 based on conceptual clarity (passing >= 70). Give encouraging Socratic feedback. "
        "Return ONLY JSON: {\"score\": int, \"passed\": bool, \"feedback\": str}."
    )
    user_prompt = (
        f"Concept: {request.node_title}\nDescription: {request.node_description}\n"
        f"Checkpoint Question: {request.checkpoint_prompt}\n"
        f"Student Answer: {request.student_answer}"
    )

    raw = await generate_llm_text(sys_prompt, user_prompt, temperature=0.2, json_mode=True)
    if raw:
        try:
            parsed = json.loads(raw)
            score = max(0, min(100, int(parsed.get("score", 75))))
            return {
                "score": score,
                "passed": bool(parsed.get("passed", score >= 70)),
                "feedback": str(parsed.get("feedback", "Thoughtful reasoning!")),
            }
        except Exception:
            pass

    # Deterministic heuristic rubric for mock/offline evaluation
    ans = (request.student_answer or "").strip()
    words = [w for w in ans.split() if len(w) > 2]
    if len(words) < 5:
        return {
            "score": 45,
            "passed": False,
            "feedback": "Great start, though your explanation is a bit brief! Try explaining WHY the principle works using a concrete example or mechanism (aim for at least a sentence or two).",
        }
    score = min(98, 70 + len(words) * 2)
    return {
        "score": score,
        "passed": True,
        "feedback": f"Well reasoned! You articulated key ideas behind {request.node_title}. Downstream concept nodes are now unlocked!",
    }


# ─── Peer Discussion AI Socratic Moderator ─────────────────────────────────── #

@router.post("/hub/discussions/moderate")
async def moderate_discussion(request: DiscussionModerateRequest):
    """Generate a Socratic AI guide reply for a peer learning discussion thread."""
    sys_prompt = (
        "You are EduSocrates acting as a neutral Socratic Moderator in a student peer discussion board. "
        "Do NOT give away the final answer. Synthesize the peers' thoughts and pose ONE clarifying question to deepen the thread."
    )
    user_prompt = (
        f"Subject: {request.subject_tag}\nThread Title: {request.thread_title}\nBody: {request.thread_body}\n"
        f"Recent replies: {json.dumps(request.recent_replies[-5:])}"
    )

    raw = await generate_llm_text(sys_prompt, user_prompt, temperature=0.35)
    if raw:
        return {"reply": raw}

    return {
        "reply": (
            f"Wonderful discussion on '{request.thread_title}'! 💡 To push this conversation deeper: "
            f"what core principle in {request.subject_tag} remains invariant across the examples mentioned above, "
            "and how would you test your hypothesis with a simple edge case?"
        )
    }


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
    if not entries:
        entries = [a for a in _audit_fallback if a.get("school_id") == school_id][::-1]

    if coursework_id:
        entries = [e for e in entries if e.get("coursework_id") == coursework_id]
    if flagged_only:
        entries = [e for e in entries if e.get("response_intercepted") or e.get("threat_level") == "BLOCKED"]

    entries = entries[:limit]
    return {"school_id": school_id, "total_entries": len(entries), "entries": entries}


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
        entries = sorted(_audit_fallback, key=lambda e: e.get("timestamp", 0), reverse=True)[:limit]
    return {"total_entries": len(entries), "entries": entries}


# ─── Health ───────────────────────────────────────────────────────────────── #

@router.get("/health")
async def health():
    redis = await redis_client.get_redis()
    return {
        "status": "ok",
        "service": "EduSocrates AI Gateway",
        "version": "2.3.0",
        "redis": "connected" if redis else "unavailable (fallback active)",
    }
