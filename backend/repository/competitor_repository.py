"""
Apex Intel — Competitor Repository
=====================================

Focused repository for **Competitor** records.  While
``ReportRepository.save_competitors()`` handles bulk creation during the
analysis pipeline, this repository provides finer-grained queries and
upsert logic needed by the API layer and future admin tools.

Why a separate repository?
---------------------------
The Report repository already has ~400 lines.  Keeping competitor-specific
queries in their own file follows the **Single Responsibility Principle**
and makes it easy to find competitor-related database logic.

Usage::

    from backend.repository.competitor_repository import CompetitorRepository

    repo = CompetitorRepository(session=db_session)
    competitors = await repo.get_competitors_by_report(report_id)
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import Competitor

# ── Logger ────────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)


class CompetitorRepository:
    """Database operations for the ``Competitor`` model.

    Attributes:
        _session: The bound ``AsyncSession``.
    """

    def __init__(self, session: AsyncSession) -> None:
        """Create a repository bound to a database session.

        Args:
            session: An active ``AsyncSession``.
        """
        self._session = session

    # ══════════════════════════════════════════════════════════════════════
    # READ — all competitors for a given report
    # ══════════════════════════════════════════════════════════════════════
    async def get_competitors_by_report(
        self,
        report_id: uuid.UUID,
    ) -> list[Competitor]:
        """Fetch all competitors associated with a specific report.

        Args:
            report_id: UUID of the parent report.

        Returns:
            List of ``Competitor`` ORM instances (may be empty).
        """
        result = await self._session.execute(
            select(Competitor)
            .where(Competitor.report_id == report_id)
            .order_by(Competitor.name)  # Alphabetical for consistency
        )
        competitors: list[Competitor] = list(result.scalars().all())

        logger.info(
            "[CompetitorRepo] Found %d competitors for report %s",
            len(competitors),
            report_id,
        )
        return competitors

    # ══════════════════════════════════════════════════════════════════════
    # UPSERT — create or update a single competitor
    # ══════════════════════════════════════════════════════════════════════
    async def upsert_competitor(
        self,
        report_id: uuid.UUID,
        competitor_data: dict[str, Any],
    ) -> Competitor:
        """Create a competitor or update it if one with the same name exists.

        The "upsert" pattern is useful when re-running an analysis:
        rather than duplicating competitors, we update the existing record.

        Match key: ``(report_id, name)`` — if a competitor with the same
        name already exists for this report, its fields are updated.

        Args:
            report_id:       UUID of the parent report.
            competitor_data: Dict with competitor fields::

                {
                    "name": "FinTechCo",
                    "pricing": "Freemium",
                    "positioning": "B2B SaaS",
                    "strengths": ["Strong brand"],
                    "weaknesses": ["High churn"],
                    "source": "search-based: https://…"
                }

        Returns:
            The created or updated ``Competitor`` instance.
        """
        name: str = competitor_data.get("name", "Unknown")

        # ── Check if a competitor with this name already exists ──────────
        result = await self._session.execute(
            select(Competitor).where(
                Competitor.report_id == report_id,
                Competitor.name == name,
            )
        )
        existing: Competitor | None = result.scalar_one_or_none()

        if existing:
            # ── UPDATE existing record ───────────────────────────────────
            existing.pricing = competitor_data.get("pricing", existing.pricing)
            existing.positioning = competitor_data.get(
                "positioning", existing.positioning
            )
            existing.strengths = competitor_data.get(
                "strengths", existing.strengths
            )
            existing.weaknesses = competitor_data.get(
                "weaknesses", existing.weaknesses
            )
            existing.source = competitor_data.get("source", existing.source)

            await self._session.commit()
            await self._session.refresh(existing)

            logger.info(
                "[CompetitorRepo] Updated competitor %r for report %s",
                name,
                report_id,
            )
            return existing

        # ── CREATE new record ────────────────────────────────────────────
        competitor = Competitor(
            report_id=report_id,
            name=name,
            pricing=competitor_data.get("pricing"),
            positioning=competitor_data.get("positioning"),
            strengths=competitor_data.get("strengths", []),
            weaknesses=competitor_data.get("weaknesses", []),
            source=competitor_data.get("source", "inferred-insight"),
        )
        self._session.add(competitor)
        await self._session.commit()
        await self._session.refresh(competitor)

        logger.info(
            "[CompetitorRepo] Created competitor %r for report %s",
            name,
            report_id,
        )
        return competitor

    # ══════════════════════════════════════════════════════════════════════
    # DELETE — remove a single competitor
    # ══════════════════════════════════════════════════════════════════════
    async def delete_competitor(
        self,
        competitor_id: uuid.UUID,
    ) -> bool:
        """Delete a competitor by its ID.

        Args:
            competitor_id: UUID of the competitor to remove.

        Returns:
            ``True`` if deleted, ``False`` if not found.
        """
        result = await self._session.execute(
            select(Competitor).where(Competitor.id == competitor_id)
        )
        competitor = result.scalar_one_or_none()

        if competitor is None:
            logger.warning(
                "[CompetitorRepo] Competitor %s not found for deletion",
                competitor_id,
            )
            return False

        await self._session.delete(competitor)
        await self._session.commit()

        logger.info("[CompetitorRepo] Deleted competitor %s", competitor_id)
        return True
