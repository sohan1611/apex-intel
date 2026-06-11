"""
comprehensive_agent.py — Comprehensive Analysis Agent
======================================================

Executes Phase 2 in Optimized Mode: combines Market, Competitor, Skeptic, 
Assumption, and Execution analyses into a single LLM call.
"""

from __future__ import annotations

import logging
from typing import Any

from backend.agents.base_agent import BaseAgent
from backend.core.prompts import (
    COMPREHENSIVE_ANALYSIS_SYSTEM_PROMPT,
    COMPREHENSIVE_ANALYSIS_USER_PROMPT,
)

logger = logging.getLogger(__name__)


class ComprehensiveAnalysisAgent(BaseAgent):
    """
    Consolidated agent that performs all Phase 2 analyses in a single request
    to save on API quotas.
    """

    @property
    def agent_name(self) -> str:
        return "ComprehensiveAnalysisAgent"

    @property
    def system_prompt(self) -> str:
        return COMPREHENSIVE_ANALYSIS_SYSTEM_PROMPT

    def fallback_default(self) -> dict[str, Any]:
        return {
            "market_analysis": {
                "tam_estimate": None,
                "sam_estimate": None,
                "som_estimate": None,
                "market_trends": [],
                "confidence_score": 0.0,
                "uncertainty_factor": "Unknown due to failure"
            },
            "competitor_analysis": {"competitors": []},
            "skeptic_analysis": {"top_risks": []},
            "assumptions": {"core_assumptions": []},
            "execution_feasibility": {
                "operational_difficulty": "HIGH",
                "capital_requirements": "HIGH",
                "time_to_market_estimate": None,
                "rationale": "Failed to assess",
                "source": "inferred-insight"
            }
        }

    async def run(self, context: dict) -> dict:
        try:
            company_brief: str = context.get("company_brief", "")
            search_results: str = context.get("search_results", "")

            if not company_brief:
                return self._build_error_output("Missing required field: 'company_brief'")
            if not search_results:
                return self._build_error_output("Missing required field: 'search_results'")

            user_prompt = COMPREHENSIVE_ANALYSIS_USER_PROMPT.format(
                company_brief=company_brief,
                search_results=search_results,
            )

            logger.info("[%s] Running comprehensive analysis...", self.agent_name)
            raw_response = await self._call_llm(user_prompt)
            parsed = self._parse_json_response(raw_response)

            if parsed is None:
                return self._build_error_output("Failed to parse JSON response")

            logger.info("[%s] Comprehensive analysis complete.", self.agent_name)
            return parsed

        except Exception as exc:
            import tenacity
            if isinstance(exc, tenacity.RetryError):
                underlying = exc.last_attempt.exception()
                return self._build_error_output(f"Comprehensive analysis failed after retries: {underlying}")
            return self._build_error_output(f"Comprehensive analysis failed: {exc}")
