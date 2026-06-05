"""
contradiction_agent.py — Contradiction Detector Agent
=======================================================

Reviews all Phase 2 analysis outputs and identifies contradictions,
inconsistencies, or conflicting claims between different agents.

**Input context keys:**
  - ``market_analysis`` (dict, required): Output from MarketAgent.
  - ``competitor_analysis`` (dict, required): Output from CompetitorAgent.
  - ``skeptic_analysis`` (dict, required): Output from SkepticAgent.
  - ``assumptions`` (dict, required): Output from AssumptionAgent.
  - ``execution_feasibility`` (dict, required): Output from ExecutionAgent.

**Output keys:**
  - ``identified_contradictions`` (list[dict]) — Each has *description*
    and *resolution_or_flag*.
"""

from __future__ import annotations

import json
import logging

from backend.agents.base_agent import BaseAgent
from backend.core.prompts import (
    CONTRADICTION_SYSTEM_PROMPT,
    CONTRADICTION_USER_PROMPT,
)

logger = logging.getLogger(__name__)


class ContradictionAgent(BaseAgent):
    """Agent that detects contradictions across multiple analysis outputs.

    Examines the outputs from market, competitor, skeptic, assumption,
    and execution agents to find conflicting claims or inconsistencies
    that an investor should be aware of.
    """

    @property
    def agent_name(self) -> str:
        return "ContradictionAgent"

    @property
    def system_prompt(self) -> str:
        return CONTRADICTION_SYSTEM_PROMPT

    def __init__(self) -> None:
        super().__init__()

    async def run(self, context: dict) -> dict:
        """Execute contradiction detection.

        Args:
            context: Must contain the outputs from all Phase 2 agents:
                     ``market_analysis``, ``competitor_analysis``,
                     ``skeptic_analysis``, ``assumptions``, and
                     ``execution_feasibility`` (all dict).

        Returns:
            Dict with ``identified_contradictions`` list, or error dict.
        """
        try:
            # ── 1. Extract all Phase 2 outputs ────────────────────────────
            market_analysis = context.get("market_analysis", {})
            competitor_analysis = context.get("competitor_analysis", {})
            skeptic_analysis = context.get("skeptic_analysis", {})
            assumptions = context.get("assumptions", {})
            execution_feasibility = context.get(
                "execution_feasibility", {}
            )

            # ── 2. Build prompt with JSON-serialised dicts ────────────────
            user_prompt = CONTRADICTION_USER_PROMPT.format(
                market_analysis=json.dumps(market_analysis, indent=2),
                competitor_analysis=json.dumps(
                    competitor_analysis, indent=2
                ),
                skeptic_analysis=json.dumps(skeptic_analysis, indent=2),
                assumptions=json.dumps(assumptions, indent=2),
                execution_feasibility=json.dumps(
                    execution_feasibility, indent=2
                ),
            )

            # ── 3. Call LLM ───────────────────────────────────────────────
            logger.info(
                "[%s] Running contradiction detection…", self.agent_name
            )
            raw_response = await self._call_llm(user_prompt)

            # ── 4. Parse response ─────────────────────────────────────────
            parsed = self._parse_json_response(raw_response)

            # ── 5. Normalise ──────────────────────────────────────────────
            contradictions_list = parsed.get(
                "identified_contradictions", []
            )
            result = {
                "identified_contradictions": contradictions_list,
            }

            logger.info(
                "[%s] Contradiction detection complete. "
                "Found %d contradictions.",
                self.agent_name,
                len(contradictions_list),
            )
            return result

        except Exception as exc:
            return self._build_error_output(
                f"Contradiction detection failed: {exc}"
            )
