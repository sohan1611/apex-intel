"""
final_synthesis_agent.py — Final Synthesis and Scoring Agent
=============================================================

Executes Phases 3, 4, and 5 in Optimized Mode: combines Contradiction Detection,
Synthesis, and Scoring into a single LLM call.
"""

from __future__ import annotations

import logging
from typing import Any

from backend.agents.base_agent import BaseAgent
from backend.core.prompts import (
    FINAL_SYNTHESIS_SCORING_SYSTEM_PROMPT,
    FINAL_SYNTHESIS_SCORING_USER_PROMPT,
)

logger = logging.getLogger(__name__)


class FinalSynthesisAndScoringAgent(BaseAgent):
    """
    Consolidated agent that performs contradictions check, memo synthesis,
    and scoring in a single request to save API quotas.
    """

    @property
    def agent_name(self) -> str:
        return "FinalSynthesisAndScoringAgent"

    @property
    def system_prompt(self) -> str:
        return FINAL_SYNTHESIS_SCORING_SYSTEM_PROMPT

    def fallback_default(self) -> dict[str, Any]:
        return {
            "identified_contradictions": [],
            "synthesized_memo": {
                "overall_confidence_score": 0.0,
                "executive_summary": "Analysis failed.",
                "market_overview": {"tam": None, "sam": None, "som": None, "key_trends": []},
                "competitive_landscape": {"competitor_count": 0, "key_competitors": [], "competitive_advantage": None},
                "risk_assessment": {"high_risks": [], "medium_risks": [], "low_risks": []},
                "assumptions_summary": {"critical_assumptions": [], "validation_status": "Failed"},
                "execution_assessment": {"difficulty": "HIGH", "capital_needs": "HIGH", "timeline": None},
                "contradictions_found": [],
                "red_flags": [],
                "recommendation": "DO NOT INVEST (Analysis Failed)"
            },
            "scoring": {
                "total_score": 0.0,
                "investment_signal": "WEAK",
                "breakdown": {
                    "market_opportunity": 0.0,
                    "competition_intensity": 0.0,
                    "execution_feasibility": 0.0,
                    "risk_exposure": 0.0
                },
                "justification": "Analysis failed."
            }
        }

    async def run(self, context: dict) -> dict:
        try:
            company_brief: str = context.get("company_brief", "")
            comprehensive_analysis: str = context.get("comprehensive_analysis", "")

            if not company_brief:
                return self._build_error_output("Missing 'company_brief'")
            if not comprehensive_analysis:
                return self._build_error_output("Missing 'comprehensive_analysis'")

            user_prompt = FINAL_SYNTHESIS_SCORING_USER_PROMPT.format(
                company_brief=company_brief,
                comprehensive_analysis=comprehensive_analysis,
            )

            logger.info("[%s] Running final synthesis & scoring...", self.agent_name)
            raw_response = await self._call_llm(user_prompt)
            parsed = self._parse_json_response(raw_response)

            if parsed is None:
                return self._build_error_output("Failed to parse JSON response")

            logger.info("[%s] Final synthesis & scoring complete.", self.agent_name)
            return parsed

        except Exception as exc:
            import tenacity
            if isinstance(exc, tenacity.RetryError):
                underlying = exc.last_attempt.exception()
                return self._build_error_output(f"Final synthesis failed after retries: {underlying}")
            return self._build_error_output(f"Final synthesis failed: {exc}")
