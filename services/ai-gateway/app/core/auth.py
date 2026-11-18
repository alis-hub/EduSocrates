"""Internal service authentication for the AI gateway.

Only the API gateway may call this service. It proves itself with a shared
secret sent in the X-Internal-Key header.
"""
import hmac
from typing import Optional

from fastapi import Header, HTTPException, status

from app.core.config import settings

_KNOWN_WEAK = {"", "changeme", "secret", "dev-secret", "default-secret"}


def is_production() -> bool:
    return settings.ENVIRONMENT.lower() == "production"


def validate_security_config() -> None:
    """Fail fast at startup on an unsafe configuration."""
    key = settings.AI_GATEWAY_API_KEY or ""
    if is_production() and (len(key) < 32 or key.lower() in _KNOWN_WEAK):
        raise RuntimeError("AI_GATEWAY_API_KEY must be set to a random value of 32+ characters in production")
    aes = settings.AES_ENCRYPTION_KEY or ""
    if not aes:
        if is_production():
            raise RuntimeError("AES_ENCRYPTION_KEY must be set in production")
        # Dev only: ephemeral random key, so sessions simply reset on restart.
        import logging, secrets
        logging.getLogger(__name__).warning("AES_ENCRYPTION_KEY not set; using an ephemeral key (dev only)")
        settings.AES_ENCRYPTION_KEY = secrets.token_hex(32)
    elif is_production() and len(aes) < 32:
        raise RuntimeError("AES_ENCRYPTION_KEY must be at least 32 characters")


async def require_internal_key(x_internal_key: Optional[str] = Header(default=None)) -> None:
    expected = settings.AI_GATEWAY_API_KEY
    if not expected:
        # Dev only: no key configured means open. Production refuses to start in this state.
        if is_production():
            raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Service not configured")
        return
    if not x_internal_key or not hmac.compare_digest(x_internal_key.encode(), expected.encode()):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Unauthorized")
