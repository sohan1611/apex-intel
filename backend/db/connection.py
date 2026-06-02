"""
Apex Intel — Database Connection Layer
========================================

This module sets up the **async** database connection using SQLAlchemy 2.0
and the ``asyncpg`` PostgreSQL driver.

Key concepts for beginners
--------------------------
*   **Engine** — a factory that holds the connection pool and knows how to
    talk to the database.  We use ``create_async_engine`` because our FastAPI
    app is fully asynchronous.
*   **Session** — a short-lived "conversation" with the database where you
    execute queries.  Think of it like opening a tab at a coffee shop: you
    order (query), pay (commit), and leave (close).
*   **Dependency injection** — FastAPI's ``Depends(get_db)`` automatically
    creates a session for each request and closes it afterward, so route
    handlers never have to worry about cleanup.
*   **init_db()** — creates all tables defined in ``models.py``.  Called once
    at application startup.

Usage in a FastAPI route
------------------------
::

    from fastapi import Depends
    from sqlalchemy.ext.asyncio import AsyncSession
    from backend.db.connection import get_db

    @router.get("/items")
    async def list_items(db: AsyncSession = Depends(get_db)):
        result = await db.execute(select(Item))
        return result.scalars().all()
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from backend.config.settings import settings

# ── 1. Create the async engine ───────────────────────────────────────────
# `echo=True` logs every SQL statement — great for debugging, noisy in prod.
# `pool_pre_ping=True` tests connections before handing them out so stale
# connections from a restarted database are recycled automatically.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,          # Only log SQL when DEBUG is True
    pool_pre_ping=True,           # Prevent "connection lost" errors
    pool_size=10,                 # Max persistent connections in the pool
    max_overflow=20,              # Extra connections allowed under load
)

# ── 2. Create the session factory ────────────────────────────────────────
# `async_sessionmaker` returns a *class* — calling it later yields a new
# session instance.  We disable `expire_on_commit` so that objects remain
# usable after a commit without hitting the DB again.
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Keep attributes accessible after commit
)


# ── 3. FastAPI dependency — yields one session per request ───────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide a transactional database session to a FastAPI route.

    This is an *async generator dependency*.  FastAPI will:
    1. Call ``next()`` to get the session **before** the route runs.
    2. Inject it into the route handler.
    3. Call ``next()`` again **after** the route returns (the ``finally``
       block) to close the session — even if an exception occurred.

    Yields:
        An ``AsyncSession`` bound to the current request.
    """
    session: AsyncSession = async_session_maker()
    try:
        yield session
    finally:
        # Always close the session to return the connection to the pool.
        await session.close()


# ── 4. Table creation helper (startup) ───────────────────────────────────
async def init_db() -> None:
    """Create all tables that don't exist yet.

    This imports the ``Base`` metadata from ``models.py`` and issues
    ``CREATE TABLE IF NOT EXISTS`` statements for every registered model.

    .. note::
        For production migrations use **Alembic** instead.  This helper is
        a convenience for first-run / development setups.
    """
    # Import Base here (not at the top) to avoid circular imports — models.py
    # imports from this file's sibling, and we import Base from models.
    from backend.db.models import Base  # noqa: WPS433 (nested import)

    async with engine.begin() as conn:
        # `run_sync` bridges sync DDL methods into the async world.
        await conn.run_sync(Base.metadata.create_all)
