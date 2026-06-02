"""
Apex Intel — Caching Service
================================

Provides a simple **in-memory cache with time-to-live (TTL)** expiration.
This prevents redundant API calls (Serper searches, LLM queries) during
a single analysis run and across closely-spaced runs.

Architecture
-------------
::

    ┌─────────────────────────────────┐
    │         CacheService            │
    │  ┌───────────────────────────┐  │
    │  │   _store: dict            │  │
    │  │   key → (value, expiry)   │  │
    │  └───────────────────────────┘  │
    │                                 │
    │  get(key) → value | None        │
    │  set(key, value, ttl)           │
    │  delete(key)                    │
    │  clear()                        │
    │  _cleanup_expired()             │
    └─────────────────────────────────┘

Why in-memory?
---------------
*   Zero infrastructure required to get started.
*   Good enough for a single-process backend.

When to upgrade to Redis?
--------------------------
*   If you run multiple backend replicas (each has its own memory).
*   If cache data must survive process restarts.
*   Uncomment the ``RedisCacheService`` class below when ready.

Usage::

    from backend.services.cache_service import CacheService

    cache = CacheService()
    await cache.set("search:fintech", {"results": [...]}, ttl=1800)
    data = await cache.get("search:fintech")
"""

from __future__ import annotations

import logging
import time
from typing import Any

# ── Logger ────────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── Default TTL ──────────────────────────────────────────────────────────
DEFAULT_TTL_SECONDS = 3_600  # 1 hour


class CacheService:
    """In-memory key-value cache with automatic TTL expiration.

    Thread / task safety note:
        Python's GIL + the fact that all operations here are synchronous
        dict mutations (wrapped in async for API consistency) means this
        is safe for concurrent ``asyncio`` tasks within a single process.

    Attributes:
        _store: Internal dict mapping keys to ``(value, expiry_timestamp)``
                tuples.
    """

    def __init__(self) -> None:
        """Create a new empty cache."""
        # Each entry is stored as: key → (value, expires_at_timestamp)
        self._store: dict[str, tuple[Any, float]] = {}
        logger.info("[CacheService] Initialised in-memory cache")

    # ══════════════════════════════════════════════════════════════════════
    # GET
    # ══════════════════════════════════════════════════════════════════════
    async def get(self, key: str) -> Any | None:
        """Retrieve a value from the cache.

        If the key exists but has expired, it is silently removed and
        ``None`` is returned (as if it never existed).

        Args:
            key: The cache key to look up.

        Returns:
            The cached value, or ``None`` if not found / expired.
        """
        entry = self._store.get(key)

        if entry is None:
            logger.debug("[CacheService] MISS: %s", key)
            return None

        value, expires_at = entry

        # Check if the entry has expired.
        if time.time() > expires_at:
            logger.debug("[CacheService] EXPIRED: %s", key)
            del self._store[key]
            return None

        logger.debug("[CacheService] HIT: %s", key)
        return value

    # ══════════════════════════════════════════════════════════════════════
    # SET
    # ══════════════════════════════════════════════════════════════════════
    async def set(
        self,
        key: str,
        value: Any,
        ttl: int = DEFAULT_TTL_SECONDS,
    ) -> None:
        """Store a value in the cache with a TTL.

        If the key already exists, its value and TTL are overwritten.

        Args:
            key:   The cache key.
            value: The value to cache (any JSON-serialisable object).
            ttl:   Time-to-live in seconds (default: 3 600 = 1 hour).
        """
        expires_at = time.time() + ttl
        self._store[key] = (value, expires_at)
        logger.debug("[CacheService] SET: %s (TTL=%ds)", key, ttl)

        # Periodically clean up expired entries to prevent memory leaks.
        # We do this lazily — only when a write happens.
        self._cleanup_expired()

    # ══════════════════════════════════════════════════════════════════════
    # DELETE
    # ══════════════════════════════════════════════════════════════════════
    async def delete(self, key: str) -> bool:
        """Remove a specific key from the cache.

        Args:
            key: The cache key to remove.

        Returns:
            ``True`` if the key was found and removed, ``False`` otherwise.
        """
        if key in self._store:
            del self._store[key]
            logger.debug("[CacheService] DELETED: %s", key)
            return True

        logger.debug("[CacheService] DELETE miss: %s (key not found)", key)
        return False

    # ══════════════════════════════════════════════════════════════════════
    # CLEAR
    # ══════════════════════════════════════════════════════════════════════
    async def clear(self) -> None:
        """Remove **all** entries from the cache."""
        count = len(self._store)
        self._store.clear()
        logger.info("[CacheService] CLEARED %d entries", count)

    # ══════════════════════════════════════════════════════════════════════
    # Internal: clean up expired entries
    # ══════════════════════════════════════════════════════════════════════
    def _cleanup_expired(self) -> None:
        """Remove all entries whose TTL has passed.

        Called lazily during ``set()`` operations.  In a production system
        you might run this on a periodic background task instead.
        """
        now = time.time()
        # Build list of expired keys first to avoid modifying dict during iter.
        expired_keys = [
            key
            for key, (_, expires_at) in self._store.items()
            if now > expires_at
        ]

        for key in expired_keys:
            del self._store[key]

        if expired_keys:
            logger.debug(
                "[CacheService] Cleaned up %d expired entries", len(expired_keys)
            )

    # ══════════════════════════════════════════════════════════════════════
    # Diagnostics
    # ══════════════════════════════════════════════════════════════════════
    @property
    def size(self) -> int:
        """Return the number of entries currently in the cache."""
        return len(self._store)


# ══════════════════════════════════════════════════════════════════════════════
# OPTIONAL: Redis-backed cache (uncomment when ready)
# ══════════════════════════════════════════════════════════════════════════════
# To switch from in-memory to Redis:
#   1. pip install redis
#   2. Uncomment the class below.
#   3. Replace `CacheService()` with `RedisCacheService()` where needed.
#
# import json
# import redis.asyncio as aioredis
# from backend.config.settings import settings
#
#
# class RedisCacheService:
#     """Redis-backed cache — drop-in replacement for CacheService.
#
#     Benefits over in-memory:
#     *   Shared across multiple backend replicas.
#     *   Survives process restarts.
#     *   Built-in TTL support (no manual cleanup needed).
#     """
#
#     def __init__(self) -> None:
#         self._redis = aioredis.from_url(
#             settings.REDIS_URL,
#             encoding="utf-8",
#             decode_responses=True,
#         )
#         logger.info("[RedisCacheService] Connected to Redis at %s", settings.REDIS_URL)
#
#     async def get(self, key: str) -> Any | None:
#         raw = await self._redis.get(key)
#         if raw is None:
#             return None
#         return json.loads(raw)
#
#     async def set(self, key: str, value: Any, ttl: int = DEFAULT_TTL_SECONDS) -> None:
#         await self._redis.setex(key, ttl, json.dumps(value))
#
#     async def delete(self, key: str) -> bool:
#         result = await self._redis.delete(key)
#         return result > 0
#
#     async def clear(self) -> None:
#         await self._redis.flushdb()
