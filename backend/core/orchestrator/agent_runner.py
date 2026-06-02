"""
Apex Intel — Agent Runner (Retry Wrapper)
============================================

This module provides **run_agent()** — a resilient wrapper around any
``BaseAgent.run()`` call.  It adds three layers of protection:

1. **Timeout** — ``asyncio.wait_for`` kills the call if it exceeds the limit.
2. **Retries** — transient failures (network blips, LLM rate limits) are
   retried with exponential backoff.
3. **Standardised error output** — on final failure, a consistent error dict
   is returned so the pipeline can continue gracefully.

Why a separate module?
-----------------------
Retry logic is *cross-cutting* — every agent needs it, but no individual
agent should own it.  Keeping it here follows the
`Single Responsibility Principle <https://en.wikipedia.org/wiki/Single-responsibility_principle>`_.

Usage::

    from backend.core.orchestrator.agent_runner import run_agent
    from backend.agents.market_agent import MarketAgent

    agent = MarketAgent()
    result = await run_agent(agent, context={"company_brief": {...}})
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import TYPE_CHECKING

from backend.config.settings import settings

if TYPE_CHECKING:
    # Avoid importing at runtime to prevent circular imports.
    # TYPE_CHECKING is False at runtime, True only for type checkers.
    from backend.agents.base_agent import BaseAgent

# ── Logger ────────────────────────────────────────────────────────────────
# Each agent run is logged with timing information so you can spot slow
# agents or repeated failures in production.
logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════════════════════
# Core function: run_agent
# ══════════════════════════════════════════════════════════════════════════════
async def run_agent(
    agent: "BaseAgent",
    context: dict,
    max_retries: int | None = None,
    timeout: int | None = None,
) -> dict:
    """Execute an agent with timeout enforcement and automatic retries.

    This function wraps ``agent.run(context)`` with:

    *   **Timeout** — if the agent doesn't finish in ``timeout`` seconds,
        ``asyncio.TimeoutError`` is raised and the attempt is counted.
    *   **Exponential back-off** — after each failure the function sleeps
        ``2^attempt`` seconds (1 s, 2 s, 4 s …) before retrying.
    *   **Graceful degradation** — after all retries are exhausted, a
        standardised error dict is returned instead of raising.

    Args:
        agent:       Any object implementing ``BaseAgent.run(context)``.
        context:     Dict of inputs the agent needs (varies by agent).
        max_retries: How many times to retry after a failure.
                     Defaults to ``settings.AGENT_MAX_RETRIES``.
        timeout:     Max seconds per attempt.
                     Defaults to ``settings.AGENT_TIMEOUT_SECONDS``.

    Returns:
        The agent's output dict on success, or an error dict on failure::

            {
                "status": "failed",
                "agent": "<agent.name>",
                "error": "<error description>"
            }
    """
    # Fall back to global settings if caller didn't override.
    if max_retries is None:
        max_retries = settings.AGENT_MAX_RETRIES
    if timeout is None:
        timeout = settings.AGENT_TIMEOUT_SECONDS

    last_error: str = ""  # Track the most recent error message for reporting.

    for attempt in range(1, max_retries + 2):
        # ── Attempt header ───────────────────────────────────────────────
        logger.info(
            "[AgentRunner] %s — attempt %d/%d (timeout=%ds)",
            agent.name,
            attempt,
            max_retries + 1,
            timeout,
        )
        start_time = time.monotonic()

        try:
            # asyncio.wait_for wraps the coroutine with a deadline.
            # If the agent exceeds `timeout` seconds, TimeoutError is raised.
            result: dict = await asyncio.wait_for(
                agent.run(context),
                timeout=timeout,
            )

            elapsed = time.monotonic() - start_time
            logger.info(
                "[AgentRunner] %s — succeeded in %.2fs",
                agent.name,
                elapsed,
            )
            return result

        except asyncio.TimeoutError:
            elapsed = time.monotonic() - start_time
            last_error = f"Timed out after {elapsed:.1f}s (limit: {timeout}s)"
            logger.warning(
                "[AgentRunner] %s — %s (attempt %d/%d)",
                agent.name,
                last_error,
                attempt,
                max_retries + 1,
            )

        except Exception as exc:
            elapsed = time.monotonic() - start_time
            last_error = f"{type(exc).__name__}: {exc}"
            logger.warning(
                "[AgentRunner] %s — error after %.2fs: %s (attempt %d/%d)",
                agent.name,
                elapsed,
                last_error,
                attempt,
                max_retries + 1,
            )

        # ── Exponential back-off (skip sleep after the final attempt) ────
        if attempt <= max_retries:
            backoff_seconds = 2 ** (attempt - 1)  # 1s, 2s, 4s, 8s …
            logger.info(
                "[AgentRunner] %s — backing off %ds before retry",
                agent.name,
                backoff_seconds,
            )
            await asyncio.sleep(backoff_seconds)

    # ── All retries exhausted — return a standardised error object ────────
    error_result = _build_error_result(agent.name, last_error)
    logger.error(
        "[AgentRunner] %s — FAILED after %d attempts. Last error: %s",
        agent.name,
        max_retries + 1,
        last_error,
    )
    return error_result


# ══════════════════════════════════════════════════════════════════════════════
# Helper: build a consistent error dict
# ══════════════════════════════════════════════════════════════════════════════
def _build_error_result(agent_name: str, error_message: str) -> dict:
    """Create the standardised error dict returned on final failure.

    This format is understood by the orchestrator, which records it in the
    pipeline context's ``errors`` list and proceeds with the remaining agents.

    Args:
        agent_name:    The ``name`` attribute of the failed agent.
        error_message: Human-readable description of the failure.

    Returns:
        A dict with keys ``status``, ``agent``, and ``error``.
    """
    return {
        "status": "failed",
        "agent": agent_name,
        "error": error_message,
    }
