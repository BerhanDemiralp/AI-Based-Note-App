# cache.py
import os, json, hashlib
from typing import Optional, Any
import redis.asyncio as redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_TTL_SEC = int(os.getenv("CACHE_TTL_SEC", "21600"))  # 6 saat

_redis: Optional[redis.Redis] = None

def normalize_text(s: str) -> str:
    return (s or "").strip().replace("\r", " ").replace("\n", " ").strip()

def sha1(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()

async def cache_init():
    """App ömrünün başında çağırın."""
    global _redis
    _redis = redis.from_url(REDIS_URL, decode_responses=True)

async def cache_close():
    """App ömrünün sonunda çağırın."""
    global _redis
    if _redis:
        await _redis.close()
        _redis = None

async def cache_get_json(key: str) -> Optional[Any]:
    if not _redis:
        return None
    raw = await _redis.get(key)
    return json.loads(raw) if raw else None

async def cache_set_json(key: str, value: Any, ttl_sec: int = CACHE_TTL_SEC):
    if not _redis:
        return
    await _redis.set(key, json.dumps(value), ex=ttl_sec)

# Bu endpoint'e özel key yardımcıları (istersen genelleştirebilirsin)
def title_key(content: str, n: int, max_len: int) -> str:
    h = sha1(normalize_text(content))
    return f"ai:title:h:{h}:n:{n}:max:{max_len}"
