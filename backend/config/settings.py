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

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Master settings object — one source of truth for the whole app."""

    # ── Application Metadata ─────────────────────────────────────────────
    APP_NAME: str = "Apex Intel"
    DEBUG: bool = False  # Flip to True locally for verbose logs

    # ── Authentication ─────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-for-development-only"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    GOOGLE_CLIENT_ID: str = "placeholder-client-id.apps.googleusercontent.com"

    # ── Monetization & Pricing Configuration ──────────────────────────────
    # Limits and base prices are now centralized in backend.core.subscription
    
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_PRO_LITE: str = ""
    STRIPE_PRICE_PRO: str = ""
    STRIPE_PRICE_CREDIT: str = ""

    ANALYSIS_MODE_OPTIMIZED: str = "optimized"
    ANALYSIS_MODE_FULL: str = "full"

    # ── Database ─────────────────────────────────────────────────────────
    # The connection string uses `asyncpg` as the async driver for PostgreSQL.
    # Format: postgresql+asyncpg://<user>:<password>@<host>:<port>/<dbname>
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/apex_intel"
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_database_url_scheme(cls, v: str) -> str:
        """
        Railway and other PaaS providers expose DATABASE_URL starting with
        postgresql:// or postgres://. We must rewrite it to postgresql+asyncpg://
        for our async driver to work.
        """
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # ── LLM Configuration ───────────────────────────────────────────────
    LLM_PROVIDER: str = "gemini"  # e.g. "gemini", "openai" (future)
    GEMINI_API_KEY: str = ""      # REQUIRED if provider is gemini
    FREE_MODEL: str = "gemini-2.5-flash"
    PREMIUM_MODEL: str = "gemini-2.5-flash"
    GEMINI_TEMPERATURE: float = 0.2
    GEMINI_MAX_TOKENS: int = 8192
    LLM_MAX_CONCURRENT_REQUESTS: int = 2  # Limits concurrent API calls (set to 1 for free tier)

    # ── Web Search (Serper.dev) ──────────────────────────────────────────
    # Serper provides a simple REST API for Google search results.
    SERPER_API_KEY: str = ""  # REQUIRED for web-search agents

    # ── Redis (optional caching / task queue) ────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ── Agent Behaviour ──────────────────────────────────────────────────
    AGENT_TIMEOUT_SECONDS: int = 60
    AGENT_MAX_RETRIES: int = 2

    # ── Auth Configuration ──────────────────────────────────────────────────
    JWT_SECRET: str = ""
    GOOGLE_CLIENT_ID: str = ""

    # ── Rate Limiting ────────────────────────────────────────────────────────
    RATE_LIMIT_FREE: str = "5/minute"
    RATE_LIMIT_PRO_LITE: str = "15/minute"
    RATE_LIMIT_PRO: str = "30/minute"
    RATE_LIMIT_ADMIN: str = "100/minute"

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
        extra="ignore",
    )


# ---------------------------------------------------------------------------
# Global singleton — import this everywhere:
#     from backend.config.settings import settings
# ---------------------------------------------------------------------------
settings = Settings()
