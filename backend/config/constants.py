"""
Apex Intel — Application Constants
====================================

This file holds every **hard-coded value** the system references.
Keeping them in one place makes it trivial to tweak scoring logic or
add a new analysis phase without hunting through dozens of files.

Why not put these in settings.py?
---------------------------------
Settings are *environment-specific* (database URLs, API keys).
Constants are *business-logic rules* that rarely change between
environments — they belong in version control, not in `.env`.
"""

from __future__ import annotations

from enum import Enum

# ══════════════════════════════════════════════════════════════════════════
# 1. SCORING WEIGHTS
# ══════════════════════════════════════════════════════════════════════════
# These weights determine how the final investment score is calculated.
# They MUST sum to 1.0 (100%).
#
#   final_score = Σ (category_score × weight)
#
SCORING_WEIGHTS: dict[str, float] = {
    "market_opportunity": 0.30,      # 30% — How big / growing is the market?
    "competition_intensity": 0.25,   # 25% — How fierce is competition?
    "execution_feasibility": 0.20,   # 20% — Can the team actually pull it off?
    "risk_exposure": 0.25,           # 25% — What could go wrong?
}

# ══════════════════════════════════════════════════════════════════════════
# 2. INVESTMENT SIGNAL THRESHOLDS
# ══════════════════════════════════════════════════════════════════════════
# After computing the total score (0–100) we map it to a human-friendly
# signal that appears in the final memo.
#
#   score >= 75 → STRONG   "Proceed with high confidence"
#   score >= 50 → MODERATE "Promising but needs more diligence"
#   score <  50 → WEAK     "Significant concerns — proceed cautiously"
#
INVESTMENT_SIGNAL: dict[str, int] = {
    "STRONG": 75,    # Score must be >= 75 for a strong signal
    "MODERATE": 50,  # Score must be >= 50 for a moderate signal
    "WEAK": 0,       # Everything below 50 is weak (threshold is 0 as floor)
}


def compute_investment_signal(score: float) -> str:
    """Return the investment signal string for a given numeric score.

    Args:
        score: A float between 0 and 100 (inclusive).

    Returns:
        One of ``"STRONG"``, ``"MODERATE"``, or ``"WEAK"``.

    Example::

        >>> compute_investment_signal(82.5)
        'STRONG'
        >>> compute_investment_signal(55.0)
        'MODERATE'
        >>> compute_investment_signal(30.0)
        'WEAK'
    """
    if score >= INVESTMENT_SIGNAL["STRONG"]:
        return "STRONG"
    if score >= INVESTMENT_SIGNAL["MODERATE"]:
        return "MODERATE"
    return "WEAK"


# ══════════════════════════════════════════════════════════════════════════
# 3. AGENT NAMES
# ══════════════════════════════════════════════════════════════════════════
# The 9 autonomous agents that participate in a full analysis run.
# The orchestrator iterates over this list to dispatch work.
AGENT_NAMES: list[str] = [
    "company_briefing_agent",
    "market_analysis_agent",
    "competitor_intelligence_agent",
    "skeptic_agent",
    "assumption_auditor_agent",
    "execution_feasibility_agent",
    "contradiction_detector_agent",
    "scoring_agent",
    "memo_synthesis_agent",
]

# ══════════════════════════════════════════════════════════════════════════
# 4. ANALYSIS PHASES
# ══════════════════════════════════════════════════════════════════════════
# A report moves through these phases sequentially.
# The frontend can use this to show a progress bar.
ANALYSIS_PHASES: list[str] = [
    "data_ingestion",         # Phase 1 — scrape / parse input
    "agent_analysis",         # Phase 2 — all 9 agents run
    "cross_validation",       # Phase 3 — contradiction & assumption checks
    "scoring_and_synthesis",  # Phase 4 — compute score & write memo
    "finalisation",           # Phase 5 — persist results & mark complete
]


# ══════════════════════════════════════════════════════════════════════════
# 5. SEVERITY / DIFFICULTY / IMPACT LEVELS
# ══════════════════════════════════════════════════════════════════════════
# Using Python `Enum` gives us:
#   • Auto-complete in IDEs
#   • Compile-time typo detection
#   • Clean serialisation via `.value`

class SeverityLevel(str, Enum):
    """How severe a risk is — used by the Skeptic and Risk agents."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DifficultyLevel(str, Enum):
    """How hard an assumption is to validate — used by Assumption Auditor."""

    EASY = "easy"
    MODERATE = "moderate"
    HARD = "hard"
    VERY_HARD = "very_hard"


class ImpactLevel(str, Enum):
    """What happens if an assumption turns out to be false."""

    NEGLIGIBLE = "negligible"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CATASTROPHIC = "catastrophic"


# ══════════════════════════════════════════════════════════════════════════
# 6. REPORT STATUS VALUES
# ══════════════════════════════════════════════════════════════════════════
# Centralised status strings so we never mistype them.

class ReportStatus(str, Enum):
    """Lifecycle states a Report can be in."""

    QUEUED = "queued"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
