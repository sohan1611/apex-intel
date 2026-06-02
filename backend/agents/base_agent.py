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
from abc import ABC, abstractmethod
from typing import Any, Optional

from openai import AsyncOpenAI

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

    def __init__(self) -> None:
        """Initialise the agent with an OpenAI async client."""
        self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self._model = settings.OPENAI_MODEL

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

    # ─────────────────────────────────────────────────────────────────
    #  Shared utilities
    # ─────────────────────────────────────────────────────────────────
    async def _call_llm(self, user_prompt: str) -> str:
        """
        Send a prompt to the OpenAI Chat Completions API.

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
        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,  # Low temperature for factual analysis
        )
        return response.choices[0].message.content or ""

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

        # ── Attempt 1: Direct JSON parse ─────────────────────────────
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # ── Attempt 2: Extract from markdown code fences ─────────────
        # Matches ```json\n...\n``` or ```\n...\n```
        fence_pattern = r"```(?:json)?\s*\n(.*?)\n\s*```"
        match = re.search(fence_pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1).strip())
            except json.JSONDecodeError:
                pass

        # ── Attempt 3: Find any JSON object in the text ──────────────
        # Look for the first { ... } block
        brace_pattern = r"\{.*\}"
        match = re.search(brace_pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass

        # ── All attempts failed ──────────────────────────────────────
        logger.warning(
            "[%s] Failed to parse JSON from LLM response: %s",
            self.agent_name,
            text[:200],
        )
        return None

    def _build_error_output(self, error_message: str) -> dict[str, Any]:
        """
        Create a standardised error output dictionary.

        This ensures that ALL agents report failures in the same
        shape, making it easy for the orchestrator to detect and
        handle errors uniformly.

        Parameters
        ----------
        error_message : str
            Human-readable description of what went wrong.

        Returns
        -------
        dict
            Standardised error dict:
            ```
            {
                "agent": "<agent_name>",
                "status": "error",
                "error": "<error_message>",
                "data": None
            }
            ```
        """
        return {
            "agent": self.agent_name,
            "status": "error",
            "error": error_message,
            "data": None,
        }
