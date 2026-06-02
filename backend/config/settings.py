"""
Apex Intel — Application Settings
===================================

This module centralises **every configuration knob** the application needs.
Values are loaded from environment variables (and optionally from a `.env`
file), so nothing secret ever lives in source code.

How it works
------------
1.  `pydantic-settings` reads env vars that match the field names
    (case-insensitive by default).
2.  If a `.env` file exists in the project root it is loaded automatically,
    which is handy for local development.
3.  A **single global instance** (`settings`) is created at module level so
    every other module can simply do:
        ``from backend.config.settings import settings``

Why pydantic-settings?
----------------------
*   Automatic type-coercion (e.g. ``"True"`` → ``True``).
*   Validation at startup — the app crashes immediately with a clear error
    if a required key like ``OPENAI_API_KEY`` is missing.
*   IDE auto-complete and type-safety across the entire codebase.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Master settings object — one source of truth for the whole app."""

    # ── Application Metadata ─────────────────────────────────────────────
    APP_NAME: str = "Apex Intel"
    DEBUG: bool = False  # Flip to True locally for verbose logs

    # ── Database ─────────────────────────────────────────────────────────
    # The connection string uses `asyncpg` as the async driver for PostgreSQL.
    # Format: postgresql+asyncpg://<user>:<password>@<host>:<port>/<dbname>
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/apex_intel"
    )

    # ── OpenAI / LLM ────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""  # REQUIRED — set via env or .env
    OPENAI_MODEL: str = "gpt-4o"  # The default model for all agent calls
    OPENAI_TEMPERATURE: float = 0.2  # Low temperature for deterministic output
    OPENAI_MAX_TOKENS: int = 4096    # Maximum tokens per LLM response

    # ── Web Search (Serper.dev) ──────────────────────────────────────────
    # Serper provides a simple REST API for Google search results.
    SERPER_API_KEY: str = ""  # REQUIRED for web-search agents

    # ── Redis (optional caching / task queue) ────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ── Agent Behaviour ──────────────────────────────────────────────────
    AGENT_TIMEOUT_SECONDS: int = 60  # Max seconds an agent may run
    AGENT_MAX_RETRIES: int = 2       # Retry count on transient failures

    # ── CORS ─────────────────────────────────────────────────────────────
    # Which origins are allowed to call our API.  In production, replace
    # this with the actual frontend domain(s).
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── Pydantic-settings configuration ──────────────────────────────────
    # `model_config` tells pydantic-settings *how* to discover values.
    #   • env_file      – path to the dotenv file
    #   • env_file_encoding – encoding of that file
    #   • case_sensitive – env var names are matched case-insensitively
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# ---------------------------------------------------------------------------
# Global singleton — import this everywhere:
#     from backend.config.settings import settings
# ---------------------------------------------------------------------------
settings = Settings()
