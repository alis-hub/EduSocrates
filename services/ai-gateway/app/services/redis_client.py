"""
Redis async client singleton for the AI Gateway.
Provides session storage and audit log persistence as replacements for in-memory dicts.
"""
import json
import time
from typing import Optional, Any, List
try:
    import redis.asyncio as aioredis
except ImportError:
    aioredis = None

from app.core.config import settings
from app.services.aes_cipher import encrypt_json, decrypt_json

_redis_client: Optional[Any] = None

SESSION_TTL = 4 * 60 * 60  # 4 hours
AUDIT_LOG_MAX_ENTRIES = 10_000


async def get_redis() -> Optional[Any]:
    """Return the Redis client, connecting lazily. Returns None if unavailable."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    if aioredis is None:
        return None
    try:
        _redis_client = aioredis.from_url(

            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        await _redis_client.ping()
        return _redis_client
    except Exception:
        _redis_client = None
        return None


# ── Session Helpers ─────────────────────────────────────────────────────────── #

async def session_get(session_id: str) -> Optional[dict]:
    """Retrieve session data from Redis (or None if not found / Redis down)."""
    redis = await get_redis()
    if redis is None:
        return None
    try:
        raw = await redis.get(f"session:{session_id}")
        if not raw:
            return None
        session = json.loads(raw)
        # Decrypt message_history if it was stored encrypted
        if 'message_history_enc' in session:
            session['message_history'] = decrypt_json(
                session.pop('message_history_enc'), settings.AES_ENCRYPTION_KEY
            )
        return session
    except Exception:
        return None


async def session_set(session_id: str, data: dict) -> None:
    """Persist session data to Redis with TTL. message_history is AES-256 encrypted."""
    redis = await get_redis()
    if redis is None:
        return
    try:
        # Work on a shallow copy so the caller's dict is unmodified
        stored = dict(data)
        if 'message_history' in stored:
            stored['message_history_enc'] = encrypt_json(
                stored.pop('message_history'), settings.AES_ENCRYPTION_KEY
            )
        await redis.setex(f"session:{session_id}", SESSION_TTL, json.dumps(stored))
    except Exception:
        pass


async def session_delete(session_id: str) -> None:
    """Remove a session from Redis."""
    redis = await get_redis()
    if redis is None:
        return
    try:
        await redis.delete(f"session:{session_id}")
    except Exception:
        pass


# ── Audit Log Helpers ───────────────────────────────────────────────────────── #

async def audit_append(school_id: str, entry: dict) -> None:
    """Append an audit entry to the school's audit list in Redis (LPUSH + LTRIM)."""
    redis = await get_redis()
    if redis is None:
        return
    try:
        key = f"audit:{school_id}"
        await redis.lpush(key, json.dumps(entry))
        await redis.ltrim(key, 0, AUDIT_LOG_MAX_ENTRIES - 1)
        # Keep audit log for 30 days
        await redis.expire(key, 30 * 24 * 60 * 60)
    except Exception:
        pass


async def audit_get(school_id: str, limit: int) -> List[dict]:
    """Fetch the most recent audit entries for a school."""
    redis = await get_redis()
    if redis is None:
        return []
    try:
        key = f"audit:{school_id}"
        raw_entries = await redis.lrange(key, 0, limit - 1)
        return [json.loads(e) for e in raw_entries]
    except Exception:
        return []


async def audit_get_all(limit: int) -> List[dict]:
    """Fetch audit entries across all schools (for Super Admin)."""
    redis = await get_redis()
    if redis is None:
        return []
    try:
        # Scan for all audit keys
        keys = []
        async for key in redis.scan_iter("audit:*"):
            keys.append(key)
        all_entries: List[dict] = []
        for key in keys:
            raw = await redis.lrange(key, 0, limit - 1)
            all_entries.extend(json.loads(e) for e in raw)
        # Sort by timestamp descending
        all_entries.sort(key=lambda e: e.get("timestamp", 0), reverse=True)
        return all_entries[:limit]
    except Exception:
        return []

