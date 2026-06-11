"""
data_agent.py — Data Structuring Agent
=======================================

Strips marketing fluff from raw company descriptions and extracts
objective, structured facts about the business.

**Input context keys:**
  - ``raw_input`` (str, required): Raw pitch-deck text or company
    description.
  - ``scraped_content`` (str, optional): Additional web-scraped content.

**Output keys:**
  - ``core_value_prop`` (str | None)
  - ``target_customer_segment`` (str | None)
  - ``revenue_model`` (str | None)
  - ``industry`` (str | None)
  - ``product_type`` (str | None)
"""

from __future__ import annotations

import logging
from typing import Any

from backend.agents.base_agent import BaseAgent
from backend.core.prompts import (
    DATA_STRUCTURING_SYSTEM_PROMPT,
    DATA_STRUCTURING_USER_PROMPT,
)

logger = logging.getLogger(__name__)

# The fields we expect in the LLM's JSON response
_EXPECTED_KEYS: list[str] = [
    "core_value_prop",
    "target_customer_segment",
    "revenue_model",
    "industry",
    "product_type",
]


class DataAgent(BaseAgent):
    """Agent that structures raw company data into objective facts.

    Takes raw input text (pitch deck, website copy, etc.) and optional
    scraped content, then produces a clean, structured representation
    of the company's core attributes.
    """

    @property
    def agent_name(self) -> str:
        return "DataAgent"

    @property
    def system_prompt(self) -> str:
        return DATA_STRUCTURING_SYSTEM_PROMPT

    def __init__(self) -> None:
        super().__init__()

    def fallback_default(self) -> dict[str, Any]:
        return {
            "core_value_prop": "Unknown",
            "target_customer_segment": "Unknown",
            "revenue_model": "Unknown",
            "industry": "Unknown",
            "product_type": "Unknown",
        }

    async def run(self, context: dict) -> dict:
        """Execute data structuring analysis.

        Args:
            context: Must contain ``raw_input`` (str).
                     Optionally ``scraped_content`` (str).

        Returns:
            Structured dict with the five company-fact fields,
            or a standardised error dict on failure.
        """
        try:
            # ── 1. Extract inputs ─────────────────────────────────────────
            raw_input: str = context.get("raw_input", "")
            if not raw_input:
                return self._build_error_output(
                    "Missing required field: 'raw_input'"
                )

            # Gracefully handle missing or empty scraped_content
            scraped_content: str = context.get("scraped_content") or ""
            if not scraped_content:
                scraped_content = "No additional scraped content available."

            # ── 2. Build the prompt ───────────────────────────────────────
            user_prompt = DATA_STRUCTURING_USER_PROMPT.format(
                raw_input=raw_input,
                scraped_content=scraped_content,
            )

            # ── 3. Call the LLM ───────────────────────────────────────────
            logger.info("[%s] Running data structuring analysis…", self.agent_name)
            raw_response = await self._call_llm(user_prompt)

            # ── 4. Parse the JSON response ────────────────────────────────
            parsed = self._parse_json_response(raw_response)

            # ── 5. Normalise — ensure every expected key exists ───────────
            result = {key: parsed.get(key) for key in _EXPECTED_KEYS}

            logger.info("[%s] Data structuring complete.", self.agent_name)
            return result

        except Exception as exc:
            import tenacity
            if isinstance(exc, tenacity.RetryError):
                underlying = exc.last_attempt.exception()
                return self._build_error_output(f"Data structuring failed after retries: {underlying}")
            return self._build_error_output(f"Data structuring failed: {exc}")
