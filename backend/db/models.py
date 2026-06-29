"""
Apex Intel — SQLAlchemy ORM Models
====================================

Every table in the database is represented by a Python class here.
SQLAlchemy's **Declarative Mapping** lets us:

*   Define columns with Python type hints.
*   Express relationships (one-to-many, etc.) as plain attributes.
*   Automatically generate ``CREATE TABLE`` SQL via ``Base.metadata``.

Schema overview
---------------
::

    Report  ──┬── ScoreBreakdown   (1 : 0..1)
              ├── Competitor       (1 : N)
              ├── Assumption       (1 : N)
              └── RiskAnalysis     (1 : N)

Key SQLAlchemy 2.0 patterns used
---------------------------------
*   ``DeclarativeBase`` — the new-style base class (replaces
    ``declarative_base()``).
*   ``Mapped[T]`` + ``mapped_column(...)`` — explicit type annotations for
    every column.
*   ``relationship(back_populates=...)`` — bi-directional relationships
    without the old ``backref`` magic.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)


# ═══════════════════════════════════════════════════════════════════════════
# Base class — all models inherit from this
# ═══════════════════════════════════════════════════════════════════════════
class Base(DeclarativeBase):
    """Shared base for all ORM models.

    By centralising ``Base`` here every model automatically shares the
    same ``MetaData`` registry, which ``init_db()`` uses to create tables.
    """

    pass


# ═══════════════════════════════════════════════════════════════════════════
# Helper: generate UTC-aware timestamps
# ═══════════════════════════════════════════════════════════════════════════
def _utcnow() -> datetime:
    """Return the current UTC time as a timezone-aware datetime."""
    return datetime.now(timezone.utc)


# ═══════════════════════════════════════════════════════════════════════════
# 1. User & Subscription Models
# ═══════════════════════════════════════════════════════════════════════════
class User(Base):
    """Represents an authenticated user in the platform."""
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    is_admin: Mapped[bool] = mapped_column(default=False, nullable=False, server_default="false")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False)

    subscription: Mapped[Subscription | None] = relationship(
        "Subscription",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    usage_tracking: Mapped[UsageTracking | None] = relationship(
        "UsageTracking",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    analysis_credits: Mapped[AnalysisCredit | None] = relationship(
        "AnalysisCredit",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    reports: Mapped[list[Report]] = relationship(
        "Report",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Subscription(Base):
    """Tracks a user's subscription tier."""
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    
    tier: Mapped[str] = mapped_column(String(50), default="FREE", nullable=False) # FREE, PRO_LITE, PRO
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False)

    user: Mapped[User] = relationship("User", back_populates="subscription")

class UsageTracking(Base):
    """Tracks a user's monthly usage against their subscription limits."""
    __tablename__ = "usage_tracking"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    analyses_used: Mapped[int] = mapped_column(default=0, nullable=False)
    monthly_reset_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped[User] = relationship("User", back_populates="usage_tracking")

class AnalysisCredit(Base):
    """Tracks a user's purchased credits for Pay-Per-Analysis usage."""
    __tablename__ = "analysis_credits"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    purchased_credits: Mapped[int] = mapped_column(default=0, nullable=False)

    user: Mapped[User] = relationship("User", back_populates="analysis_credits")

class CreditUsageHistory(Base):
    """Immutable ledger of credit purchases and consumption."""
    __tablename__ = "credit_usage_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    amount: Mapped[int] = mapped_column(nullable=False) # Positive for purchase, negative for usage
    transaction_type: Mapped[str] = mapped_column(String(50), nullable=False) # PURCHASE, USAGE
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)


class ProcessedWebhook(Base):
    """Idempotency table to track processed webhooks from payment gateways."""
    __tablename__ = "processed_webhooks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    event_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # SUCCESS / FAILED
    retry_count: Mapped[int] = mapped_column(default=0, nullable=False)
    payload_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)


class BillingAudit(Base):
    """Audit trail for all billing-related events (subscriptions, credits)."""
    __tablename__ = "billing_audit"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    previous_state: Mapped[str | None] = mapped_column(String(255), nullable=True)
    new_state: Mapped[str | None] = mapped_column(String(255), nullable=True)
    metadata: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)


