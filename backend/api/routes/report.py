"""
backend/api/routes/report.py
─────────────────────────────
Report retrieval endpoints for Apex Intel.

This module exposes two endpoints:
  • GET /report/{report_id}  — Fetch a single completed report
  • GET /reports             — Paginated list of all reports

Why separate from analyze.py?
  Keeping "write" (submit analysis) and "read" (fetch results) concerns
  in separate files improves maintainability and makes the Swagger docs
  cleaner.

Note: This router does NOT define its own prefix. The prefix is applied
in main.py when the router is included via `app.include_router(...)`.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

# ── Internal imports ─────────────────────────────────────────────────
from backend.db.connection import get_db
from backend.schemas.response import ReportListResponse, ReportListItem
from backend.schemas.report_schema import (
    FullReportSchema,
    CompanyBrief,
    MarketAnalysis,
    CompetitorEntry,
    RiskEntry,
    AssumptionEntry,
    ExecutionFeasibility,
    Contradiction,
    RedFlag,
    ScoreBreakdownSchema,
)
from backend.repository.report_repository import ReportRepository
from backend.core.security import get_current_user
from backend.core.feature_gates import can_view_score_breakdown, can_view_assumptions
from backend.db.models import User

# ── Logger setup ─────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── Router definition ────────────────────────────────────────────────
# No prefix here — it's applied in main.py when this router is included.
router = APIRouter(tags=["Reports"])


# =====================================================================
#  GET /report/{report_id}
# =====================================================================
@router.get(
    "/report/{report_id}",
    summary="Get full report",
    description=(
        "Returns the complete analysis report once the pipeline has "
        "finished. If the analysis is still running, returns a slim "
        "status object instead."
    ),
)
async def get_report(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Retrieve a single analysis report by its ID.

    Behaviour
    ---------
    • If the report status is **"completed"**, the full structured
      Investment Memo (FullReportSchema) is returned.
    • If the report is still processing, a lightweight JSON with
      `status` and `progress` is returned so the client knows to
      keep polling.
    • If no report is found, a 404 is raised.

    Parameters
    ----------
    report_id : uuid.UUID
        The unique identifier of the report.

    Returns
    -------
    dict
        Either the full report or a processing-status object.
    """
    try:
        report_repo = ReportRepository(db)
        report = await report_repo.get_report_by_id(str(report_id))

        # ── 404 if the report doesn't exist or isn't owned by user ───
        if report is None or str(report.user_id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with id '{report_id}' not found.",
            )

        # ── If still processing, return lightweight status ───────────
        if report.status != "completed":
            return {
                "status": report.status,
                "progress": _estimate_progress(report.status),
                "current_phase": _get_current_phase(report),
                "error_log": report.error_log,
            }

        # ── Build the full report response ───────────────────────────
        # Parse JSON fields from the report model into their Pydantic
        # sub-schemas. Each field is nullable because a phase could
        # have failed / returned no data.
        full_report = _build_full_report(report)
        
        # ── Feature Gating (Strip premium data based on tier) ────────
        tier = current_user.subscription.tier if current_user.subscription else "FREE"
        if not can_view_score_breakdown(tier):
            full_report.score = None
        if not can_view_assumptions(tier):
            full_report.assumptions = []
            full_report.contradictions = []

        return full_report.model_dump(mode="json")

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "Error fetching report %s: %s", report_id, exc
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve the report.",
        ) from exc


