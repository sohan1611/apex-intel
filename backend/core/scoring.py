"""
Apex Intel — Scoring Utilities
================================

Helper functions used by the Scoring Engine agent and other modules
that need to work with investment scores.

These functions are pure (no side effects, no I/O) and can be called
from sync or async code without any awaiting.
"""

from __future__ import annotations

from backend.config.constants import INVESTMENT_SIGNAL, SCORING_WEIGHTS


# ── Public helpers ────────────────────────────────────────────────────────


def calculate_investment_signal(score: float) -> str:
    """Determine the investment signal label for a numeric score.

    The thresholds come from ``backend.config.constants.INVESTMENT_SIGNAL``.

    Args:
        score: Total investment score on a 0–100 scale.

    Returns:
        One of ``"STRONG"``, ``"MODERATE"``, or ``"WEAK"``.

    Examples:
        >>> calculate_investment_signal(82.5)
        'STRONG'
        >>> calculate_investment_signal(60.0)
        'MODERATE'
        >>> calculate_investment_signal(30.0)
        'WEAK'
    """
    if score >= INVESTMENT_SIGNAL["STRONG"]:
        return "STRONG"
    elif score >= INVESTMENT_SIGNAL["MODERATE"]:
        return "MODERATE"
    else:
        return "WEAK"


def validate_score_breakdown(breakdown: dict) -> bool:
    """Check that a score breakdown has valid keys and in-range values.

    A valid breakdown must:
      1. Contain every key defined in ``SCORING_WEIGHTS``.
      2. Have numeric values (int or float).
      3. Have each value between 0 and its maximum (weight × 100).

    The max for each dimension is derived from the weight. For example,
    a weight of 0.30 means a max of 30 points.

    Args:
        breakdown: Dictionary mapping scoring dimension names to floats.

    Returns:
        ``True`` if the breakdown is structurally valid, ``False`` otherwise.

    Examples:
        >>> validate_score_breakdown({
        ...     "market_opportunity": 25.0,
        ...     "competition_intensity": 20.0,
        ...     "execution_feasibility": 15.0,
        ...     "risk_exposure": 18.0,
        ... })
        True
        >>> validate_score_breakdown({"market_opportunity": 50.0})
        False
    """
    for key, weight in SCORING_WEIGHTS.items():
        # Each key must be present
        if key not in breakdown:
            return False

        val = breakdown[key]

        # Value must be numeric
        if not isinstance(val, (int, float)):
            return False

        # Calculate the max allowed value from the weight
        # weight=0.30 → max=30, weight=0.25 → max=25, etc.
        max_val = weight * 100

        # Value must be within [0, max_val]
        if val < 0 or val > max_val:
            return False

    return True


def normalize_score(raw: float, max_val: float) -> float:
    """Normalize a raw score to a 0–1 range.

    Clamps the result so it never exceeds [0.0, 1.0].

    Args:
        raw:     The raw score value.
        max_val: The maximum possible value for this score dimension.

    Returns:
        Normalized score between 0.0 and 1.0 (inclusive).

    Raises:
        ValueError: If ``max_val`` is zero or negative.

    Examples:
        >>> normalize_score(15.0, 30.0)
        0.5
        >>> normalize_score(35.0, 30.0)  # clamped to 1.0
        1.0
        >>> normalize_score(-5.0, 30.0)  # clamped to 0.0
        0.0
    """
    if max_val <= 0:
        raise ValueError(f"max_val must be positive, got {max_val}")
    return max(0.0, min(1.0, raw / max_val))
