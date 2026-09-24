"""Redis service — connection pool and caching utilities."""
import redis.asyncio as redis
from app.config import settings

redis_client = redis.from_url(
    settings.REDIS_URL,
    max_connections=settings.REDIS_MAX_CONNECTIONS,
    decode_responses=True,
)


async def get_cache(key: str):
    """Get value from cache."""
    return await redis_client.get(key)


async def set_cache(key: str, value: str, ttl: int = 300):
    """Set value in cache with TTL."""
    await redis_client.setex(key, ttl, value)


async def delete_cache(key: str):
    """Delete value from cache."""
    await redis_client.delete(key)


async def increment_rate_limit(key: str, window: int = 60) -> int:
    """Sliding window rate limiter using Redis."""
    pipe = redis_client.pipeline()
    now = int(time.time())
    window_key = f"ratelimit:{key}:{now // window}"
    
    pipe.incr(window_key)
    pipe.expire(window_key, window + 1)
    results = await pipe.execute()
    
    return results[0]
