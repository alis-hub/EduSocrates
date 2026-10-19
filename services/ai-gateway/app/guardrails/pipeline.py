import re
from enum import Enum
from dataclasses import dataclass
from typing import List, Tuple

class ThreatLevel(str, Enum):
    SAFE = "SAFE"
    SUSPICIOUS = "SUSPICIOUS"
    BLOCKED = "BLOCKED"

class IntentCategory(str, Enum):
    EDUCATIONAL = "EDUCATIONAL"
    DIRECT_ANSWER_REQUEST = "DIRECT_ANSWER_REQUEST"
    EXAM_SOLVER_EXPLOIT = "EXAM_SOLVER_EXPLOIT"
    SYSTEM_OVERRIDE = "SYSTEM_OVERRIDE"
    PROMPT_INJECTION = "PROMPT_INJECTION"

@dataclass
class GuardrailResult:
    threat_level: ThreatLevel
    intent_category: IntentCategory
    matched_patterns: List[str]
    sanitized_text: str

# --------------------------------------------------------------------------- #
# Layer 1: Pre-Sanitization – Regex & heuristic pattern matching
# --------------------------------------------------------------------------- #

INJECTION_PATTERNS: List[Tuple[str, str]] = [
    # System prompt overrides
    (r"ignore\s+(previous|prior|above|all)\s+(instructions?|prompts?|rules?|constraints?)", "system_override"),
    (r"forget\s+(everything|all)\s+(you\s+)?(know|were told)", "system_override"),
    (r"you are now\b.{0,80}(without|no)\s+restriction", "system_override"),
    (r"pretend\s+you\s+(have no|don'?t have)\s+(rule|filter|guideline|safety)", "system_override"),
    # DAN / jailbreak personas
    (r"\bDAN\b", "jailbreak_persona"),
    (r"do anything now", "jailbreak_persona"),
    (r"developer mode", "jailbreak_persona"),
    (r"jailbreak", "jailbreak_persona"),
    (r"as an? (AI|LLM|language model) without (safety|restrictions?|guidelines?)", "jailbreak_persona"),
    # Direct answer fishing
    (r"(just|simply|please|only)?\s*(give|tell|provide|show)\s+me\s+(the\s+)?(correct|right|final)?\s*(answer|solution|result)\b", "direct_answer"),
    (r"what is the answer (to|for) (question|problem|q)?\s*\d+", "direct_answer"),
    (r"solve (question|problem|task|q)\s*\d+\s+for me", "direct_answer"),
    # Base64 encoded payloads (commonly smuggled instructions)
    (r"base64\s*(decode|encode)", "encoded_payload"),
    (r"[A-Za-z0-9+/]{30,}={0,2}", "long_base64"),
    # System prompt exposure
    (r"(reveal|show|print|output|display)\s+(your\s+)?(system\s+)?(prompt|instructions?|guidelines?|training)", "prompt_exposure"),
    (r"what are your (instructions?|rules?|guidelines?|constraints?)", "prompt_exposure"),
]

ANSWER_EXTRACTOR_PATTERNS: List[Tuple[str, str]] = [
    (r"(skip|bypass|avoid)\s+(the\s+)?(steps?|process|method|explanation|working)", "shortcut_exploit"),
    (r"i (don'?t|do not) (want|need|care about)\s+(an\s+)?(explanation|steps?|reasoning|working)", "shortcut_exploit"),
    (r"just\s+calculate\s+(it\s+)?for\s+me", "direct_answer"),
    (r"(complete|finish|do)\s+(this|my)\s+(homework|assignment|quiz|exam|test|worksheet)", "exam_solver"),
    (r"(write|complete|finish)\s+(all|every)\s+(the\s+)?(questions?|answers?)", "exam_solver"),
]

_INJECTION_COMPILED = [(re.compile(p, re.IGNORECASE), label) for p, label in INJECTION_PATTERNS]
_ANSWER_COMPILED = [(re.compile(p, re.IGNORECASE), label) for p, label in ANSWER_EXTRACTOR_PATTERNS]


def layer1_sanitize(text: str) -> GuardrailResult:
    """
    Layer 1: Pre-Sanitization & Pattern Matching.
    Scans raw student input against all known injection, jailbreak, and direct
    answer-extraction patterns.
    """
    matched: List[str] = []
    threat = ThreatLevel.SAFE
    intent = IntentCategory.EDUCATIONAL

    for pattern, label in _INJECTION_COMPILED:
        if pattern.search(text):
            matched.append(label)
            if label in ("system_override", "jailbreak_persona", "prompt_exposure", "encoded_payload"):
                threat = ThreatLevel.BLOCKED
                intent = IntentCategory.PROMPT_INJECTION
            elif label == "direct_answer" and threat == ThreatLevel.SAFE:
                threat = ThreatLevel.SUSPICIOUS
                intent = IntentCategory.DIRECT_ANSWER_REQUEST

    for pattern, label in _ANSWER_COMPILED:
        if pattern.search(text):
            matched.append(label)
            if label == "exam_solver":
                threat = ThreatLevel.BLOCKED
                intent = IntentCategory.EXAM_SOLVER_EXPLOIT
            elif threat == ThreatLevel.SAFE:
                threat = ThreatLevel.SUSPICIOUS
                intent = IntentCategory.DIRECT_ANSWER_REQUEST

    return GuardrailResult(
        threat_level=threat,
        intent_category=intent,
        matched_patterns=matched,
        sanitized_text=text,
    )


# --------------------------------------------------------------------------- #
# Layer 2: Semantic Intent Classification (lightweight keyword-based classifier)
# --------------------------------------------------------------------------- #

EDUCATIONAL_KEYWORDS = [
    "help me understand", "can you explain", "how does", "why is", "what does",
    "what is meant by", "i don't understand", "can you walk me through",
    "how would i", "what steps should", "hint", "guide", "clarify",
]

EXPLOIT_KEYWORDS = [
    "answer key", "mark scheme", "model answer", "cheat", "hack",
    "exam answer", "leak", "bypass", "copy", "plagiarize",
]


def layer2_classify_intent(text: str) -> IntentCategory:
    """
    Layer 2: Lightweight semantic intent classifier.
    Uses keyword proximity heuristics as a fast secondary guardrail.
    """
    lowered = text.lower()
    edu_score = sum(1 for kw in EDUCATIONAL_KEYWORDS if kw in lowered)
    exploit_score = sum(1 for kw in EXPLOIT_KEYWORDS if kw in lowered)

    if exploit_score > 0 and exploit_score >= edu_score:
        return IntentCategory.EXAM_SOLVER_EXPLOIT
    if edu_score > 0:
        return IntentCategory.EDUCATIONAL
    return IntentCategory.EDUCATIONAL


# --------------------------------------------------------------------------- #
# Layer 5: Output Verification Guardrail
# --------------------------------------------------------------------------- #

import re as _re

# Detects full code blocks that could contain a solution
_CODE_BLOCK_PATTERN = _re.compile(
    r'```(?:python|javascript|js|java|c\+\+|cpp|c|matlab|r|sql|bash|sh)?\s*\n[\s\S]{40,}?```',
    _re.MULTILINE | _re.DOTALL
)


# Detects naked final answer patterns: "x = 42", "F = 9.8 N", "answer = ...", "result: 3.14"
_NAKED_ANSWER_PATTERN = _re.compile(
    r'(?:(?:^|\b)(?:answer|result|solution|final answer|therefore|thus|hence|x|y|F|v|a|t|d|P|E|W)\s*[=:]\s*[\-\d\.\s\w\(\)\^/\*\+]+(?:kg|m|N|J|W|s|Hz|Pa|K|mol|A|V|Ω|eV|cal|\$)?(?:\b|$))',
    _re.IGNORECASE | _re.MULTILINE
)



def layer5_verify_output(response_chunk: str, answer_key_terms: List[str]) -> Tuple[bool, str]:
    """
    Layer 5: Real-time output verification.
    Scans accumulated LLM response chunk against known answer key terms,
    full solution code blocks, and naked final-answer patterns.
    If any direct answer signal is detected, intercept and return a safe Socratic redirect.
    Returns (is_safe, safe_response_or_chunk).
    """
    redirect = (
        "\n\n[EduSocrates Filter Triggered]: Let's step back and approach this differently. "
        "I want you to think about what concepts are at play here — "
        "can you identify the first principle that might apply to this problem? "
        "Walk me through your initial reasoning. 🔍"
    )
    lowered = response_chunk.lower()
    # Check teacher answer key terms
    for term in answer_key_terms:
        if term.lower() in lowered:
            return False, redirect
    # Check for full solution code blocks
    if _CODE_BLOCK_PATTERN.search(response_chunk):
        return False, redirect
    # Check for naked final answer patterns (only trigger if answer_key_terms present)
    # Only intercept if we also have an answer_key_term or the response ends abruptly
    if answer_key_terms and _NAKED_ANSWER_PATTERN.search(response_chunk):
        return False, redirect
    return True, response_chunk

