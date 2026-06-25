"""
skeptic_agent.py — Skeptic / Risk Analysis Agent
==================================================

Identifies top risks, weaknesses, and potential failure modes in the
business proposition, classifying each by severity.

**Input context keys:**
  - ``company_brief`` (str, required): Structured company data.
  - ``search_results`` (str, required): External search-engine results.

**Output keys:**
  - ``top_risks`` (list[dict]) — Each risk has *risk*, *severity*
    (HIGH/MEDIUM/LOW), *rationale*, and *source*.
"""

from __future__ import annotations

import logging
from typing import Any

from backend.agents.base_agent import BaseAgent
from backend.core.prompts import (
    SKEPTIC_SYSTEM_PROMPT,
    SKEPTIC_USER_PROMPT,
)

logger = logging.getLogger(__name__)


class SkepticAgent(BaseAgent):
    """Agent that performs skeptical risk analysis.

    Finds every reason the business could fail, classifying each risk
    by severity so investors know where to focus their diligence.
    """

    @property
    def agent_name(self) -> str:
        return "SkepticAgent"

    @property
    def system_prompt(self) -> str:
        return SKEPTIC_SYSTEM_PROMPT

    def __init__(self, model_name: str = "gemini-2.5-flash") -> None:
        super().__init__(model_name=model_name)

    def fallback_default(self) -> dict[str, Any]:
        return {
            "top_risks": [],
        }

    async def run(self, context: dict) -> dict:
        """Execute skeptic risk analysis.

        Args:
            context: Must contain ``company_brief`` and ``search_results``
                     (both str).

        Returns:
            Dict with ``top_risks`` list, or an error dict.
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
            user_prompt = SKEPTIC_USER_PROMPT.format(
                company_brief=company_brief,
                search_results=search_results,
            )

            # ── 3. Call LLM ───────────────────────────────────────────────
            logger.info("[%s] Running skeptic analysis…", self.agent_name)
            raw_response = await self._call_llm(user_prompt)

            # ── 4. Parse response ─────────────────────────────────────────
            parsed = self._parse_json_response(raw_response)

            # ── 5. Normalise ──────────────────────────────────────────────
            risks_list = parsed.get("top_risks", [])
            result = {
                "top_risks": risks_list,
            }

            logger.info(
                "[%s] Skeptic analysis complete. Identified %d risks.",
                self.agent_name,
                len(risks_list),
            )
            return result

        except Exception as exc:
            return self._build_error_output(
                f"Skeptic analysis failed: {exc}"
            )
