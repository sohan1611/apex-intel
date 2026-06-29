"""
backend/repository/report_repository.py
─────────────────────────────────────────
Data access layer for Report CRUD operations.

This module uses the **Repository Pattern** to isolate all database
queries behind a clean interface. Route handlers never write raw SQL —
they call methods like `create_report()` or `get_report_by_id()`.

Why use a repository?
  • **Testability** — you can swap this class for an in-memory fake in tests.
  • **Single Responsibility** — routes handle HTTP, repos handle persistence.
  • **Reusability** — the orchestrator, routes, and background tasks all
    share the same data-access logic.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Sequence

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import (
    Assumption,
    Competitor,
    Report,
    RiskAnalysis,
    ScoreBreakdown,
)

# ── Logger ───────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)


class ReportRepository:
    """Encapsulates all database operations for the `reports` table.

    Parameters
    ----------
    session : AsyncSession
        An active SQLAlchemy async session (provided by `get_db()`
        dependency or created manually in background tasks).
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ─────────────────────────────────────────────────────────────────
    #  CREATE
    # ─────────────────────────────────────────────────────────────────
    async def create_report(
        self,
        input_type: str,
        input_content: str,
        user_id: str | None = None,
    ) -> Report:
        """
        Create a new Report row with status='queued'.

        Parameters
        ----------
        input_type : str
            Either ``"url"`` or ``"text"``.
        input_content : str
            The raw URL or text submitted by the user.

        Returns
        -------
        Report
            The newly created ORM model instance (with auto-generated
            UUID primary key and timestamps).
        """
        report = Report(
            user_id=user_id,
            input_type=input_type,
            input_content=input_content,
            status="queued",
        )
        self._session.add(report)
        await self._session.commit()
        await self._session.refresh(report)

        logger.info("Created report %s (status=queued)", report.id)
        return report

    # ─────────────────────────────────────────────────────────────────
    #  READ — single report
    # ─────────────────────────────────────────────────────────────────
    async def get_report_by_id(
        self, report_id: str
    ) -> Report | None:
        """
        Fetch a single report by its UUID.

        Parameters
        ----------
        report_id : str
            String representation of the report UUID.

        Returns
        -------
        Report | None
            The matching report, or ``None`` if not found.
        """
        try:
            uid = uuid.UUID(report_id)
        except ValueError:
            logger.warning("Invalid UUID format: %s", report_id)
            return None

        stmt = select(Report).where(Report.id == uid)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    # ─────────────────────────────────────────────────────────────────
    #  READ — paginated list
    # ─────────────────────────────────────────────────────────────────
    async def list_reports(
        self,
        skip: int = 0,
        limit: int = 20,
        user_id: str | None = None,
    ) -> Sequence[Report]:
        """
        Retrieve a paginated list of reports, newest first.

        Parameters
        ----------
        skip : int
            Number of rows to skip (offset).
        limit : int
            Maximum number of rows to return.

        Returns
        -------
        Sequence[Report]
            List of Report ORM instances.
        """
        stmt = select(Report)
        if user_id:
            stmt = stmt.where(Report.user_id == uuid.UUID(user_id))
            
        stmt = stmt.order_by(Report.created_at.desc()).offset(skip).limit(limit)
        result = await self._session.execute(stmt)
        return result.scalars().all()

    # ─────────────────────────────────────────────────────────────────
    #  COUNT — for pagination metadata
    # ─────────────────────────────────────────────────────────────────
    async def count_reports(self, user_id: str | None = None) -> int:
        """
        Return the total number of reports in the database.

        Used alongside `list_reports()` to provide `total` in the
        paginated response.

        Returns
        -------
        int
            Total row count.
        """
        stmt = select(func.count()).select_from(Report)
        if user_id:
            stmt = stmt.where(Report.user_id == uuid.UUID(user_id))
        result = await self._session.execute(stmt)
        return result.scalar_one()

    # ─────────────────────────────────────────────────────────────────
    #  UPDATE — status
    # ─────────────────────────────────────────────────────────────────
    async def update_status(
        self,
        report_id: str,
        status: str,
    ) -> None:
        """
        Update the status of a report.

        Parameters
        ----------
        report_id : str
            String representation of the report UUID.
        status : str
            New status value (queued | in_progress | completed | failed).
        """
        uid = uuid.UUID(report_id)
        stmt = (
            update(Report)
            .where(Report.id == uid)
            .values(status=status)
        )
        await self._session.execute(stmt)
        await self._session.commit()

        logger.info("Updated report %s status → %s", report_id, status)

    # ─────────────────────────────────────────────────────────────────
    #  UPDATE — agent output (generic JSON column update)
    # ─────────────────────────────────────────────────────────────────
    async def update_report_field(
        self,
        report_id: str,
        field_name: str,
        value: Any,
    ) -> None:
        """
        Update a single JSON/scalar column on a Report row.

        This is used by the orchestrator to persist each agent's output
        as the pipeline progresses (e.g. setting `market_analysis`,
        `company_brief`, etc.).

        Parameters
        ----------
        report_id : str
            String representation of the report UUID.
        field_name : str
            Name of the column to update (must exist on the Report model).
        value : Any
            The new value for the column.

        Raises
        ------
        AttributeError
            If `field_name` doesn't correspond to a column on Report.
        """
        uid = uuid.UUID(report_id)

        # Validate that the field exists on the model
        if not hasattr(Report, field_name):
            raise AttributeError(
                f"Report model has no attribute '{field_name}'"
            )

        stmt = (
            update(Report)
            .where(Report.id == uid)
            .values(**{field_name: value})
        )
        await self._session.execute(stmt)
        await self._session.commit()

        logger.debug(
            "Updated report %s  field=%s", report_id, field_name
        )

    # ─────────────────────────────────────────────────────────────────
    #  DELETE
    # ─────────────────────────────────────────────────────────────────
    async def delete_report(self, report_id: str) -> bool:
        """
        Delete a report by its UUID.

        Parameters
        ----------
        report_id : str
            String representation of the report UUID.

        Returns
        -------
        bool
            ``True`` if the report existed and was deleted,
            ``False`` if not found.
        """
        report = await self.get_report_by_id(report_id)
        if report is None:
            return False

        await self._session.delete(report)
        await self._session.commit()

        logger.info("Deleted report %s", report_id)
        return True

    # ─────────────────────────────────────────────────────────────────
    #  CREATE — Relational Child Entities
    # ─────────────────────────────────────────────────────────────────
    async def add_competitors(self, report_id: str, competitors_data: list[dict[str, Any]]) -> None:
        uid = uuid.UUID(report_id)
        for comp in competitors_data:
            c = Competitor(
                report_id=uid,
                name=comp.get("name", "Unknown"),
                pricing=comp.get("pricing"),
                positioning=comp.get("positioning"),
                strengths=comp.get("strengths", []),
                weaknesses=comp.get("weaknesses", []),
                source=comp.get("source", "agent"),
            )
            self._session.add(c)
        await self._session.commit()

    async def add_assumptions(self, report_id: str, assumptions_data: list[dict[str, Any]]) -> None:
        uid = uuid.UUID(report_id)
        for asm in assumptions_data:
            a = Assumption(
                report_id=uid,
                assumption=asm.get("assumption", ""),
                validation_difficulty=asm.get("validation_difficulty", "moderate"),
                impact_if_false=asm.get("impact_if_false", "moderate"),
                source=asm.get("source", "agent"),
            )
            self._session.add(a)
        await self._session.commit()

    async def add_risk_analyses(self, report_id: str, risks_data: list[dict[str, Any]]) -> None:
        uid = uuid.UUID(report_id)
        for rsk in risks_data:
            r = RiskAnalysis(
                report_id=uid,
                risk=rsk.get("risk", ""),
                severity=rsk.get("severity", "medium"),
                rationale=rsk.get("rationale", ""),
                source=rsk.get("source", "agent"),
            )
            self._session.add(r)
        await self._session.commit()

    async def set_score_breakdown(self, report_id: str, score_data: dict[str, Any]) -> None:
        uid = uuid.UUID(report_id)
        breakdown = score_data.get("breakdown", {})
        sb = ScoreBreakdown(
            report_id=uid,
            total_score=score_data.get("total_score", 0.0),
            market_opportunity=breakdown.get("market_opportunity", 0.0),
            competition_intensity=breakdown.get("competition_intensity", 0.0),
            execution_feasibility=breakdown.get("execution_feasibility", 0.0),
            risk_exposure=breakdown.get("risk_exposure", 0.0),
            investment_signal=score_data.get("investment_signal", "WEAK"),
            justification=score_data.get("justification", ""),
        )
        self._session.add(sb)
        await self._session.commit()

