import re
from typing import Tuple

# Redaction regular expressions
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
PHONE_REGEX = re.compile(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}')
STUDENT_ID_REGEX = re.compile(r'\b(STU|ID|SID)[\-_:]?\d{4,8}\b', re.IGNORECASE)
SSN_REGEX = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')

def redact_pii(text: str) -> Tuple[str, bool]:
    """
    Strips Student Personally Identifiable Information (email, phone, student ID, SSN)
    before sending prompts to LLM foundational APIs, adhering to FERPA & COPPA.
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
        
    if SSN_REGEX.search(redacted):
        redacted = SSN_REGEX.sub("[ID_REDACTED]", redacted)
        modified = True
        
    return redacted, modified

