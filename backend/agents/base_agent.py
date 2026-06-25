"""
backend/agents/base_agent.py
──────────────────────────────
Abstract base class for all Apex Intel AI agents.

Every specialised agent (MarketAgent, SkepticAgent, etc.) inherits
from `BaseAgent` and overrides:
  • `agent_name`    — unique identifier string
  • `system_prompt` — the LLM instruction for this agent
  • `run(context)`  — the main execution logic

The base class provides shared utilities:
  • `_call_llm()`            — sends a prompt to OpenAI and returns the text
  • `_parse_json_response()` — extracts JSON from LLM output (handles
                                markdown code fences)
  • `_build_error_output()`  — creates a standardised error dict so the
                                orchestrator can handle failures uniformly
"""

from __future__ import annotations

import json
import logging
import re
import asyncio
from abc import ABC, abstractmethod
from typing import Any, Optional

from google import genai
from google.genai import types
from tenacity import (
    retry,
    stop_after_attempt,
    wait_random_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

from backend.config.settings import settings

# ── Logger ───────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Abstract base class for all AI agents in the Apex Intel pipeline.

    Subclasses MUST implement:
      • `agent_name`    (property) — e.g. "market_analysis_agent"
      • `system_prompt` (property) — the system-level instruction
      • `run(context)`  (method)   — executes the agent's logic

    The constructor initialises an OpenAI async client using the API
    key from settings. All agents share the same model configuration.
    """

    # Global semaphore to limit concurrent requests across all agent instances
    _semaphore: asyncio.Semaphore | None = None

    def __init__(self, model_name: str = "gemini-2.5-flash") -> None:
        """Initialise the agent with an OpenAI async client."""
        if settings.LLM_PROVIDER == "gemini":
            self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
            self._model = model_name
        else:
            raise NotImplementedError(f"LLM Provider {settings.LLM_PROVIDER} is not currently supported.")

        self.prompt_tokens = 0
        self.completion_tokens = 0

        if BaseAgent._semaphore is None:
            # Create a shared semaphore for all instances to respect the global rate limit
            BaseAgent._semaphore = asyncio.Semaphore(settings.LLM_MAX_CONCURRENT_REQUESTS)

    # ─────────────────────────────────────────────────────────────────
    #  Abstract interface — subclasses MUST implement these
    # ─────────────────────────────────────────────────────────────────
    @property
    @abstractmethod
    def agent_name(self) -> str:
        """Return the unique name of this agent (e.g. 'skeptic_agent')."""
        ...

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """Return the system prompt that instructs the LLM."""
        ...

    @abstractmethod
    async def run(self, context: dict[str, Any]) -> dict[str, Any]:
        """
        Execute the agent's analysis.

        Parameters
        ----------
        context : dict
            The pipeline context containing input data and prior
            agent outputs.

        Returns
        -------
        dict
            The agent's structured output (JSON-serialisable).
        """
        ...

    def fallback_default(self) -> dict[str, Any]:
        """
        Return a minimal valid fallback schema if the agent completely fails.
        Subclasses should override this to provide a schema-compliant fallback.
        """
        return {}

    # ─────────────────────────────────────────────────────────────────
    #  Shared utilities
    # ─────────────────────────────────────────────────────────────────
    @retry(
        stop=stop_after_attempt(7),
        wait=wait_random_exponential(multiplier=2, min=3, max=65),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )
    async def _call_llm(self, user_prompt: str) -> str:
        """
        Send a prompt to the OpenAI Chat Completions API with retries.

        Parameters
        ----------
        user_prompt : str
            The user-role message to send.

        Returns
        -------
        str
            The assistant's reply text.

        Raises
        ------
        Exception
            If the API call fails (timeout, auth error, etc.).
        """
        if BaseAgent._semaphore is None:
             BaseAgent._semaphore = asyncio.Semaphore(settings.LLM_MAX_CONCURRENT_REQUESTS)

        async with BaseAgent._semaphore:
            logger.debug("[%s] Acquired LLM semaphore. Sending request...", self.agent_name)
            if settings.LLM_PROVIDER == "gemini":
                try:
                    response = await self._client.aio.models.generate_content(
                        model=self._model,
                        contents=user_prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=self.system_prompt,
                            temperature=settings.GEMINI_TEMPERATURE,
                            max_output_tokens=settings.GEMINI_MAX_TOKENS,
                            response_mime_type="application/json",
                        ),
                    )
                    
                    if hasattr(response, 'usage_metadata') and response.usage_metadata:
                        p_tokens = getattr(response.usage_metadata, 'prompt_token_count', 0)
                        c_tokens = getattr(response.usage_metadata, 'candidates_token_count', 0)
                        self.prompt_tokens += p_tokens
                        self.completion_tokens += c_tokens
                        
                        logger.info(
                            "TELEMETRY: agent=%s model=%s prompt_tokens=%d completion_tokens=%d",
                            self.agent_name, self._model, p_tokens, c_tokens
                        )

                    return response.text or ""
                except Exception as e:
                    logger.error("[%s] Gemini API Error: %s", self.agent_name, str(e))
                    raise Exception(f"API Error: {type(e).__name__} - {str(e)}") from e
            else:
                raise NotImplementedError(f"LLM Provider {settings.LLM_PROVIDER} is not currently supported.")

    def _parse_json_response(self, raw: str) -> dict[str, Any] | None:
        """
        Extract and parse JSON from an LLM response string.

        LLMs frequently wrap JSON output in markdown code fences like:
            ```json
            { "key": "value" }
            ```

        This method handles:
          1. Plain JSON strings
          2. JSON inside ```json ... ``` blocks
          3. JSON inside ``` ... ``` blocks (no language tag)
          4. JSON embedded in surrounding prose text
          5. Common trailing commas and missing brackets (basic cleanup)

        Parameters
        ----------
        raw : str
            The raw text response from the LLM.

        Returns
        -------
        dict | None
            The parsed JSON as a Python dict, or ``None`` if parsing
            fails entirely.
        """
        if not raw or not raw.strip():
            return None

        text = raw.strip()

        # Try multiple regex-based extractions if direct parse fails
        attempts = [text]

        # Extract from markdown code fences
        fence_pattern = r"```(?:json)?\s*\n(.*?)\n\s*```"
        match_fence = re.search(fence_pattern, text, re.DOTALL)
        if match_fence:
            attempts.append(match_fence.group(1).strip())

        # Extract first JSON object block
        brace_pattern = r"\{.*\}"
        match_brace = re.search(brace_pattern, text, re.DOTALL)
        if match_brace:
            attempts.append(match_brace.group(0))

        for attempt in attempts:
            # 1. Direct parse
            try:
                return json.loads(attempt)
            except json.JSONDecodeError:
                pass
            
            # 2. Cleanup basic issues (e.g., trailing commas, unescaped quotes)
            cleaned = re.sub(r',\s*\}', '}', attempt)
            cleaned = re.sub(r',\s*\]', ']', cleaned)
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                pass

        # All attempts failed
        logger.warning(
            "[%s] Failed to parse JSON from LLM response: %s",
            self.agent_name,
            text[:200],
        )
        return None

    def _build_error_output(self, error_message: str) -> dict[str, Any]:
        """
        Create a standardised error output dictionary containing fallback data.
        """
        fallback = self.fallback_default()
        fallback["status"] = "partial_failure"
        fallback["agent"] = self.agent_name
        fallback["error"] = error_message
        return fallback
