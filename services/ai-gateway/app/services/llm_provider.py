"""
LLM Provider abstraction — Layer 4 Constrained Inference (v2.3.0).
Supports: Mock (always available), Gemini, OpenAI (pluggable) for both streaming and structured tasks.
"""
import asyncio
import json
from typing import AsyncGenerator, List, Dict, Optional
from app.core.config import settings


class LLMMessage:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content


MOCK_SOCRATIC_RESPONSES = [
    "That's a great question! 🔍 Before we dive in, what do you already know about the fundamental principles at play here?",
    "Excellent thinking! Let's break this down step by step. What do you think the very first step in approaching this problem would be?",
    "I can see you're working through this carefully. 💡 Let's think about the relevant laws or theorems first — which one do you think applies in this scenario?",
    "Great attempt! Now, rather than jumping to the answer, consider: what quantities does the problem give you, and what does it ask you to find?",
    "You're on the right track! ✅ Let's verify: if you apply the concept you just mentioned, what would happen to the other variables in the equation?",
    "Interesting approach! What if we tried a simpler toy example first? Suppose the numbers were small and clean — how would the relationship behave?",
    "Let me ask you this: does direction or order matter here? Think carefully about the structure of the relationship before calculating.",
    "You've identified an important idea! Now, how would you express that relationship symbolically before substituting values?",
]

_mock_turn = 0


def _pick_mock_response(system_prompt: str, messages: List[Dict]) -> str:
    global _mock_turn
    last_msg = (messages[-1]["content"] if messages else "").lower()
    sp_lower = system_prompt.lower()

    if "code_debug" in sp_lower or "code debugger" in sp_lower or "traceback" in last_msg or "syntaxerror" in last_msg:
        return (
            "Let's trace your code line by line like a detective! 🔍 Look closely at the condition or variable update right before the error appears: "
            "what exact value or type does that variable hold on the first iteration versus the final step?"
        )
    if "check_my_logic" in sp_lower or "check my logic" in last_msg:
        return (
            "Nice job laying out your reasoning! 💡 Let's inspect your very first assumption carefully: "
            "does that premise hold under every boundary condition of the problem, or could a sign/unit/constraint change at the transition point?"
        )
    if "toy_problem" in sp_lower or "toy-problem" in sp_lower:
        return (
            "Let's warm up with a tiny parallel toy problem! 🧩 Suppose you have just 2 objects with masses 1 kg and 1 kg moving at 2 m/s toward each other. "
            "Before doing any algebra on your real problem, what happens to the total quantity in that simple case?"
        )

    resp = MOCK_SOCRATIC_RESPONSES[_mock_turn % len(MOCK_SOCRATIC_RESPONSES)]
    _mock_turn += 1
    return resp


async def mock_stream(system_prompt: str, messages: List[Dict], temperature: float) -> AsyncGenerator[str, None]:
    """Deterministic mock Socratic streaming response generator."""
    response_text = _pick_mock_response(system_prompt, messages)
    words = response_text.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words) - 1 else "")
        await asyncio.sleep(0.025)


async def gemini_stream(system_prompt: str, messages: List[Dict], temperature: float) -> AsyncGenerator[str, None]:
    import httpx
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not configured. Use DEFAULT_PROVIDER=mock for testing.")

    contents = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})

    payload = {
        "contents": contents,
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": 1024,
            "stopSequences": [],
        },
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key={settings.GEMINI_API_KEY}"

    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream("POST", url, json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.startswith("data:"):
                    data_str = line[5:].strip()
                    if data_str and data_str != "[DONE]":
                        try:
                            chunk = json.loads(data_str)
                            for cand in chunk.get("candidates", []):
                                for part in cand.get("content", {}).get("parts", []):
                                    if "text" in part:
                                        yield part["text"]
                        except json.JSONDecodeError:
                            continue


async def openai_stream(system_prompt: str, messages: List[Dict], temperature: float) -> AsyncGenerator[str, None]:
    import httpx
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not configured.")

    openai_messages = [{"role": "system", "content": system_prompt}] + messages
    payload = {
        "model": "gpt-4o-mini",
        "messages": openai_messages,
        "temperature": temperature,
        "stream": True,
        "max_tokens": 1024,
    }
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream("POST", "https://api.openai.com/v1/chat/completions", json=payload, headers=headers) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data:"):
                    data_str = line[5:].strip()
                    if data_str == "[DONE]":
                        return
                    try:
                        chunk = json.loads(data_str)
                        delta = chunk["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield delta
                    except (json.JSONDecodeError, KeyError):
                        continue


async def stream_llm_response(
    system_prompt: str,
    messages: List[Dict[str, str]],
    temperature: Optional[float] = None,
) -> AsyncGenerator[str, None]:
    """Layer 4: Constrained LLM Inference."""
    temp = temperature if temperature is not None else settings.LLM_TEMPERATURE
    provider = settings.DEFAULT_PROVIDER.lower()

    if provider == "gemini" and settings.GEMINI_API_KEY:
        async for token in gemini_stream(system_prompt, messages, temp):
            yield token
    elif provider == "openai" and settings.OPENAI_API_KEY:
        async for token in openai_stream(system_prompt, messages, temp):
            yield token
    else:
        async for token in mock_stream(system_prompt, messages, temp):
            yield token


async def generate_llm_text(
    system_prompt: str,
    user_prompt: str,
    temperature: Optional[float] = None,
    json_mode: bool = False,
) -> Optional[str]:
    """
    Non-streaming LLM call for structured Hub tasks (flashcards, quizzes,
    checkpoint evaluations, misconception debriefs, and discussion moderation).
    Returns None when running under mock provider so callers use deterministic builders.
    """
    import httpx
    temp = temperature if temperature is not None else settings.LLM_TEMPERATURE
    provider = settings.DEFAULT_PROVIDER.lower()

    if provider == "gemini" and settings.GEMINI_API_KEY:
        gen_cfg: Dict = {"temperature": temp, "maxOutputTokens": 2048}
        if json_mode:
            gen_cfg["responseMimeType"] = "application/json"
        payload = {
            "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "generationConfig": gen_cfg,
        }
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
        try:
            async with httpx.AsyncClient(timeout=45) as client:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                data = resp.json()
                parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                return "".join(p.get("text", "") for p in parts).strip() or None
        except Exception:
            return None

    if provider == "openai" and settings.OPENAI_API_KEY:
        payload: Dict = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temp,
            "max_tokens": 2048,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=45) as client:
                resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip() or None
        except Exception:
            return None

    return None