# =====================================================================
#  GET /reports
# =====================================================================
@router.get(
    "/reports",
    response_model=ReportListResponse,
    summary="List all reports",
    description=(
        "Returns a paginated list of all analysis reports, newest "
        "first. Each item contains a summary — use GET /report/{id} "
        "to fetch full details."
    ),
)
async def list_reports(
    skip: int = Query(
        default=0,
        ge=0,
        description="Number of records to skip (for pagination).",
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Maximum number of records to return (1–100).",
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportListResponse:
    """
    Retrieve a paginated list of all reports.

    Parameters
    ----------
    skip : int
        Offset for pagination (default 0).
    limit : int
        Page size (default 20, max 100).

    Returns
    -------
    ReportListResponse
        Contains `total` count and a list of `ReportListItem` objects.
    """
    try:
        report_repo = ReportRepository(db)

        # Fetch paginated results and total count, filtered by user
        reports = await report_repo.list_reports(skip=skip, limit=limit, user_id=str(current_user.id))
        total = await report_repo.count_reports(user_id=str(current_user.id))

        # ── Transform each ORM row into a lightweight list item ──────
        items: list[ReportListItem] = []
        for r in reports:
            items.append(
                ReportListItem(
                    id=r.id,
                    input_type=r.input_type,
                    # Truncate long input content for the list view
                    input_content=_truncate(r.input_content, max_len=150),
                    status=r.status,
                    investment_signal=r.investment_signal,
                    total_score=r.score_breakdown.total_score if r.score_breakdown else None,
                    created_at=r.created_at,
                )
            )

        return ReportListResponse(total=total, reports=items)

    except Exception as exc:
        logger.exception("Error listing reports: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve reports.",
        ) from exc


# =====================================================================
#  Helper functions
# =====================================================================
def _truncate(text: str | None, max_len: int = 150) -> str:
    """
    Truncate a string to `max_len` characters, appending '…' if cut.

    Parameters
    ----------
    text : str | None
        The text to truncate.
    max_len : int
        Maximum allowed length (default 150).

    Returns
    -------
    str
        The truncated (or original) string.
    """
    if text is None:
        return ""
    if len(text) <= max_len:
        return text
    return text[:max_len] + "…"


def _estimate_progress(status_str: str) -> int:
    """
    Estimate overall progress percentage from the report status.

    Parameters
    ----------
    status_str : str
        Current report status string.

    Returns
    -------
    int
        Estimated progress percentage (0–100).
    """
    status_progress_map = {
        "queued": 0,
        "in_progress": 50,
        "completed": 100,
        "failed": 0,
    }
    return status_progress_map.get(status_str, 0)


def _get_current_phase(report: Any) -> str:
    """
    Determine the current analysis phase from the report's state.

    Inspects which JSON columns have been populated to infer how far
    the pipeline has progressed.

    Parameters
    ----------
    report : Report (ORM model)

    Returns
    -------
    str
        Human-readable phase label.
    """
    if report.status == "completed":
        return "completed"
    if report.status == "failed":
        return "failed"
    if report.status == "queued":
        return "waiting"

    # For "in_progress", check which fields are populated
    if report.synthesized_memo is not None:
        return "scoring_and_synthesis"
    if report.contradictions is not None:
        return "cross_validation"
    if report.market_analysis is not None or report.skeptic_analysis is not None:
        return "agent_analysis"
    if report.company_brief is not None:
        return "data_ingestion"

    return "data_ingestion"


def _build_full_report(report: Any) -> FullReportSchema:
    """
    Construct a `FullReportSchema` Pydantic model from an ORM Report row.

    This function carefully parses each nullable JSON column into the
    appropriate Pydantic sub-schema. If a column is None (e.g. the phase
    failed), the field is set to None or an empty list as appropriate.

    The Report model stores agent outputs as JSON blobs in individual
    columns. The related ORM models (Competitor, Assumption, RiskAnalysis,
    ScoreBreakdown) are accessed via eager-loaded relationships.

    Parameters
    ----------
    report : Report (ORM model)
        The SQLAlchemy Report object with all JSON fields populated.

    Returns
    -------
    FullReportSchema
        A fully structured Pydantic model ready for JSON serialization.
    """
    # ── Parse company_brief ──────────────────────────────────────────
    company_brief: CompanyBrief | None = None
    if report.company_brief and isinstance(report.company_brief, dict):
        try:
            company_brief = CompanyBrief(**report.company_brief)
        except ValidationError as e:
            logger.warning("Failed to parse company_brief for report %s: %s", report.id, e)

    # ── Parse market_analysis ────────────────────────────────────────
    market_analysis: MarketAnalysis | None = None
    if report.market_analysis and isinstance(report.market_analysis, dict):
        try:
            market_analysis = MarketAnalysis(**report.market_analysis)
        except ValidationError as e:
            logger.warning("Failed to parse market_analysis for report %s: %s", report.id, e)

    # ── Build competitors from the ORM relationship ──────────────────
    competitors: list[CompetitorEntry] = []
    if hasattr(report, "competitors") and report.competitors:
        for c in report.competitors:
            try:
                competitors.append(
                    CompetitorEntry(
                        name=c.name,
                        pricing=c.pricing,
                        positioning=c.positioning,
                        strengths=c.strengths or [],
                        weaknesses=c.weaknesses or [],
                        source=c.source,
                    )
                )
            except ValidationError:
                pass
    elif report.competitor_analysis and isinstance(report.competitor_analysis, list):
        for c in report.competitor_analysis:
            try:
                competitors.append(CompetitorEntry(**c))
            except ValidationError:
                pass

    # ── Build risk entries from the ORM relationship ─────────────────
    skeptic_analysis: list[RiskEntry] = []
    if hasattr(report, "risk_entries") and report.risk_entries:
        for r in report.risk_entries:
            try:
                skeptic_analysis.append(
                    RiskEntry(
                        risk=r.risk,
                        severity=r.severity,
                        rationale=r.rationale,
                        source=r.source,
                    )
                )
            except ValidationError:
                pass
    elif report.skeptic_analysis:
        # Handle both dict format {"top_risks": [...]} and raw list [...]
        if isinstance(report.skeptic_analysis, dict):
            risks = report.skeptic_analysis.get("top_risks", [])
        elif isinstance(report.skeptic_analysis, list):
            risks = report.skeptic_analysis
        else:
            risks = []
        for r in risks:
            try:
                skeptic_analysis.append(RiskEntry(**r))
            except ValidationError:
                pass

    # ── Build assumptions from the ORM relationship ──────────────────
    assumptions: list[AssumptionEntry] = []
    if hasattr(report, "assumption_entries") and report.assumption_entries:
        for a in report.assumption_entries:
            try:
                assumptions.append(
                    AssumptionEntry(
                        assumption=a.assumption,
                        validation_difficulty=a.validation_difficulty,
                        impact_if_false=a.impact_if_false,
                        source=a.source,
                    )
                )
            except ValidationError:
                pass
    elif report.assumptions:
        # Handle both dict format {"core_assumptions": [...]} and raw list [...]
        if isinstance(report.assumptions, dict):
            raw_assumptions = report.assumptions.get("core_assumptions", [])
        elif isinstance(report.assumptions, list):
            raw_assumptions = report.assumptions
        else:
            raw_assumptions = []
        for a in raw_assumptions:
            try:
                assumptions.append(AssumptionEntry(**a))
            except ValidationError:
                pass

    # ── Parse execution feasibility ──────────────────────────────────
    exec_feasibility: ExecutionFeasibility | None = None
    if report.execution_feasibility and isinstance(report.execution_feasibility, dict):
        try:
            exec_feasibility = ExecutionFeasibility(**report.execution_feasibility)
        except ValidationError as e:
            logger.warning("Failed to parse execution_feasibility for report %s: %s", report.id, e)

    # ── Parse contradictions ─────────────────────────────────────────
    contradictions: list[Contradiction] = []
    if report.contradictions:
        # Handle both dict format {"identified_contradictions": [...]} and raw list [...]
        if isinstance(report.contradictions, dict):
            raw_contradictions = report.contradictions.get("identified_contradictions", [])
        elif isinstance(report.contradictions, list):
            raw_contradictions = report.contradictions
        else:
            raw_contradictions = []
        for c in raw_contradictions:
            try:
                contradictions.append(Contradiction(**c))
            except ValidationError:
                pass

    # ── Parse red flags ──────────────────────────────────────────────
    red_flags: list[RedFlag] = []
    if report.red_flags:
        # Handle both list format and dict format {"flags": [...]}
        if isinstance(report.red_flags, dict):
            raw_flags = report.red_flags.get("flags", [])
        elif isinstance(report.red_flags, list):
            raw_flags = report.red_flags
        else:
            raw_flags = []
        for rf in raw_flags:
            try:
                red_flags.append(RedFlag(**rf))
            except ValidationError:
                pass

    # ── Build score breakdown from the ORM relationship ──────────────
    score: ScoreBreakdownSchema | None = None
    if hasattr(report, "score_breakdown") and report.score_breakdown:
        sb = report.score_breakdown
        try:
            score = ScoreBreakdownSchema(
                total_score=sb.total_score,
                market_opportunity=sb.market_opportunity,
                competition_intensity=sb.competition_intensity,
                execution_feasibility=sb.execution_feasibility,
                risk_exposure=sb.risk_exposure,
                investment_signal=sb.investment_signal,
                justification=sb.justification,
            )
        except ValidationError as e:
            logger.warning("Failed to parse score_breakdown for report %s: %s", report.id, e)

    # ── Assemble the full report ─────────────────────────────────────
    return FullReportSchema(
        id=report.id,
        status=report.status,
        input_type=report.input_type,
        input_content=report.input_content,
        company_brief=company_brief,
        market_analysis=market_analysis,
        competitors=competitors,
        skeptic_analysis=skeptic_analysis,
        assumptions=assumptions,
        execution_feasibility=exec_feasibility,
        contradictions=contradictions,
        red_flags=red_flags,
        score=score,
        overall_confidence_score=report.overall_confidence_score,
        investment_signal=report.investment_signal,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )
