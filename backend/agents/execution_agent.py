"""
execution_agent.py — Execution Feasibility Agent
==================================================

Evaluates how difficult it would be to execute the business plan,
considering operational complexity, capital needs, and time to market.

**Input context keys:**
  - ``company_brief`` (str, required): Structured company data.

**Output keys:**
  - ``operational_difficulty`` (str) — LOW / MEDIUM / HIGH.
  - ``capital_requirements`` (str)   — LOW / MEDIUM / HIGH.
  - ``time_to_market_estimate`` (str | None) — e.g. ``"6–12 months"``.
  - ``rationale`` (str)   — Explanation of the assessment.
  - ``source`` (str)      — Always ``"inferred-insight"``.
"""

from __future__ import annotations

import logging
from typing import Any

from backend.agents.base_agent import BaseAgent
from backend.core.prompts import (
    EXECUTION_SYSTEM_PROMPT,
    EXECUTION_USER_PROMPT,
)

logger = logging.getLogger(__name__)


class ExecutionAgent(BaseAgent):
    """Agent that assesses execution feasibility.

    Evaluates operational difficulty, capital requirements, and
    estimated time to market for the proposed business.
    """

    @property
    def agent_name(self) -> str:
        return "ExecutionAgent"

    @property
    def system_prompt(self) -> str:
        return EXECUTION_SYSTEM_PROMPT

    def __init__(self, model_name: str = "gemini-2.5-flash") -> None:
        super().__init__(model_name=model_name)

    def fallback_default(self) -> dict[str, Any]:
        return {
            "operational_difficulty": "UNKNOWN",
            "capital_requirements": "UNKNOWN",
            "time_to_market_estimate": "UNKNOWN",
            "rationale": "Analysis failed.",
            "source": "inferred-insight",
        }

    async def run(self, context: dict) -> dict:
        """Execute feasibility analysis.

        Args:
            context: Must contain ``company_brief`` (str).

        Returns:
            Dict with execution feasibility fields, or an error dict.
        """
        try:
            # ── 1. Validate inputs ────────────────────────────────────────
            company_brief: str = context.get("company_brief", "")

            if not company_brief:
                return self._build_error_output(
                    "Missing required field: 'company_brief'"
                )

            # ── 2. Build prompt ───────────────────────────────────────────
            user_prompt = EXECUTION_USER_PROMPT.format(
                company_brief=company_brief,
            )

            # ── 3. Call LLM ───────────────────────────────────────────────
            logger.info(
                "[%s] Running execution feasibility analysis…", self.agent_name
            )
            raw_response = await self._call_llm(user_prompt)

            # ── 4. Parse response ─────────────────────────────────────────
            parsed = self._parse_json_response(raw_response)

            # ── 5. Normalise with defaults ────────────────────────────────
            result = {
                "operational_difficulty": parsed.get(
                    "operational_difficulty"
                ),
                "capital_requirements": parsed.get("capital_requirements"),
                "time_to_market_estimate": parsed.get(
                    "time_to_market_estimate"
                ),
                "rationale": parsed.get("rationale", ""),
                "source": parsed.get("source", "inferred-insight"),
            }

            logger.info(
                "[%s] Execution feasibility analysis complete.", self.agent_name
            )
            return result

        except Exception as exc:
            return self._build_error_output(
                f"Execution feasibility analysis failed: {exc}"
            )
