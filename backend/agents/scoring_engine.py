"""
scoring_engine.py — Investment Scoring Engine
===============================================

Produces a quantitative score (0–100) for the business based on the
synthesised investment memo, with a breakdown across four weighted
dimensions.

**Input context keys:**
  - ``synthesized_memo`` (dict, required): Full output from
    :class:`SynthesizerAgent`.

**Output keys:**
  - ``total_score`` (float 0–100)
  - ``investment_signal`` (str) — ``STRONG`` / ``MODERATE`` / ``WEAK``.
  - ``breakdown`` (dict) — Scores for each dimension:
      - ``market_opportunity``    (float 0–30)
      - ``competition_intensity`` (float 0–25)
      - ``execution_feasibility`` (float 0–20)
      - ``risk_exposure``         (float 0–25)
  - ``justification`` (str) — Detailed scoring rationale.

Scoring Dimensions & Weights (from ``config.constants``):
  • market_opportunity    → 30 % → max 30 pts
  • competition_intensity → 25 % → max 25 pts
  • execution_feasibility → 20 % → max 20 pts
  • risk_exposure         → 25 % → max 25 pts

Investment Signal Thresholds:
  • STRONG   — total_score ≥ 75
  • MODERATE — total_score ≥ 50
  • WEAK     — total_score < 50
"""

from __future__ import annotations

import json
import logging

from backend.agents.base_agent import BaseAgent
from backend.config.constants import SCORING_WEIGHTS
from backend.core.prompts import (
    SCORING_SYSTEM_PROMPT,
    SCORING_USER_PROMPT,
)
from backend.core.scoring import (
    calculate_investment_signal,
    validate_score_breakdown,
)

logger = logging.getLogger(__name__)

# Pre-compute max points per dimension from the weights (0.30 → 30, etc.)
_MAX_POINTS: dict[str, float] = {
    key: weight * 100 for key, weight in SCORING_WEIGHTS.items()
}


class ScoringEngine(BaseAgent):
    """Agent that produces quantitative investment scores.

    Takes the synthesised investment memo and produces a numerical
    score from 0–100 across four weighted dimensions, plus a
    human-readable investment signal (STRONG / MODERATE / WEAK).
    """

    @property
    def agent_name(self) -> str:
        return "ScoringEngine"

    @property
    def system_prompt(self) -> str:
        return SCORING_SYSTEM_PROMPT

    def __init__(self) -> None:
        super().__init__()

    async def run(self, context: dict) -> dict:
        """Execute investment scoring.

        Args:
            context: Must contain ``synthesized_memo`` (dict) — the
                     output from :class:`SynthesizerAgent`.

        Returns:
            Dict with ``total_score``, ``investment_signal``,
            ``breakdown``, and ``justification``, or an error dict.
        """
        try:
            # ── 1. Validate inputs ────────────────────────────────────────
            synthesized_memo = context.get("synthesized_memo", {})
            if not synthesized_memo:
                return self._build_error_output(
                    "Missing required field: 'synthesized_memo'"
                )

            # ── 2. Build prompt ───────────────────────────────────────────
            user_prompt = SCORING_USER_PROMPT.format(
                synthesized_memo=json.dumps(synthesized_memo, indent=2),
            )

            # ── 3. Call LLM ───────────────────────────────────────────────
            logger.info("[%s] Running investment scoring…", self.agent_name)
            raw_response = await self._call_llm(user_prompt)

            # ── 4. Parse response ─────────────────────────────────────────
            parsed = self._parse_json_response(raw_response)

            # ── 5. Extract and validate breakdown ─────────────────────────
            breakdown = parsed.get("breakdown", {})
            total_score = float(parsed.get("total_score", 0.0))

            if validate_score_breakdown(breakdown):
                # The breakdown is valid — recalculate total for consistency
                calculated_total = sum(
                    float(breakdown[k]) for k in SCORING_WEIGHTS
                )
                if abs(calculated_total - total_score) > 1.0:
                    logger.warning(
                        "[%s] Score mismatch: LLM said %.2f, breakdown "
                        "sums to %.2f. Using breakdown sum.",
                        self.agent_name,
                        total_score,
                        calculated_total,
                    )
                    total_score = calculated_total
            else:
                # Breakdown is invalid — salvage what we can
                logger.warning(
                    "[%s] Invalid score breakdown from LLM. "
                    "Using LLM total as-is.",
                    self.agent_name,
                )
                breakdown = {
                    key: float(breakdown.get(key, 0.0))
                    for key in SCORING_WEIGHTS
                }

            # ── 6. Clamp total to valid range ─────────────────────────────
            total_score = max(0.0, min(100.0, total_score))

            # ── 7. Determine investment signal ────────────────────────────
            investment_signal = calculate_investment_signal(total_score)

            # ── 8. Build final result ─────────────────────────────────────
            result = {
                "total_score": round(total_score, 2),
                "investment_signal": investment_signal,
                "breakdown": {
                    "market_opportunity": round(
                        float(breakdown.get("market_opportunity", 0.0)), 2
                    ),
                    "competition_intensity": round(
                        float(
                            breakdown.get("competition_intensity", 0.0)
                        ),
                        2,
                    ),
                    "execution_feasibility": round(
                        float(
                            breakdown.get("execution_feasibility", 0.0)
                        ),
                        2,
                    ),
                    "risk_exposure": round(
                        float(breakdown.get("risk_exposure", 0.0)), 2
                    ),
                },
                "justification": parsed.get("justification", ""),
            }

            logger.info(
                "[%s] Scoring complete. Total: %.2f, Signal: %s",
                self.agent_name,
                result["total_score"],
                result["investment_signal"],
            )
            return result

        except Exception as exc:
            return self._build_error_output(
                f"Investment scoring failed: {exc}"
            )
