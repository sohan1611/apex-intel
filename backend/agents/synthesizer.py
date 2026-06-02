"""
synthesizer.py — Final Synthesizer Agent
==========================================

Combines ALL prior analysis outputs into a coherent, structured
investment memo with an overall confidence score and red flags.

**Input context keys:**
  - ``company_brief`` (str, required): Structured company data.
  - ``market_analysis`` (dict): MarketAgent output.
  - ``competitor_analysis`` (dict): CompetitorAgent output.
  - ``skeptic_analysis`` (dict): SkepticAgent output.
  - ``assumptions`` (dict): AssumptionAgent output.
  - ``execution_feasibility`` (dict): ExecutionAgent output.
  - ``contradictions`` (dict): ContradictionAgent output.

**Output keys:**
  - ``overall_confidence_score`` (float 0–1)
  - ``executive_summary`` (str)
  - ``market_overview`` (dict)
  - ``competitive_landscape`` (dict)
  - ``risk_assessment`` (dict)
  - ``assumptions_summary`` (dict)
  - ``execution_assessment`` (dict)
  - ``contradictions_found`` (list[str])
  - ``red_flags`` (list[dict]) — Each has *flag*, *severity*, *related_agents*.
  - ``recommendation`` (str)
"""

from __future__ import annotations

import json
import logging

from backend.agents.base_agent import BaseAgent
from backend.core.prompts import (
    SYNTHESIZER_SYSTEM_PROMPT,
    SYNTHESIZER_USER_PROMPT,
)

logger = logging.getLogger(__name__)


class SynthesizerAgent(BaseAgent):
    """Agent that synthesises all analysis into a final investment memo.

    Combines market research, competitor analysis, risk assessment,
    assumption validation, execution feasibility, and contradiction
    detection into a single comprehensive document for an investment
    committee.
    """

    def __init__(self) -> None:
        super().__init__(
            name="SynthesizerAgent",
            description=(
                "Synthesises all analysis outputs into a comprehensive "
                "investment memo."
            ),
        )

    async def run(self, context: dict) -> dict:
        """Execute synthesis of all analysis outputs.

        Args:
            context: Must contain ``company_brief`` (str) plus the dict
                     outputs from all preceding agents.

        Returns:
            Full synthesised memo dict, or an error dict.
        """
        try:
            # ── 1. Validate critical inputs ───────────────────────────────
            company_brief = context.get("company_brief", "")
            if not company_brief:
                return self._build_error_output(
                    "Missing required field: 'company_brief'"
                )

            # ── 2. Build the mega-prompt with all analyses ────────────────
            # Convert company_brief to string if it's a dict
            brief_str = (
                company_brief
                if isinstance(company_brief, str)
                else json.dumps(company_brief, indent=2)
            )

            user_prompt = SYNTHESIZER_USER_PROMPT.format(
                company_brief=brief_str,
                market_analysis=json.dumps(
                    context.get("market_analysis", {}), indent=2
                ),
                competitor_analysis=json.dumps(
                    context.get("competitor_analysis", {}), indent=2
                ),
                skeptic_analysis=json.dumps(
                    context.get("skeptic_analysis", {}), indent=2
                ),
                assumptions=json.dumps(
                    context.get("assumptions", {}), indent=2
                ),
                execution_feasibility=json.dumps(
                    context.get("execution_feasibility", {}), indent=2
                ),
                contradictions=json.dumps(
                    context.get("contradictions", {}), indent=2
                ),
            )

            # ── 3. Call LLM ───────────────────────────────────────────────
            logger.info("[%s] Running final synthesis…", self.name)
            raw_response = await self._call_llm(
                system_prompt=SYNTHESIZER_SYSTEM_PROMPT,
                user_prompt=user_prompt,
            )

            # ── 4. Parse response ─────────────────────────────────────────
            parsed = self._parse_json_response(raw_response)

            # ── 5. Normalise with defaults for every expected field ───────
            result = {
                "overall_confidence_score": float(
                    parsed.get("overall_confidence_score", 0.0)
                ),
                "executive_summary": parsed.get("executive_summary", ""),
                "market_overview": parsed.get("market_overview", {}),
                "competitive_landscape": parsed.get(
                    "competitive_landscape", {}
                ),
                "risk_assessment": parsed.get("risk_assessment", {}),
                "assumptions_summary": parsed.get(
                    "assumptions_summary", {}
                ),
                "execution_assessment": parsed.get(
                    "execution_assessment", {}
                ),
                "contradictions_found": parsed.get(
                    "contradictions_found", []
                ),
                "red_flags": parsed.get("red_flags", []),
                "recommendation": parsed.get("recommendation", ""),
            }

            logger.info(
                "[%s] Synthesis complete. Confidence: %.2f",
                self.name,
                result["overall_confidence_score"],
            )
            return result

        except Exception as exc:
            return self._build_error_output(f"Synthesis failed: {exc}")
