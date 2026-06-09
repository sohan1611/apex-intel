"""
Apex Intel — FastAPI Application Entry Point
==============================================

This is the **main** module that creates the FastAPI ``app`` instance,
wires up middleware, includes route modules, and defines lifecycle events.

How to run (development)
------------------------
::

    cd backend
    uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

Key concepts
------------
*   **Lifespan** — the ``lifespan`` async context manager runs code once
    at startup (e.g. creating database tables) and once at shutdown.
*   **CORS middleware** — allows the React frontend (default port 3000) to
    call the API without being blocked by the browser's Same-Origin Policy.
*   **Router inclusion** — routes live in separate files under
    ``api/routes/`` and are mounted here with a URL prefix.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config.settings import settings
from backend.db.connection import init_db


# ═══════════════════════════════════════════════════════════════════════════
# Lifespan — startup / shutdown logic
# ═══════════════════════════════════════════════════════════════════════════
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan handler.

    Everything **before** ``yield`` runs on startup;
    everything **after** ``yield`` runs on shutdown.
    """
    # ── Startup ──────────────────────────────────────────────────────────
    # Create all database tables that don't exist yet (development only)
    if settings.DEBUG:
        await init_db()

    yield  # ← The application is running and serving requests here.

    # ── Shutdown ─────────────────────────────────────────────────────────
    # Add cleanup logic here if needed (e.g. closing connection pools).
    pass


# ═══════════════════════════════════════════════════════════════════════════
# Create the FastAPI app
# ═══════════════════════════════════════════════════════════════════════════
app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Apex Intel — Autonomous AI-driven due-diligence platform.  "
        "Submit a company URL or text and receive a structured investment "
        "memo powered by a pipeline of specialised AI agents."
    ),
    version="0.1.0",
    lifespan=lifespan,
    # Produce cleaner docs URLs
    docs_url="/docs",
    redoc_url="/redoc",
)


# ═══════════════════════════════════════════════════════════════════════════
# Middleware
# ═══════════════════════════════════════════════════════════════════════════
# CORS — Cross-Origin Resource Sharing.
# Without this the browser blocks requests from http://localhost:3000
# to http://localhost:8000 because they are different *origins*.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # e.g. ["http://localhost:3000"]
    allow_credentials=True,               # Allow cookies / auth headers
    allow_methods=["*"],                  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],                  # Accept any request header
)


# ═══════════════════════════════════════════════════════════════════════════
# Include API routers
# ═══════════════════════════════════════════════════════════════════════════
# Routes are defined in separate modules to keep this file small and focused.
# We import them lazily inside a try/except so the app can still start even
# if the route modules haven't been created yet (useful during early dev).

try:
    from backend.api.routes.analyze import router as analyze_router  # noqa: E402

    app.include_router(
        analyze_router,
        prefix="/api/v1",
        tags=["Analysis"],
    )
except ImportError:
    # Route module not yet created — skip silently during early development.
    pass

try:
    from backend.api.routes.report import router as report_router  # noqa: E402

    app.include_router(
        report_router,
        prefix="/api/v1",
        tags=["Reports"],
    )
except ImportError:
    pass


# ═══════════════════════════════════════════════════════════════════════════
# Core endpoints (always available)
# ═══════════════════════════════════════════════════════════════════════════

@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    response_description="Service health status",
)
async def health_check() -> dict[str, str]:
    """Return a simple health-check response.

    Load balancers and container orchestrators (e.g. Kubernetes, Cloud Run)
    hit this endpoint to decide whether the instance is alive.
    """
    return {"status": "healthy", "service": settings.APP_NAME}


@app.get(
    "/",
    tags=["System"],
    summary="Root — application info",
)
async def root() -> dict[str, str]:
    """Return basic application metadata.

    Handy for quick sanity checks (``curl http://localhost:8000/``).
    """
    return {
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
    }
