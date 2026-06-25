"""
assumption_agent.py — Assumption Validator Agent
==================================================

Identifies implicit and explicit assumptions in the business plan and
classifies each by validation difficulty and impact if false.

**Input context keys:**
  - ``company_brief`` (str, required): Structured company data.

**Output keys:**
  - ``core_assumptions`` (list[dict]) — Each has *assumption*,
    *validation_difficulty* (EASY/HARD), *impact_if_false*
    (FATAL/MODERATE/LOW), and *source* (always ``"inferred-insight"``).
"""

from __future__ import annotations

import logging
from typing import Any

from backend.agents.base_agent import BaseAgent
from backend.core.prompts import (
    ASSUMPTION_SYSTEM_PROMPT,
    ASSUMPTION_USER_PROMPT,
)

logger = logging.getLogger(__name__)


class AssumptionAgent(BaseAgent):
    """Agent that validates business assumptions.

    Surfaces both stated assumptions and hidden ones the founders may
    not realise they are making, then classifies each by how hard it
    is to test and how catastrophic it would be if wrong.
    """

    @property
    def agent_name(self) -> str:
        return "AssumptionAgent"

    @property
    def system_prompt(self) -> str:
        return ASSUMPTION_SYSTEM_PROMPT

    def __init__(self, model_name: str = "gemini-2.5-flash") -> None:
        super().__init__(model_name=model_name)

    def fallback_default(self) -> dict[str, Any]:
        return {
            "core_assumptions": [],
        }

    async def run(self, context: dict) -> dict:
        """Execute assumption validation.

        Args:
            context: Must contain ``company_brief`` (str).

        Returns:
            Dict with ``core_assumptions`` list, or an error dict.
        """
        try:
            # ── 1. Validate inputs ────────────────────────────────────────
            company_brief: str = context.get("company_brief", "")

            if not company_brief:
                return self._build_error_output(
                    "Missing required field: 'company_brief'"
                )

            # ── 2. Build prompt ───────────────────────────────────────────
            user_prompt = ASSUMPTION_USER_PROMPT.format(
                company_brief=company_brief,
            )

            # ── 3. Call LLM ───────────────────────────────────────────────
            logger.info("[%s] Running assumption validation…", self.agent_name)
            raw_response = await self._call_llm(user_prompt)

            # ── 4. Parse response ─────────────────────────────────────────
            parsed = self._parse_json_response(raw_response)

            # ── 5. Normalise and ensure source field ──────────────────────
            assumptions_list = parsed.get("core_assumptions", [])

            # Guarantee every assumption has the "inferred-insight" source
            for assumption in assumptions_list:
                assumption.setdefault("source", "inferred-insight")

            result = {
                "core_assumptions": assumptions_list,
            }

            logger.info(
                "[%s] Assumption validation complete. Found %d assumptions.",
                self.agent_name,
                len(assumptions_list),
            )
            return result

        except Exception as exc:
            return self._build_error_output(
                f"Assumption validation failed: {exc}"
            )