class CostTelemetry(Base):
    """Logs the estimated tokens and cost of an AI analysis run."""
    __tablename__ = "cost_telemetry"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    analysis_id: Mapped[str] = mapped_column(String(255), nullable=False)
    subscription_tier: Mapped[str] = mapped_column(String(50), nullable=False)
    model_used: Mapped[str] = mapped_column(String(100), nullable=False)
    pipeline_mode: Mapped[str] = mapped_column(String(50), nullable=False)
    estimated_token_usage: Mapped[int] = mapped_column(nullable=False)
    estimated_cost: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)


# ═══════════════════════════════════════════════════════════════════════════
# 2. Report — the central entity
# ═══════════════════════════════════════════════════════════════════════════
class Report(Base):
    """Represents a single due-diligence analysis run.

    Every field that stores structured agent output uses a ``JSON`` column
    so we can persist arbitrary nested data without extra tables.

    Attributes:
        id:                     Primary key (UUID v4).
        input_type:             ``"url"`` or ``"text"``.
        input_content:          The raw URL or pasted text the user submitted.
        status:                 Lifecycle state (queued → in_progress → completed / failed).
        company_brief:          Output of the Company Briefing Agent.
        market_analysis:        Output of the Market Analysis Agent.
        competitor_analysis:    Output of the Competitor Intelligence Agent.
        skeptic_analysis:       Output of the Skeptic Agent.
        assumptions:            Output of the Assumption Auditor Agent.
        execution_feasibility:  Output of the Execution Feasibility Agent.
        contradictions:         Output of the Contradiction Detector Agent.
        synthesized_memo:       Output of the Memo Synthesis Agent.
        overall_confidence_score: Aggregated confidence (0–100).
        red_flags:              Critical issues surfaced across agents.
        investment_signal:      Final signal — STRONG / MODERATE / WEAK.
        created_at:             When the analysis was requested.
        updated_at:             Last modification timestamp.
        error_log:              Structured error information (if any).
    """

    __tablename__ = "reports"

    # ── Primary Key ──────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Unique identifier for this report",
    )

    # ── Ownership ────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True, # Nullable for backward compatibility with old reports
        comment="User who owns this report",
    )

    # ── Input ────────────────────────────────────────────────────────────
    input_type: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        comment="'url' or 'text'",
    )
    input_content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Raw URL or pasted text submitted by the user",
    )

    # ── Status ───────────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20),
        default="queued",
        nullable=False,
        comment="Current lifecycle state of the report",
    )

    # ── Agent Outputs (JSON blobs) ───────────────────────────────────────
    company_brief: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None,
    )
    market_analysis: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None,
    )
    competitor_analysis: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None,
    )
    skeptic_analysis: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None,
    )
    assumptions: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None,
    )
    execution_feasibility: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None,
    )
    contradictions: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None,
    )
    synthesized_memo: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None,
    )

    # ── Aggregate Scores & Signals ───────────────────────────────────────
    overall_confidence_score: Mapped[float | None] = mapped_column(
        Float, nullable=True, default=None,
        comment="Aggregated confidence score (0–100)",
    )
    red_flags: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None,
        comment="Critical issues surfaced across agents",
    )
    investment_signal: Mapped[str | None] = mapped_column(
        String(20), nullable=True, default=None,
        comment="STRONG / MODERATE / WEAK",
    )

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        nullable=False,
        comment="When the analysis was requested",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        onupdate=_utcnow,
        nullable=False,
        comment="Last modification timestamp",
    )

    # ── Error Tracking ───────────────────────────────────────────────────
    error_log: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None,
        comment="Structured error information (if any)",
    )

    # ── Relationships (one-to-many) ──────────────────────────────────────
    user: Mapped[User | None] = relationship(
        "User",
        back_populates="reports",
        lazy="selectin",
    )
    # `cascade="all, delete-orphan"` means deleting a Report also deletes
    # its child rows — keeps the database tidy.
    score_breakdown: Mapped[ScoreBreakdown | None] = relationship(
        "ScoreBreakdown",
        back_populates="report",
        uselist=False,              # One report → one score breakdown
        cascade="all, delete-orphan",
        lazy="selectin",            # Eager-load when querying the report
    )
    competitors: Mapped[list[Competitor]] = relationship(
        "Competitor",
        back_populates="report",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    assumption_entries: Mapped[list[Assumption]] = relationship(
        "Assumption",
        back_populates="report",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    risk_entries: Mapped[list[RiskAnalysis]] = relationship(
        "RiskAnalysis",
        back_populates="report",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<Report id={self.id!s} status={self.status!r} "
            f"signal={self.investment_signal!r}>"
        )


# ═══════════════════════════════════════════════════════════════════════════
# 2. ScoreBreakdown
# ═══════════════════════════════════════════════════════════════════════════
class ScoreBreakdown(Base):
    """Detailed numeric breakdown of the investment score.

    Each category corresponds to a weight in ``SCORING_WEIGHTS``.
    The ``total_score`` is the weighted sum of all categories.
    """

    __tablename__ = "score_breakdowns"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # One score breakdown per report
        comment="FK → reports.id",
    )

    # ── Scores ───────────────────────────────────────────────────────────
    total_score: Mapped[float] = mapped_column(Float, nullable=False)
    market_opportunity: Mapped[float] = mapped_column(Float, nullable=False)
    competition_intensity: Mapped[float] = mapped_column(Float, nullable=False)
    execution_feasibility: Mapped[float] = mapped_column(Float, nullable=False)
    risk_exposure: Mapped[float] = mapped_column(Float, nullable=False)

    investment_signal: Mapped[str] = mapped_column(
        String(20), nullable=False,
        comment="STRONG / MODERATE / WEAK",
    )
    justification: Mapped[str] = mapped_column(
        Text, nullable=False,
        comment="Plain-English explanation of the score",
    )

    # ── Relationship back to Report ──────────────────────────────────────
    report: Mapped[Report] = relationship(
        "Report", back_populates="score_breakdown",
    )

    def __repr__(self) -> str:
        return (
            f"<ScoreBreakdown total={self.total_score:.1f} "
            f"signal={self.investment_signal!r}>"
        )


# ═══════════════════════════════════════════════════════════════════════════
# 3. Competitor
# ═══════════════════════════════════════════════════════════════════════════
class Competitor(Base):
    """A competitor identified by the Competitor Intelligence Agent."""

    __tablename__ = "competitors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=False,
        comment="FK → reports.id",
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    pricing: Mapped[str | None] = mapped_column(String(500), nullable=True)
    positioning: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Strengths & weaknesses are stored as JSON arrays of strings.
    strengths: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    weaknesses: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    source: Mapped[str] = mapped_column(
        String(500), nullable=False,
        comment="Where this competitor info was found",
    )

    # ── Relationship ─────────────────────────────────────────────────────
    report: Mapped[Report] = relationship(
        "Report", back_populates="competitors",
    )

    def __repr__(self) -> str:
        return f"<Competitor name={self.name!r}>"


# ═══════════════════════════════════════════════════════════════════════════
# 4. Assumption
# ═══════════════════════════════════════════════════════════════════════════
class Assumption(Base):
    """An assumption flagged by the Assumption Auditor Agent.

    Each assumption records how hard it would be to validate and what
    the impact would be if it turns out to be wrong.
    """

    __tablename__ = "assumptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=False,
        comment="FK → reports.id",
    )

    assumption: Mapped[str] = mapped_column(Text, nullable=False)
    validation_difficulty: Mapped[str] = mapped_column(
        String(20), nullable=False,
        comment="easy / moderate / hard / very_hard",
    )
    impact_if_false: Mapped[str] = mapped_column(
        String(20), nullable=False,
        comment="negligible / low / moderate / high / catastrophic",
    )
    source: Mapped[str] = mapped_column(
        String(500), nullable=False,
        comment="Which agent or data source surfaced this assumption",
    )

    # ── Relationship ─────────────────────────────────────────────────────
    report: Mapped[Report] = relationship(
        "Report", back_populates="assumption_entries",
    )

    def __repr__(self) -> str:
        return f"<Assumption difficulty={self.validation_difficulty!r}>"


# ═══════════════════════════════════════════════════════════════════════════
# 5. RiskAnalysis
# ═══════════════════════════════════════════════════════════════════════════
class RiskAnalysis(Base):
    """A risk identified by the Skeptic Agent.

    Each row captures a discrete risk, its severity, and the reasoning
    behind the classification.
    """

    __tablename__ = "risk_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=False,
        comment="FK → reports.id",
    )

    risk: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(
        String(20), nullable=False,
        comment="low / medium / high / critical",
    )
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(
        String(500), nullable=False,
        comment="Which agent or data source surfaced this risk",
    )

    # ── Relationship ─────────────────────────────────────────────────────
    report: Mapped[Report] = relationship(
        "Report", back_populates="risk_entries",
    )

    def __repr__(self) -> str:
        return f"<RiskAnalysis severity={self.severity!r}>"
