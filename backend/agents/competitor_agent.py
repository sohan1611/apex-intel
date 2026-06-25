"""
competitor_agent.py — Competitor Analysis Agent
=================================================

Identifies and profiles direct competitors based on the company brief
and external search results.

**Input context keys:**
  - ``company_brief`` (str, required): Structured company data.
  - ``search_results`` (str, required): External search-engine results.

**Output keys:**
  - ``competitors`` (list[dict]) — Each competitor has *name*, *pricing*,
    *positioning*, *strengths*, *weaknesses*, and *source*.
"""

from __future__ import annotations

import logging
from typing import Any

from backend.agents.base_agent import BaseAgent
from backend.core.prompts import (
    COMPETITOR_SYSTEM_PROMPT,
    COMPETITOR_USER_PROMPT,
)

logger = logging.getLogger(__name__)


class CompetitorAgent(BaseAgent):
    """Agent that identifies and profiles competitors.

    Analyses the competitive landscape by examining the company brief
    and external search results to build detailed competitor profiles
    including pricing, positioning, strengths, and weaknesses.
    """

    @property
    def agent_name(self) -> str:
        return "CompetitorAgent"

    @property
    def system_prompt(self) -> str:
        return COMPETITOR_SYSTEM_PROMPT

    def __init__(self, model_name: str = "gemini-2.5-flash") -> None:
        super().__init__(model_name=model_name)

    def fallback_default(self) -> dict[str, Any]:
        return {
            "competitors": [],
        }

    async def run(self, context: dict) -> dict:
        """Execute competitor analysis.

        Args:
            context: Must contain ``company_brief`` and ``search_results``
                     (both str).

        Returns:
            Dict with ``competitors`` list, or an error dict.
        """
        try:
            # ── 1. Validate inputs ────────────────────────────────────────
            company_brief: str = context.get("company_brief", "")
            search_results: str = context.get("search_results", "")

            if not company_brief:
                return self._build_error_output(
                    "Missing required field: 'company_brief'"
                )
            if not search_results:
                return self._build_error_output(
                    "Missing required field: 'search_results'"
                )

            # ── 2. Build prompt ───────────────────────────────────────────
            user_prompt = COMPETITOR_USER_PROMPT.format(
                company_brief=company_brief,
                search_results=search_results,
            )

            # ── 3. Call LLM ───────────────────────────────────────────────
            logger.info("[%s] Running competitor analysis…", self.agent_name)
            raw_response = await self._call_llm(user_prompt)

            # ── 4. Parse response ─────────────────────────────────────────
            parsed = self._parse_json_response(raw_response)

            # ── 5. Normalise ──────────────────────────────────────────────
            competitors_list = parsed.get("competitors", [])
            result = {
                "competitors": competitors_list,
            }

            logger.info(
                "[%s] Competitor analysis complete. Found %d competitors.",
                self.agent_name,
                len(competitors_list),
            )
            return result

        except Exception as exc:
            return self._build_error_output(
                f"Competitor analysis failed: {exc}"
            )
