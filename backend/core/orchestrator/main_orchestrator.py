"""
backend/core/orchestrator/main_orchestrator.py
───────────────────────────────────────────────
The central brain of Apex Intel's analysis pipeline.

The MainOrchestrator executes the 5-phase Directed Acyclic Graph (DAG):
  Phase 1 — Data Ingestion & Structuring
  Phase 2 — Parallel Agent Analysis
  Phase 3 — Cross-Validation (Contradiction Detection)
  Phase 4 — Synthesis (Final Memo Generation)
  Phase 5 — Scoring & Finalisation

Each phase updates the Report row in the database so the frontend
can poll for real-time progress.

Note: This is a scaffold that establishes the orchestrator interface.
The individual agent implementations will be plugged in as they are
completed by other workstreams.
"""

from __future__ import annotations

import logging
from typing import Any

from backend.db.connection import async_session_maker
from backend.repository.report_repository import ReportRepository

# ── Logger ───────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)


class MainOrchestrator:
    """
    Coordinates the full 5-phase analysis pipeline.

    This class is designed to be called from a FastAPI BackgroundTask.
    It creates its own database session (since the request-scoped
    session is already closed by the time background work starts).

    Usage
    -----
    ```python
    orchestrator = MainOrchestrator()
    await orchestrator.run_analysis(
        analysis_id="<uuid>",
        input_type="text",
        content="Acme Corp is a B2B SaaS company...",
    )
    ```
    """

    async def run_analysis(
        self,
        analysis_id: str,
        input_type: str,
        content: str,
    ) -> None:
        """
        Execute the complete analysis pipeline.

        Parameters
        ----------
        analysis_id : str
            UUID of the Report row to update.
        input_type : str
            "url" or "text".
        content : str
            The raw input from the user.
        """
        logger.info(
            "Orchestrator started  ▸  analysis_id=%s  input_type=%s",
            analysis_id,
            input_type,
        )

        # Create a fresh DB session for background work
        async with async_session_maker() as session:
            repo = ReportRepository(session)

            try:
                # ── Mark as in_progress ──────────────────────────────
                await repo.update_status(analysis_id, "in_progress")

                # ── Phase 1: Data Ingestion ──────────────────────────
                logger.info("[Phase 1] Data ingestion for %s", analysis_id)
                # TODO: Invoke DataAgent to structure the raw input
                #       into a CompanyBrief and persist it.

                # ── Phase 2: Parallel Agent Analysis ─────────────────
                logger.info("[Phase 2] Agent analysis for %s", analysis_id)
                # TODO: Run MarketAgent, CompetitorAgent, SkepticAgent,
                #       AssumptionAgent, ExecutionAgent concurrently
                #       using asyncio.gather() via AgentRunner.

                # ── Phase 3: Cross-Validation ────────────────────────
                logger.info("[Phase 3] Cross-validation for %s", analysis_id)
                # TODO: Run ContradictionDetector on Phase 2 outputs.

                # ── Phase 4: Synthesis ───────────────────────────────
                logger.info("[Phase 4] Synthesis for %s", analysis_id)
                # TODO: Run Synthesizer to compile the final memo.

                # ── Phase 5: Scoring ─────────────────────────────────
                logger.info("[Phase 5] Scoring for %s", analysis_id)
                # TODO: Run ScoringEngine on the synthesised memo.

                # ── Mark as completed ────────────────────────────────
                await repo.update_status(analysis_id, "completed")

                logger.info(
                    "Orchestrator completed  ▸  analysis_id=%s", analysis_id
                )

            except Exception as exc:
                logger.exception(
                    "Orchestrator failed for %s: %s", analysis_id, exc
                )
                # Mark as failed so the frontend knows
                try:
                    await repo.update_status(analysis_id, "failed")
                    await repo.update_report_field(
                        analysis_id,
                        "error_log",
                        {"error": str(exc), "phase": "orchestrator"},
                    )
                except Exception as update_err:
                    logger.exception(
                        "Failed to update error status: %s", update_err
                    )
