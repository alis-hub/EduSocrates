import re
from typing import Tuple

# Redaction regular expressions
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
# Phone numbers: only formats that are unmistakably phone numbers, so maths such as
# 3.14159265358979 or 1234567 is never touched. Pakistani formats come first.
PHONE_REGEX = re.compile(
    r'(?<![\d.])(?:'
    r'(?:\+|00)?92[-\s]?3\d{2}[-\s]?\d{7}'          # +92 3xx xxxxxxx
    r'|03\d{2}[-\s]?\d{7}'                           # 03xx xxxxxxx
    r'|\+\d{1,3}[-\s]?\(?\d{2,4}\)?[-\s]?\d{3,4}[-\s]?\d{3,4}'  # other international
    r')(?![\d])'
)
# CNIC: 12345-1234567-1 (dashed form only; 13 bare digits are too often just a number)
CNIC_REGEX = re.compile(r'(?<![\d.])\d{5}-\d{7}-\d(?!\d)')
STUDENT_ID_REGEX = re.compile(r'\b(STU|ID|SID)[\-_:]?\d{4,8}\b', re.IGNORECASE)
SSN_REGEX = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')

def redact_pii(text: str) -> Tuple[str, bool]:
    """
    Strips Student Personally Identifiable Information (email, phone, student ID, SSN)
    before sending prompts to LLM foundational APIs, to limit personal data sent to third-party model providers.
    Returns (redacted_text, was_redacted).
    """
    redacted = text
    modified = False
    
    if EMAIL_REGEX.search(redacted):
        redacted = EMAIL_REGEX.sub("[STUDENT_EMAIL_REDACTED]", redacted)
        modified = True
        
    if PHONE_REGEX.search(redacted):
        redacted = PHONE_REGEX.sub("[PHONE_REDACTED]", redacted)
        modified = True
        
    if STUDENT_ID_REGEX.search(redacted):
        redacted = STUDENT_ID_REGEX.sub("[STUDENT_ID_REDACTED]", redacted)
        modified = True
        
    if CNIC_REGEX.search(redacted):
        redacted = CNIC_REGEX.sub("[ID_REDACTED]", redacted)
        modified = True

    if SSN_REGEX.search(redacted):
        redacted = SSN_REGEX.sub("[ID_REDACTED]", redacted)
        modified = True
        
    return redacted, modified

