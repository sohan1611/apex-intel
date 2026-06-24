"""
backend/api/routes/analyze.py
─────────────────────────────
Analysis endpoints for Apex Intel.

This module exposes two endpoints:
  • POST /analyze   — Submit a new analysis request
  • GET  /analyze/{analysis_id}/status — Poll current progress

Flow (simplified):
  1. Client sends a URL or raw text via POST /analyze.
  2. The server creates a Report row (status="queued") in the DB.
  3. A FastAPI BackgroundTask kicks off the orchestrator pipeline.
  4. The client can then poll /analyze/{id}/status until completion.

Note: This router does NOT define its own prefix. The prefix is applied
in main.py when the router is included via `app.include_router(...)`.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

# ── Internal imports ─────────────────────────────────────────────────
# Database session dependency
from backend.db.connection import get_db

# Pydantic request / response models
from backend.schemas.request import AnalyzeRequest
from backend.schemas.response import (
    AnalyzeResponse,
    ReportStatusResponse,
)

# Repository layer — thin wrapper around DB queries
from backend.repository.report_repository import ReportRepository

# The main orchestrator that runs the 5-phase agent pipeline
from backend.core.orchestrator.main_orchestrator import MainOrchestrator
from backend.core.security import get_current_user
from backend.core.feature_gates import check_usage_limit, can_use_nine_agent_pipeline, can_use_premium_model
from backend.db.models import User, CreditUsageHistory
from backend.config.settings import settings

# ── Logger setup ─────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── Router definition ────────────────────────────────────────────────
# No prefix here — it's applied in main.py when this router is included.
# Tags group these endpoints in the auto-generated Swagger docs.
router = APIRouter(tags=["Analysis"])


# =====================================================================
#  POST /analyze
# =====================================================================
@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit a new analysis",
    description=(
        "Accepts a startup URL or raw text description and queues it "
        "for the autonomous AI analysis pipeline."
    ),
)
async def create_analysis(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalyzeResponse:
    """
    Create a new analysis job.

    Steps
    -----
    1. Validate the incoming request body (FastAPI does this automatically
       through the Pydantic model `AnalyzeRequest`).
    2. Persist a new Report row in the database with status='queued'.
    3. Schedule the heavy orchestrator work as a background task so the
       HTTP response returns immediately.
    4. Return the `analysis_id` and initial status to the client.

    Raises
    ------
    HTTPException 422
        If the request body fails Pydantic validation (handled by FastAPI).
    HTTPException 500
        If the database write fails or an unexpected error occurs.
    """
    try:
        # ── Step 0: Transactional lock for Usage & Credit ────────────────
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from datetime import datetime, timezone, timedelta
        
        stmt = select(User).options(
            selectinload(User.subscription),
            selectinload(User.usage_tracking),
            selectinload(User.analysis_credits)
        ).where(User.id == current_user.id).with_for_update()
        
        result = await db.execute(stmt)
        locked_user = result.scalar_one()
        
        # Handle monthly reset
        now_utc = datetime.now(timezone.utc)
        if locked_user.usage_tracking and locked_user.usage_tracking.monthly_reset_date <= now_utc:
            locked_user.usage_tracking.analyses_used = 0
            # Advance by 30 days
            locked_user.usage_tracking.monthly_reset_date = now_utc + timedelta(days=30)
            db.add(locked_user.usage_tracking)
            
        using_credit = check_usage_limit(locked_user)
        mode = settings.ANALYSIS_MODE_FULL if can_use_nine_agent_pipeline(locked_user, using_credit) else settings.ANALYSIS_MODE_OPTIMIZED
        model_name = settings.PREMIUM_MODEL if can_use_premium_model(locked_user, using_credit) else settings.FREE_MODEL

        # ── Step 1: Create a repository instance for DB operations ───
        report_repo = ReportRepository(db)
        
        # ── Step 1.5: Increment usage quota ──────────────────────────
        if using_credit:
            locked_user.analysis_credits.purchased_credits -= 1
            db.add(locked_user.analysis_credits)
            history = CreditUsageHistory(
                user_id=locked_user.id,
                amount=-1,
                transaction_type="USAGE"
            )
            db.add(history)
        else:
            if not locked_user.is_admin:
                locked_user.usage_tracking.analyses_used += 1
                db.add(locked_user.usage_tracking)
            
        await db.commit()

        # ── Step 2: Persist the new report with status='queued' ──────
        # The repository returns the full ORM model (or a dict) with
        # the auto-generated UUID primary key.
        report = await report_repo.create_report(
            input_type=request.input_type,
            input_content=request.content,
            user_id=str(current_user.id),
        )

        # Extract the report ID (UUID) that was generated
        analysis_id: uuid.UUID = report.id

        logger.info(
            "Analysis queued  ▸  id=%s  input_type=%s  content_length=%d",
            analysis_id,
            request.input_type,
            len(request.content),
        )

        # ── Step 3: Launch the orchestrator in the background ────────
        # BackgroundTasks runs *after* the HTTP response is sent, so
        # the user doesn't have to wait for the full pipeline.
        background_tasks.add_task(
            _run_analysis_pipeline,
            analysis_id=str(analysis_id),
            input_type=request.input_type,
            content=request.content,
            mode=mode,
            model_name=model_name,
        )

        # ── Step 4: Return immediate response ───────────────────────
        return AnalyzeResponse(
            analysis_id=analysis_id,
            status="queued",
        )

    except HTTPException:
        # Re-raise any HTTP exceptions we explicitly created
        raise

    except Exception as exc:
        # Catch-all for unexpected errors (DB issues, etc.)
        logger.exception("Failed to create analysis: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the analysis. "
                   "Please try again later.",
        ) from exc


# =====================================================================
#  GET /analyze/{analysis_id}/status
# =====================================================================
@router.get(
    "/analyze/{analysis_id}/status",
    response_model=ReportStatusResponse,
    summary="Check analysis status",
    description=(
        "Returns the current status of an analysis job, including "
        "progress percentage and the phase currently being executed."
    ),
)
async def get_analysis_status(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportStatusResponse:
    """
    Poll the processing status of an existing analysis.

    Parameters
    ----------
    analysis_id : uuid.UUID
        The unique identifier returned by POST /analyze.

    Returns
    -------
    ReportStatusResponse
        Contains `status`, `progress` (0–100), and `current_phase`.

    Raises
    ------
    HTTPException 404
        If no report with the given ID exists.
    HTTPException 500
        On unexpected internal errors.
    """
    try:
        report_repo = ReportRepository(db)
        report = await report_repo.get_report_by_id(str(analysis_id))

        # If the report doesn't exist, return a clear 404
        if report is None or str(report.user_id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis with id '{analysis_id}' not found.",
            )

        # ── Build the status response ────────────────────────────────
        # Progress is derived from the report status since the Report
        # model uses status as its lifecycle indicator:
        #   queued      →  0%
        #   in_progress → 50%  (midpoint; orchestrator updates this)
        #   completed   → 100%
        #   failed      →  0%
        progress = _estimate_progress(report.status)

        # Determine the current phase from the status string.
        # The orchestrator may store phase info in the report's JSON
        # fields as it progresses.
        current_phase = _get_current_phase(report)

        return ReportStatusResponse(
            analysis_id=report.id,
            status=report.status,
            progress=progress,
            current_phase=current_phase,
            error_log=report.error_log,
        )

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "Error fetching status for analysis %s: %s",
            analysis_id,
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve analysis status: {exc}",
        ) from exc


# =====================================================================
#  Helper functions
# =====================================================================
def _estimate_progress(status: str) -> int:
    """
    Estimate overall progress percentage from the report status.

    Since the Report model tracks status as a simple string (queued,
    in_progress, completed, failed), we map each to an approximate
    percentage. The orchestrator can refine this as it progresses
    through phases.

    Parameters
    ----------
    status : str
        Current report status string.

    Returns
    -------
    int
        Estimated progress percentage (0–100).
    """
    status_progress_map = {
        "queued": 0,
        "structuring": 10,
        "analysis": 50,
        "contradictions": 70,
        "synthesis": 85,
        "scoring": 95,
        "completed": 100,
        "failed": 0,
    }
    return status_progress_map.get(status, 0)


def _get_current_phase(report: Any) -> str:
    """
    Determine the current analysis phase from the report's state.

    Inspects which JSON columns have been populated to infer how far
    the pipeline has progressed. This provides a phase label for the
    frontend's progress indicator.

    Parameters
    ----------
    report : Report (ORM model)
        The SQLAlchemy Report object.

    Returns
    -------
    str
        Human-readable phase label.
    """
    return report.status


async def _run_analysis_pipeline(
    analysis_id: str,
    input_type: str,
    content: str,
    mode: str = "optimized",
    model_name: str = "gemini-2.5-flash",
) -> None:
    """
    Execute the full 5-phase orchestrator pipeline in the background.

    This function is called by FastAPI's BackgroundTasks mechanism.
    It creates its own DB session (since the request-scoped session
    is already closed by the time the background work starts).

    The orchestrator updates the Report row's status/progress/phase
    as it moves through each stage.
    """
    try:
        logger.info("Starting analysis pipeline for %s", analysis_id)

        # Create and run the orchestrator
        # The orchestrator manages its own DB session internally
        orchestrator = MainOrchestrator()
        await orchestrator.run_analysis(
            analysis_id=analysis_id,
            input_type=input_type,
            content=content,
            mode=mode,
            model_name=model_name,
        )

        logger.info("Analysis pipeline completed for %s", analysis_id)

    except Exception as exc:
        # Log the error — the orchestrator should handle updating the
        # report status to "failed" internally, but we log here as
        # a safety net.
        logger.exception(
            "Analysis pipeline FAILED for %s: %s",
            analysis_id,
            exc,
        )
