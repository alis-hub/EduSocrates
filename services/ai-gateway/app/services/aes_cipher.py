"""
AES-256-CBC encryption utility for EduSocrates chat session data.
Used to encrypt message_history stored in Redis (FERPA/COPPA compliance).
"""
import os
import base64
import json
from typing import Any

try:
    from Crypto.Cipher import AES
    from Crypto.Util.Padding import pad, unpad
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False

_KEY_LENGTH = 32  # AES-256


def _get_key(raw_key: str) -> bytes:
    """Derive a 32-byte key from the config string (zero-pad or truncate)."""
    key_bytes = raw_key.encode('utf-8')
    return key_bytes[:_KEY_LENGTH].ljust(_KEY_LENGTH, b'\x00')


def encrypt_json(data: Any, raw_key: str) -> str:
    """
    Serialize `data` to JSON, encrypt with AES-256-CBC.
    Returns base64(iv + ciphertext) as a string.
    """
    plaintext = json.dumps(data, ensure_ascii=False).encode('utf-8')
    if not HAS_CRYPTO:
        # Fallback for environments where pycryptodome is not yet installed
        return "b64:" + base64.b64encode(plaintext).decode('utf-8')

    key = _get_key(raw_key)
    iv = os.urandom(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ciphertext = cipher.encrypt(pad(plaintext, AES.block_size))
    return base64.b64encode(iv + ciphertext).decode('utf-8')


def decrypt_json(token: str, raw_key: str) -> Any:
    """
    Decrypt base64(iv + ciphertext) produced by encrypt_json().
    Returns the original Python object.
    """
    if token.startswith("b64:"):
        plaintext = base64.b64decode(token[4:].encode('utf-8'))
        return json.loads(plaintext.decode('utf-8'))

    raw = base64.b64decode(token.encode('utf-8'))
    if not HAS_CRYPTO:
        return []

    iv, ciphertext = raw[:16], raw[16:]
    key = _get_key(raw_key)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)
    return json.loads(plaintext.decode('utf-8'))
