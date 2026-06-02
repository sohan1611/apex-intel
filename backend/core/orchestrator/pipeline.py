"""
Apex Intel — Pipeline Context & Phase Status
===============================================

This module defines the **PipelineContext** — a mutable data-transfer object
that flows through every phase of the analysis pipeline.  Think of it as a
shared clipboard: each agent writes its output into the relevant field, and
subsequent agents read from earlier fields.

It also defines **PhaseStatus** — an enum that tracks where the pipeline
currently stands.

Lifecycle of a PipelineContext
-------------------------------
::

    PipelineContext created (QUEUED, progress=0)
        │
        ▼
    Phase 1 — Data Structuring   → company_brief filled   (PHASE_1, progress=20)
        │
        ▼
    Phase 2 — Parallel Analysis  → market/competitor/...   (PHASE_2, progress=50)
        │
        ▼
    Phase 3 — Contradictions     → contradictions filled   (PHASE_3, progress=70)
        │
        ▼
    Phase 4 — Synthesis          → synthesized_memo filled (PHASE_4, progress=85)
        │
        ▼
    Phase 5 — Scoring            → score_breakdown filled  (PHASE_5, progress=95)
        │
        ▼
    COMPLETED (progress=100)

Why a dataclass?
-----------------
*   Immutable-by-default fields with sensible defaults.
*   Automatic ``__repr__`` for debugging.
*   Type hints give IDE auto-complete and catch bugs early.
*   `field(default_factory=list)` prevents the classic mutable-default gotcha.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


# ══════════════════════════════════════════════════════════════════════════════
# Phase Status Enum
# ══════════════════════════════════════════════════════════════════════════════
class PhaseStatus(str, Enum):
    """Represents the current execution phase of the analysis pipeline.

    Inheriting from ``str`` means you can compare directly with plain strings
    (``status == "queued"``) and the value serialises cleanly to JSON.
    """

    QUEUED = "queued"
    PHASE_1 = "phase_1_data_structuring"
    PHASE_2 = "phase_2_parallel_analysis"
    PHASE_3 = "phase_3_contradiction_detection"
    PHASE_4 = "phase_4_synthesis"
    PHASE_5 = "phase_5_scoring"
    COMPLETED = "completed"
    FAILED = "failed"


# ══════════════════════════════════════════════════════════════════════════════
# Pipeline Context — the central state object
# ══════════════════════════════════════════════════════════════════════════════
@dataclass
class PipelineContext:
    """Mutable state object carried through every pipeline phase.

    Each field corresponds to the output of a specific agent or service.
    Agents read the fields they need and write their own output field.

    Attributes:
        analysis_id:          Unique UUID string for this analysis run.
        raw_input:            The original user-submitted text or URL.
        input_type:           ``"url"`` or ``"text"`` — tells Phase 1 whether
                              to scrape a website first.
        scraped_content:      Raw text extracted from the URL (if applicable).
        company_brief:        Structured output from the Data Structuring Agent.
        market_analysis:      Output from the Market Research Agent.
        competitor_analysis:  Output from the Competitor Agent.
        skeptic_analysis:     Output from the Skeptic Agent.
        assumptions:          Output from the Assumption Validator Agent.
        execution_feasibility: Output from the Execution Feasibility Agent.
        contradictions:       Output from the Contradiction Detector Agent.
        synthesized_memo:     Output from the Final Synthesizer Agent.
        score_breakdown:      Output from the Scoring Engine Agent.
        errors:               List of error dicts from any failed agent/service.
                              Each dict has ``{"agent": str, "error": str}``.
        current_phase:        Human-readable phase label (see PhaseStatus).
        progress:             Integer 0–100 representing overall completion.
    """

    # ── Required Fields (set at creation) ────────────────────────────────
    analysis_id: str
    raw_input: str
    input_type: str  # "url" or "text"

    # ── Phase 1: Data Structuring outputs ────────────────────────────────
    scraped_content: str | None = None
    company_brief: dict | None = None

    # ── Phase 2: Parallel Analysis outputs ───────────────────────────────
    market_analysis: dict | None = None
    competitor_analysis: dict | None = None
    skeptic_analysis: dict | None = None
    assumptions: dict | None = None
    execution_feasibility: dict | None = None

    # ── Phase 3: Contradiction Detection output ──────────────────────────
    contradictions: dict | None = None

    # ── Phase 4: Synthesis output ────────────────────────────────────────
    synthesized_memo: dict | None = None

    # ── Phase 5: Scoring output ──────────────────────────────────────────
    score_breakdown: dict | None = None

    # ── Metadata ─────────────────────────────────────────────────────────
    # `field(default_factory=list)` creates a FRESH list for every instance.
    # Without it, all instances would share the *same* list — a nasty bug.
    errors: list[dict] = field(default_factory=list)
    current_phase: str = PhaseStatus.QUEUED.value
    progress: int = 0

    # ── Helper Methods ───────────────────────────────────────────────────

    def add_error(self, agent_name: str, error_message: str) -> None:
        """Record an agent failure without crashing the pipeline.

        Args:
            agent_name:    Name of the agent that failed.
            error_message: Human-readable description of what went wrong.
        """
        self.errors.append({
            "agent": agent_name,
            "error": error_message,
        })

    def advance_phase(self, phase: PhaseStatus, progress: int) -> None:
        """Move the pipeline to the next phase and update progress.

        Args:
            phase:    The new ``PhaseStatus`` to transition to.
            progress: Updated progress percentage (0–100).
        """
        self.current_phase = phase.value
        self.progress = min(progress, 100)  # Never exceed 100%

    def has_critical_failure(self) -> bool:
        """Check whether the pipeline has accumulated too many errors.

        Currently, a "critical failure" means Phase 1 (data structuring)
        failed — without a company brief, nothing downstream makes sense.

        Returns:
            True if the pipeline should abort.
        """
        return self.company_brief is None and len(self.errors) > 0

    def to_dict(self) -> dict:
        """Serialise the entire context to a plain dict.

        Useful for persisting to the database or returning via API.
        """
        return {
            "analysis_id": self.analysis_id,
            "raw_input": self.raw_input,
            "input_type": self.input_type,
            "scraped_content": self.scraped_content,
            "company_brief": self.company_brief,
            "market_analysis": self.market_analysis,
            "competitor_analysis": self.competitor_analysis,
            "skeptic_analysis": self.skeptic_analysis,
            "assumptions": self.assumptions,
            "execution_feasibility": self.execution_feasibility,
            "contradictions": self.contradictions,
            "synthesized_memo": self.synthesized_memo,
            "score_breakdown": self.score_breakdown,
            "errors": self.errors,
            "current_phase": self.current_phase,
            "progress": self.progress,
        }
