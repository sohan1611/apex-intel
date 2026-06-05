"""
market_agent.py — Market Research Agent
========================================

Analyses the structured company brief alongside external search results
to produce TAM / SAM / SOM estimates and market trend analysis.

**Input context keys:**
  - ``company_brief`` (str, required): Structured company data.
  - ``search_results`` (str, required): External search-engine results.

**Output keys:**
  - ``tam_estimate`` (float | None) — Total Addressable Market in USD B.
  - ``sam_estimate`` (float | None) — Serviceable Addressable Market.
  - ``som_estimate`` (float | None) — Serviceable Obtainable Market.
  - ``market_trends`` (list[dict])  — Each with *trend* and *source*.
  - ``confidence_score`` (float)    — 0.0–1.0.
  - ``uncertainty_factor`` (str | None)
"""

from __future__ import annotations

import logging

from backend.agents.base_agent import BaseAgent
from backend.core.prompts import (
    MARKET_RESEARCH_SYSTEM_PROMPT,
    MARKET_RESEARCH_USER_PROMPT,
)

logger = logging.getLogger(__name__)


class MarketAgent(BaseAgent):
    """Agent that performs market research and TAM/SAM/SOM estimation.

    Uses LLM analysis grounded in provided search results to estimate
    market sizes, identify trends, and quantify confidence.
    """

    @property
    def agent_name(self) -> str:
        return "MarketAgent"

    @property
    def system_prompt(self) -> str:
        return MARKET_RESEARCH_SYSTEM_PROMPT

    def __init__(self) -> None:
        super().__init__()

    async def run(self, context: dict) -> dict:
        """Execute market research analysis.

        Args:
            context: Must contain ``company_brief`` and ``search_results``
                     (both str).

        Returns:
            Dict with market estimates and trends, or an error dict.
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
            user_prompt = MARKET_RESEARCH_USER_PROMPT.format(
                company_brief=company_brief,
                search_results=search_results,
            )

            # ── 3. Call LLM ───────────────────────────────────────────────
            logger.info("[%s] Running market research analysis…", self.agent_name)
            raw_response = await self._call_llm(user_prompt)

            # ── 4. Parse response ─────────────────────────────────────────
            parsed = self._parse_json_response(raw_response)

            # ── 5. Normalise with sensible defaults ───────────────────────
            result = {
                "tam_estimate": parsed.get("tam_estimate"),
                "sam_estimate": parsed.get("sam_estimate"),
                "som_estimate": parsed.get("som_estimate"),
                "market_trends": parsed.get("market_trends", []),
                "confidence_score": float(
                    parsed.get("confidence_score", 0.0)
                ),
                "uncertainty_factor": parsed.get("uncertainty_factor"),
            }

            logger.info("[%s] Market research complete.", self.agent_name)
            return result

        except Exception as exc:
            return self._build_error_output(
                f"Market research failed: {exc}"
            )
