"""
AES-256-GCM encryption for GuruMera chat session data stored in Redis.

GCM is authenticated: tampered or wrongly-keyed ciphertext raises an error
instead of returning garbage. There is NO plaintext fallback — if encryption
is unavailable the service must fail, not silently store readable data.
"""
import base64
import hashlib
import json
import os
from typing import Any

from Crypto.Cipher import AES  # pycryptodome (required dependency)

_VERSION = b"\x02"  # format marker; v1 (CBC / "b64:") data is intentionally unreadable
_NONCE_LEN = 12
_TAG_LEN = 16


def _get_key(raw_key: str) -> bytes:
    """Derive a 32-byte key from the configured secret with SHA-256."""
    if not raw_key:
        raise ValueError("AES_ENCRYPTION_KEY is not configured")
    return hashlib.sha256(raw_key.encode("utf-8")).digest()


def encrypt_json(data: Any, raw_key: str) -> str:
    """Serialize `data` to JSON and encrypt. Returns base64(version | nonce | tag | ciphertext)."""
    plaintext = json.dumps(data, ensure_ascii=False).encode("utf-8")
    nonce = os.urandom(_NONCE_LEN)
    cipher = AES.new(_get_key(raw_key), AES.MODE_GCM, nonce=nonce, mac_len=_TAG_LEN)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    return base64.b64encode(_VERSION + nonce + tag + ciphertext).decode("ascii")


def decrypt_json(token: str, raw_key: str) -> Any:
    """Decrypt a token from encrypt_json(). Raises ValueError if invalid or tampered."""
    raw = base64.b64decode(token.encode("ascii"))
    if len(raw) < 1 + _NONCE_LEN + _TAG_LEN or raw[:1] != _VERSION:
        raise ValueError("Unsupported or corrupt ciphertext")
    nonce = raw[1:1 + _NONCE_LEN]
    tag = raw[1 + _NONCE_LEN:1 + _NONCE_LEN + _TAG_LEN]
    ciphertext = raw[1 + _NONCE_LEN + _TAG_LEN:]
    cipher = AES.new(_get_key(raw_key), AES.MODE_GCM, nonce=nonce, mac_len=_TAG_LEN)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return json.loads(plaintext.decode("utf-8"))
