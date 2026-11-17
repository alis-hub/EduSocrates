import re
import unicodedata
from enum import Enum
from dataclasses import dataclass
from typing import List, Optional, Tuple

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
    # Case-sensitive on purpose: "Dan has 5 apples" is a normal maths question.
    (r"(?-i:\bDAN\b)", "jailbreak_persona"),
    (r"(you are|act as|pretend to be|roleplay as)\s+dan\b", "jailbreak_persona"),
    (r"do anything now", "jailbreak_persona"),
    (r"developer mode", "jailbreak_persona"),
    (r"jailbreak", "jailbreak_persona"),
    (r"as an? (AI|LLM|language model) without (safety|restrictions?|guidelines?)", "jailbreak_persona"),
    # Direct answer fishing
    (r"(just|simply|please|only)?\s*(give|tell|provide|show)\s+me\s+(the\s+)?(correct|right|final)?\s*(answer|solution|result)\b", "direct_answer"),
    (r"what is the answer (to|for) (question|problem|q)?\s*\d+", "direct_answer"),
    (r"solve (question|problem|task|q)\s*\d+\s+for me", "direct_answer"),
    # Roman Urdu answer fishing
    (r"(seedha|seedhe)\s+(jawab|jawaab|answer|hal)", "direct_answer"),
    (r"(jawab|jawaab|answer|hal|solution)\s+(bata|batao|bta|btao|de|do)\s*(do|dein|den|dijiye|dena)?\b", "direct_answer"),
    (r"(homework|assignment|sawal|sawaal)\s+(kar|hal\s+kar)\s*(do|dein|dena|den)\b", "direct_answer"),
    # Roman Urdu overrides / prompt exposure
    (r"(pichl[ei]|purani|sab|saari|sari|tamam)\s+(hidayat|hidayaat|instructions?|rules?|ehkam|ahkam)\s+(ko\s+)?(bhool|bhul|nazar\s*andaz|ignore)", "system_override"),
    (r"(rules?|instructions?|hidayat|hidayaat)\s+(ko\s+)?(bhool|bhul|nazar\s*andaz)\s*(jao|karo|kar\s*do|do)", "system_override"),
    (r"(apni|system)\s+(instructions?|hidayat|hidayaat|prompt)\s+(batao|bata\s*do|dikhao|dikha\s*do|show)", "prompt_exposure"),
    # Urdu script: answer fishing, overrides, prompt exposure
    (r"(سیدھا|سیدھے)\s*(جواب|حل)", "direct_answer"),
    (r"(جواب|حل)\s*(بتا|بتاؤ|بتاو|بتائیں|بتایئے|دو|دیں|دے\s*دو|بتا\s*دو)", "direct_answer"),
    (r"(ہوم\s*ورک|اسائنمنٹ|سوال)\s*(حل\s*)?(کر)\s*(دو|دیں|دے)", "direct_answer"),
    (r"(پچھلی|پچھلے|تمام|سب|ساری)\s*(ہدایات|احکامات|اصول|قواعد)\s*(کو\s*)?(بھول|نظر\s*انداز|چھوڑ)", "system_override"),
    (r"(اپنی|سسٹم)\s*(ہدایات|پرامپٹ|پرومپٹ)\s*(بتاؤ|بتاو|دکھاؤ|دکھاو|ظاہر)", "prompt_exposure"),
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


# Arabic-Indic (٠-٩) and Extended Arabic-Indic / Urdu (۰-۹) digits -> ASCII, so "۴۲" matches an answer of "42".
_DIGIT_MAP = {**{0x0660 + i: 0x30 + i for i in range(10)}, **{0x06F0 + i: 0x30 + i for i in range(10)}}


def ascii_digits(text: str) -> str:
    return text.translate(_DIGIT_MAP)


def normalize_input(text: str) -> str:
    """Defeat trivial obfuscation before pattern matching: Unicode compatibility forms
    (full-width letters etc.), zero-width / invisible format characters, odd whitespace."""
    text = ascii_digits(unicodedata.normalize("NFKC", text))
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Cf")
    return re.sub(r"\s+", " ", text).strip()


def layer1_sanitize(text: str) -> GuardrailResult:
    """
    Layer 1: Pre-Sanitization & Pattern Matching.
    Scans raw student input against all known injection, jailbreak, and direct
    answer-extraction patterns.
    """
    matched: List[str] = []
    threat = ThreatLevel.SAFE
    intent = IntentCategory.EDUCATIONAL
    text = normalize_input(text)

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
    "answer key", "mark scheme", "model answer", "cheat on", "cheat in",
    "exam answers", "leaked exam", "bypass the", "plagiarize",
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



_FORMAT_NOISE = re.compile(r"[\s,_*`'\"\u00a0]+")


def _squash(text: str) -> str:
    """Lowercase, NFKC and drop spacing/markdown noise so '3 / 5', '3/5' and '**3/5**' all match."""
    return _FORMAT_NOISE.sub("", ascii_digits(unicodedata.normalize("NFKC", text)).lower())


def _term_in_text(term: str, text: str, squashed_text: str) -> bool:
    t = _squash(term)
    if not t:
        return False
    if len(t) < 3:
        # Very short answers ("5", "x") only count as whole tokens, or every reply would be blocked.
        return re.search(r"(?<![\w.])" + re.escape(term.strip()) + r"(?![\w.])", text, re.IGNORECASE) is not None
    return t in squashed_text


def layer5_verify_output(response_chunk: str, answer_key_terms: List[str]) -> Tuple[bool, str]:
    """
    Layer 5: output verification.
    Scans the accumulated LLM response for teacher answer-key terms (tolerant of spacing and
    markdown formatting), full solution code blocks, and naked final-answer patterns.
    Returns (is_safe, safe_response_or_chunk).
    """
    redirect = (
        "\n\n[GuruMera Filter Triggered]: Let's step back and approach this differently. "
        "I want you to think about what concepts are at play here — "
        "can you identify the first principle that might apply to this problem? "
        "Walk me through your initial reasoning. 🔍"
    )
    squashed = _squash(response_chunk)
    for term in answer_key_terms:
        if _term_in_text(term, response_chunk, squashed):
            return False, redirect
    if _CODE_BLOCK_PATTERN.search(response_chunk):
        return False, redirect
    if answer_key_terms and _NAKED_ANSWER_PATTERN.search(response_chunk):
        return False, redirect
    return True, response_chunk


class StreamGuard:
    """Releases streamed text only after it has been checked.

    The old loop yielded each token as soon as it arrived, so an answer split across tokens
    ("3", "/", "5") was partly on its way to the student before the filter could see all of it.
    StreamGuard holds back the tail of the stream (longer than any answer-key term) and any
    unfinished code block, and only releases text that can no longer become part of a leak.
    """

    def __init__(self, answer_key_terms: List[str]):
        self.terms = answer_key_terms
        self.buf = ""
        self.released = 0
        longest = max((len(t) for t in answer_key_terms), default=0)
        self.holdback = min(longest * 2 + 8, 300) if answer_key_terms else 0

    def feed(self, token: str) -> Tuple[Optional[str], Optional[str]]:
        """Returns (text_to_send, redirect). If redirect is not None the stream must stop."""
        self.buf += token
        ok, msg = layer5_verify_output(self.buf, self.terms)
        if not ok:
            return None, msg
        upto = max(self.released, len(self.buf) - self.holdback)
        if self.buf.count("```") % 2 == 1:  # inside an unfinished code block: keep it back
            upto = min(upto, self.buf.rfind("```"))
            upto = max(upto, self.released)
        out = self.buf[self.released:upto]
        self.released = upto
        return out, None

    def flush(self) -> str:
        out = self.buf[self.released:]
        self.released = len(self.buf)
        return out
