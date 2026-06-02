"""
backend/tests/test_scoring.py
──────────────────────────────
Unit tests for the scoring module (core/scoring.py).

These tests verify the three main scoring utilities:
  • calculate_investment_signal — Maps a numeric score to STRONG/MODERATE/WEAK
  • validate_score_breakdown — Checks that sub-scores respect max ranges
  • normalize_score — Normalises a raw score to [0.0, 1.0] given a max value

No external dependencies or API keys are required for these tests.
"""

from __future__ import annotations

import pytest

# ── Import the scoring functions ─────────────────────────────────────
from backend.core.scoring import (
    calculate_investment_signal,
    validate_score_breakdown,
    normalize_score,
)


# =====================================================================
#  Tests: calculate_investment_signal
# =====================================================================

class TestInvestmentSignal:
    """
    Test suite for the calculate_investment_signal() function.

    Business rules (from config/constants.py):
      • score >= 75  → "STRONG"
      • 50 <= score < 75  → "MODERATE"
      • score < 50  → "WEAK"
    """

    def test_investment_signal_strong(self) -> None:
        """
        A total score of 80 should return 'STRONG'.

        Rationale: 80 >= 75, so the investment signal is strong.
        """
        signal = calculate_investment_signal(80)
        assert signal == "STRONG"

    def test_investment_signal_strong_boundary(self) -> None:
        """
        A total score of exactly 75 should return 'STRONG'.

        Edge case: the boundary value itself should be inclusive.
        """
        signal = calculate_investment_signal(75)
        assert signal == "STRONG"

    def test_investment_signal_moderate(self) -> None:
        """
        A total score of 60 should return 'MODERATE'.

        Rationale: 50 <= 60 < 75.
        """
        signal = calculate_investment_signal(60)
        assert signal == "MODERATE"

    def test_investment_signal_moderate_boundary(self) -> None:
        """
        A total score of exactly 50 should return 'MODERATE'.

        Edge case: lower boundary of the MODERATE range.
        """
        signal = calculate_investment_signal(50)
        assert signal == "MODERATE"

    def test_investment_signal_weak(self) -> None:
        """
        A total score of 30 should return 'WEAK'.

        Rationale: 30 < 50.
        """
        signal = calculate_investment_signal(30)
        assert signal == "WEAK"

    def test_investment_signal_weak_zero(self) -> None:
        """
        A total score of 0 should return 'WEAK'.

        Edge case: the absolute minimum score.
        """
        signal = calculate_investment_signal(0)
        assert signal == "WEAK"

    def test_investment_signal_perfect(self) -> None:
        """
        A total score of 100 should return 'STRONG'.

        Edge case: the absolute maximum score.
        """
        signal = calculate_investment_signal(100)
        assert signal == "STRONG"


# =====================================================================
#  Tests: validate_score_breakdown
# =====================================================================

class TestValidateScoreBreakdown:
    """
    Test suite for validate_score_breakdown().

    A valid score breakdown has 4 sub-scores that respect their
    max ranges as defined in SCORING_WEIGHTS:
      • market_opportunity:    0–30  (weight 0.30 × 100)
      • competition_intensity: 0–25  (weight 0.25 × 100)
      • execution_feasibility: 0–20  (weight 0.20 × 100)
      • risk_exposure:         0–25  (weight 0.25 × 100)
    """

    def test_validate_score_breakdown_valid(self) -> None:
        """
        A breakdown with all sub-scores within their max ranges
        should pass validation (return True).
        """
        breakdown = {
            "market_opportunity": 25.0,
            "competition_intensity": 20.0,
            "execution_feasibility": 15.0,
            "risk_exposure": 18.0,
        }

        result = validate_score_breakdown(breakdown)
        assert result is True

    def test_validate_score_breakdown_all_max(self) -> None:
        """
        A breakdown with all sub-scores at their maximum values
        should pass validation.
        """
        breakdown = {
            "market_opportunity": 30.0,
            "competition_intensity": 25.0,
            "execution_feasibility": 20.0,
            "risk_exposure": 25.0,
        }

        result = validate_score_breakdown(breakdown)
        assert result is True

    def test_validate_score_breakdown_all_zero(self) -> None:
        """
        A breakdown with all sub-scores at zero should pass validation.
        """
        breakdown = {
            "market_opportunity": 0.0,
            "competition_intensity": 0.0,
            "execution_feasibility": 0.0,
            "risk_exposure": 0.0,
        }

        result = validate_score_breakdown(breakdown)
        assert result is True

    def test_validate_score_breakdown_invalid(self) -> None:
        """
        A breakdown with a sub-score exceeding its max range should
        fail validation (return False).

        Here, market_opportunity = 35 exceeds the max of 30.
        """
        breakdown = {
            "market_opportunity": 35.0,       # INVALID: max is 30
            "competition_intensity": 20.0,
            "execution_feasibility": 15.0,
            "risk_exposure": 18.0,
        }

        result = validate_score_breakdown(breakdown)
        assert result is False

    def test_validate_score_breakdown_negative(self) -> None:
        """
        Negative sub-scores should fail validation.
        """
        breakdown = {
            "market_opportunity": -5.0,       # INVALID: negative
            "competition_intensity": 20.0,
            "execution_feasibility": 15.0,
            "risk_exposure": 18.0,
        }

        result = validate_score_breakdown(breakdown)
        assert result is False

    def test_validate_score_breakdown_missing_key(self) -> None:
        """
        A breakdown missing a required sub-score key should fail.
        """
        breakdown = {
            "market_opportunity": 25.0,
            # Missing: competition_intensity
            "execution_feasibility": 15.0,
            "risk_exposure": 18.0,
        }

        result = validate_score_breakdown(breakdown)
        assert result is False


# =====================================================================
#  Tests: normalize_score
# =====================================================================

class TestNormalizeScore:
    """
    Test suite for normalize_score().

    This function normalises a raw score to a [0.0, 1.0] range
    given a maximum possible value.

    Signature: normalize_score(raw: float, max_val: float) -> float
    """

    def test_normalize_score_within_range(self) -> None:
        """
        A raw score of 15 out of 30 max should normalise to 0.5.
        """
        assert normalize_score(15.0, 30.0) == 0.5

    def test_normalize_score_above_max(self) -> None:
        """
        A raw score above the max should be clamped to 1.0.
        """
        assert normalize_score(35.0, 30.0) == 1.0

    def test_normalize_score_below_min(self) -> None:
        """
        A negative raw score should be clamped to 0.0.
        """
        assert normalize_score(-10.0, 30.0) == 0.0

    def test_normalize_score_zero(self) -> None:
        """
        A raw score of exactly 0 should normalise to 0.0.
        """
        assert normalize_score(0.0, 30.0) == 0.0

    def test_normalize_score_at_max(self) -> None:
        """
        A raw score equal to the max should normalise to 1.0.
        """
        assert normalize_score(30.0, 30.0) == 1.0

    def test_normalize_score_invalid_max(self) -> None:
        """
        A max_val of 0 or negative should raise ValueError.
        """
        with pytest.raises(ValueError):
            normalize_score(10.0, 0.0)

        with pytest.raises(ValueError):
            normalize_score(10.0, -5.0)

    def test_normalize_score_float_precision(self) -> None:
        """
        Floating point values should be normalised correctly.
        """
        result = normalize_score(20.0, 25.0)
        assert abs(result - 0.8) < 1e-9
