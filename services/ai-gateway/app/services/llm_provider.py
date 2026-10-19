"""
LLM Provider abstraction — Layer 4 Constrained Inference.
Supports: Mock (always available), Gemini, OpenAI (pluggable).
"""
import asyncio
import json
from typing import AsyncGenerator, List, Dict, Any, Optional
from app.core.config import settings


class LLMMessage:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content


# --------------------------------------------------------------------------- #
# Mock Provider (no API key required — deterministic Socratic responses)
# --------------------------------------------------------------------------- #

MOCK_SOCRATIC_RESPONSES = [
    "That's a great question! 🔍 Before we dive in, what do you already know about the fundamental principles at play here?",
    "Excellent thinking! Let's break this down step by step. What do you think the very first step in approaching this problem would be?",
    "I can see you're working through this carefully. 💡 Let's think about the relevant laws or theorems first — which one do you think applies in this scenario?",
    "Great attempt! Now, rather than jumping to the answer, consider: what quantities does the problem give you, and what does it ask you to find?",
    "You're on the right track! ✅ Let's verify: if you apply the concept you just mentioned, what would happen to the other variables in the equation?",
    "Interesting approach! What if we tried a simpler version of this problem first? For example, what would happen if the numbers were easier, like using 10 instead of the given values?",
    "Let me ask you this: does the direction of the values matter here? Think about what the problem is actually asking — is there a vector or scalar distinction?",
    "You've identified an important concept! Now, how would you set up the equation? Don't worry about calculating the final number yet — just write out the formula.",
]

_mock_turn = 0


async def mock_stream(system_prompt: str, messages: List[Dict], temperature: float) -> AsyncGenerator[str, None]:
    """Deterministic mock Socratic streaming response generator."""
    global _mock_turn
    response_text = MOCK_SOCRATIC_RESPONSES[_mock_turn % len(MOCK_SOCRATIC_RESPONSES)]
    _mock_turn += 1
    words = response_text.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words) - 1 else "")
        await asyncio.sleep(0.03)  # Simulates realistic token streaming latency


# --------------------------------------------------------------------------- #
# Gemini Provider (Google AI Studio API)
# --------------------------------------------------------------------------- #

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


# --------------------------------------------------------------------------- #
# OpenAI Provider
# --------------------------------------------------------------------------- #

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


# --------------------------------------------------------------------------- #
# Provider Dispatcher
# --------------------------------------------------------------------------- #

async def stream_llm_response(
    system_prompt: str,
    messages: List[Dict[str, str]],
    temperature: Optional[float] = None,
) -> AsyncGenerator[str, None]:
    """
    Layer 4: Constrained LLM Inference.
    Dispatches to configured provider at low temperature for Socratic reliability.
    """
    temp = temperature or settings.LLM_TEMPERATURE
    provider = settings.DEFAULT_PROVIDER.lower()
    
    if provider == "gemini":
        async for token in gemini_stream(system_prompt, messages, temp):
            yield token
    elif provider == "openai":
        async for token in openai_stream(system_prompt, messages, temp):
            yield token
    else:
        # Default: mock provider — always works without API keys
        async for token in mock_stream(system_prompt, messages, temp):
            yield token

