"""
Apex Intel — Full Report Schemas
==================================

These deeply nested Pydantic models define the **complete** shape of a
finished due-diligence report.  Each sub-model corresponds to one agent's
output, making it easy to:

*   Validate agent responses at the boundary (catch malformed LLM output).
*   Serialise the report to JSON for the frontend.
*   Generate accurate OpenAPI documentation automatically.

Model hierarchy
---------------
::

    FullReportSchema
    ├── CompanyBrief
    ├── MarketAnalysis
    │   └── MarketTrend[]
    ├── CompetitorEntry[]
    ├── RiskEntry[]           (skeptic_analysis)
    ├── AssumptionEntry[]
    ├── ExecutionFeasibility
    ├── Contradiction[]
    ├── RedFlag[]
    └── ScoreBreakdownSchema
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════════════════
# Sub-models (alphabetical for easy lookup)
# ═══════════════════════════════════════════════════════════════════════════

class MarketTrend(BaseModel):
    """A single market trend identified by the Market Analysis Agent."""

    trend: str = Field(..., description="Description of the trend.")
    source: str = Field(..., description="Where this trend was observed.")


class MarketAnalysis(BaseModel):
    """Output of the Market Analysis Agent.

    TAM/SAM/SOM estimates may be ``None`` if the agent couldn't find
    reliable data — we prefer explicit nulls over made-up numbers.
    """

    tam_estimate: float | None = Field(
        default=None,
        description="Total Addressable Market estimate in USD.",
    )
    sam_estimate: float | None = Field(
        default=None,
        description="Serviceable Addressable Market estimate in USD.",
    )
    som_estimate: float | None = Field(
        default=None,
        description="Serviceable Obtainable Market estimate in USD.",
    )
    market_trends: list[MarketTrend] = Field(
        default_factory=list,
        description="Key trends affecting the target market.",
    )
    confidence_score: float = Field(
        ..., ge=0, le=100,
        description="Agent's self-assessed confidence (0–100).",
    )
    uncertainty_factor: str | None = Field(
        default=None,
        description="Primary source of uncertainty in the analysis.",
    )


class CompetitorEntry(BaseModel):
    """A single competitor identified by the Competitor Intelligence Agent."""

    name: str = Field(..., description="Competitor company name.")
    pricing: str | None = Field(
        default=None, description="Known pricing model or range."
    )
    positioning: str | None = Field(
        default=None, description="Market positioning statement."
    )
    strengths: list[str] = Field(
        default_factory=list, description="Key strengths."
    )
    weaknesses: list[str] = Field(
        default_factory=list, description="Key weaknesses."
    )
    source: str = Field(
        ..., description="Data source (URL, report name, etc.)."
    )


class RiskEntry(BaseModel):
    """A risk identified by the Skeptic Agent."""

    risk: str = Field(..., description="Description of the risk.")
    severity: str = Field(
        ..., description="low / medium / high / critical."
    )
    rationale: str = Field(
        ..., description="Why this is considered a risk."
    )
    source: str = Field(
        ..., description="Agent or data source that surfaced this risk."
    )


class AssumptionEntry(BaseModel):
    """An assumption flagged by the Assumption Auditor Agent."""

    assumption: str = Field(..., description="The assumption statement.")
    validation_difficulty: str = Field(
        ..., description="easy / moderate / hard / very_hard."
    )
    impact_if_false: str = Field(
        ...,
        description="negligible / low / moderate / high / catastrophic.",
    )
    source: str = Field(
        ..., description="Which agent or source surfaced this assumption."
    )


class ExecutionFeasibility(BaseModel):
    """Output of the Execution Feasibility Agent."""

    operational_difficulty: str = Field(
        ..., description="Overall difficulty assessment."
    )
    capital_requirements: str = Field(
        ..., description="Estimated capital needed (qualitative or range)."
    )
    time_to_market_estimate: str | None = Field(
        default=None,
        description="Estimated time to reach market (e.g. '6–12 months').",
    )
    rationale: str = Field(
        ..., description="Supporting reasoning."
    )
    source: str = Field(
        ..., description="Data source backing the assessment."
    )


class Contradiction(BaseModel):
    """A contradiction detected between different agent outputs."""

    description: str = Field(
        ..., description="What the contradiction is."
    )
    resolution_or_flag: str = Field(
        ...,
        description=(
            "How the contradiction was resolved, or a flag indicating "
            "it needs human review."
        ),
    )


class RedFlag(BaseModel):
    """A critical issue that warrants immediate attention."""

    flag: str = Field(..., description="Description of the red flag.")
    severity: str = Field(
        ..., description="low / medium / high / critical."
    )
    related_agents: list[str] = Field(
        default_factory=list,
        description="Names of agents whose output contributed to this flag.",
    )


class ScoreBreakdownSchema(BaseModel):
    """Numeric score breakdown — mirrors the ``score_breakdowns`` DB table."""

    total_score: float = Field(
        ..., ge=0, le=100,
        description="Weighted total score (0–100).",
    )
    market_opportunity: float = Field(
        ..., ge=0, le=100,
        description="Market opportunity sub-score.",
    )
    competition_intensity: float = Field(
        ..., ge=0, le=100,
        description="Competition intensity sub-score.",
    )
    execution_feasibility: float = Field(
        ..., ge=0, le=100,
        description="Execution feasibility sub-score.",
    )
    risk_exposure: float = Field(
        ..., ge=0, le=100,
        description="Risk exposure sub-score.",
    )
    investment_signal: str = Field(
        ..., description="STRONG / MODERATE / WEAK."
    )
    justification: str = Field(
        ..., description="Plain-English explanation of the score."
    )


class CompanyBrief(BaseModel):
    """High-level company snapshot from the Company Briefing Agent."""

    core_value_prop: str | None = Field(
        default=None,
        description="What the company fundamentally offers.",
    )
    target_customer_segment: str | None = Field(
        default=None,
        description="Primary customer segment being targeted.",
    )
    revenue_model: str | None = Field(
        default=None,
        description="How the company makes (or plans to make) money.",
    )


# ═══════════════════════════════════════════════════════════════════════════
# Top-level report model
# ═══════════════════════════════════════════════════════════════════════════

class FullReportSchema(BaseModel):
    """The complete due-diligence report returned to the frontend.

    Every field is optional (except ``id``, ``status``, and timestamps)
    because agents may still be running when the client fetches the report.
    Partial results are perfectly valid — the frontend shows whatever is
    available and greys out the rest.
    """

    # ── Identity & Status ────────────────────────────────────────────────
    id: uuid.UUID = Field(..., description="Report UUID.")
    status: str = Field(
        ..., description="queued | in_progress | completed | failed."
    )
    input_type: str | None = Field(
        default=None, description="url | text"
    )
    input_content: str | None = Field(
        default=None, description="The URL or text that was analyzed."
    )

    # ── Agent Outputs ────────────────────────────────────────────────────
    company_brief: CompanyBrief | None = None
    market_analysis: MarketAnalysis | None = None
    competitors: list[CompetitorEntry] = Field(default_factory=list)
    skeptic_analysis: list[RiskEntry] = Field(default_factory=list)
    assumptions: list[AssumptionEntry] = Field(default_factory=list)
    execution_feasibility: ExecutionFeasibility | None = None
    contradictions: list[Contradiction] = Field(default_factory=list)
    red_flags: list[RedFlag] = Field(default_factory=list)

    # ── Scoring ──────────────────────────────────────────────────────────
    score: ScoreBreakdownSchema | None = None
    overall_confidence_score: float | None = Field(
        default=None, ge=0, le=100,
        description="Aggregated confidence score (0–100).",
    )
    investment_signal: str | None = Field(
        default=None,
        description="STRONG / MODERATE / WEAK.",
    )

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: datetime
    updated_at: datetime

    # Allow ORM objects to be passed directly (SQLAlchemy models)
    model_config = {"from_attributes": True}
