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
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from backend.db.connection import async_session_maker
from backend.repository.report_repository import ReportRepository

from backend.services.scraping_service import ScrapingService
from backend.services.search_service import SearchService

from backend.agents.data_agent import DataAgent
from backend.agents.market_agent import MarketAgent
from backend.agents.competitor_agent import CompetitorAgent
from backend.agents.skeptic_agent import SkepticAgent
from backend.agents.assumption_agent import AssumptionAgent
from backend.agents.execution_agent import ExecutionAgent
from backend.agents.contradiction_agent import ContradictionAgent
from backend.agents.synthesizer import SynthesizerAgent
from backend.agents.scoring_engine import ScoringEngine

# ── Logger ───────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)


class MainOrchestrator:
    """
    Coordinates the full 5-phase analysis pipeline.

    This class is designed to be called from a FastAPI BackgroundTask.
    It creates its own database session (since the request-scoped
    session is already closed by the time background work starts).
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

        async with async_session_maker() as session:
            repo = ReportRepository(session)

            try:
                # ── Phase 1: Data Ingestion ──────────────────────────
                await repo.update_status(analysis_id, "structuring")
                logger.info("[Phase 1] Data ingestion for %s", analysis_id)
                
                scraped_content = ""
                if input_type == "url":
                    scraper = ScrapingService()
                    scraped_text = await scraper.scrape_url(content)
                    if scraped_text:
                        scraped_content = scraped_text
                
                data_agent = DataAgent()
                company_brief = await data_agent.run({
                    "raw_input": content,
                    "scraped_content": scraped_content
                })
                
                if "error" in company_brief:
                    raise RuntimeError(f"DataAgent failed: {company_brief['error']}")
                
                await repo.update_report_field(analysis_id, "company_brief", company_brief)

                # ── Phase 2: Parallel Agent Analysis ─────────────────
                await repo.update_status(analysis_id, "analysis")
                logger.info("[Phase 2] Agent analysis for %s", analysis_id)
                
                # Fetch search results for context
                search_service = SearchService()
                company_name = company_brief.get("core_value_prop", "Startup")
                search_results_data = await search_service.search(f"{company_name} market competitors")
                search_results = "\n".join(
                    [f"- {r['title']}: {r['snippet']} ({r.get('link', '')})" for r in search_results_data]
                )

                market_agent = MarketAgent()
                competitor_agent = CompetitorAgent()
                skeptic_agent = SkepticAgent()
                assumption_agent = AssumptionAgent()
                execution_agent = ExecutionAgent()

                market_task = market_agent.run({
                    "company_brief": str(company_brief),
                    "search_results": search_results
                })
                competitor_task = competitor_agent.run({
                    "company_brief": str(company_brief),
                    "search_results": search_results
                })
                skeptic_task = skeptic_agent.run({
                    "company_brief": str(company_brief),
                    "search_results": search_results
                })
                assumption_task = assumption_agent.run({
                    "company_brief": str(company_brief)
                })
                execution_task = execution_agent.run({
                    "company_brief": str(company_brief)
                })

                market_analysis, competitor_analysis, skeptic_analysis, assumptions, execution_feasibility = await asyncio.gather(
                    market_task, competitor_task, skeptic_task, assumption_task, execution_task,
                    return_exceptions=True
                )

                # Helper to handle exceptions
                def safe_result(res, agent):
                    if isinstance(res, Exception):
                        logger.error("%s failed: %s", agent.agent_name, res)
                        return agent._build_error_output(str(res))
                    return res

                market_analysis = safe_result(market_analysis, market_agent)
                competitor_analysis = safe_result(competitor_analysis, competitor_agent)
                skeptic_analysis = safe_result(skeptic_analysis, skeptic_agent)
                assumptions = safe_result(assumptions, assumption_agent)
                execution_feasibility = safe_result(execution_feasibility, execution_agent)

                await repo.update_report_field(analysis_id, "market_analysis", market_analysis)
                await repo.update_report_field(analysis_id, "competitor_analysis", competitor_analysis)
                await repo.update_report_field(analysis_id, "skeptic_analysis", skeptic_analysis)
                await repo.update_report_field(analysis_id, "assumptions", assumptions)
                await repo.update_report_field(analysis_id, "execution_feasibility", execution_feasibility)

                # Also populate relational tables if possible
                if "competitors" in competitor_analysis:
                    await repo.add_competitors(analysis_id, competitor_analysis["competitors"])
                if "assumptions" in assumptions:
                    await repo.add_assumptions(analysis_id, assumptions["assumptions"])
                if "risks" in skeptic_analysis:
                    await repo.add_risk_analyses(analysis_id, skeptic_analysis["risks"])

                # ── Phase 3: Cross-Validation ────────────────────────
                await repo.update_status(analysis_id, "contradictions")
                logger.info("[Phase 3] Cross-validation for %s", analysis_id)
                
                contradiction_agent = ContradictionAgent()
                contradictions = await contradiction_agent.run({
                    "company_brief": str(company_brief),
                    "market_analysis": str(market_analysis),
                    "competitor_analysis": str(competitor_analysis),
                    "skeptic_analysis": str(skeptic_analysis),
                    "assumptions": str(assumptions),
                    "execution_feasibility": str(execution_feasibility)
                })
                await repo.update_report_field(analysis_id, "contradictions", contradictions)

                # ── Phase 4: Synthesis ───────────────────────────────
                await repo.update_status(analysis_id, "synthesis")
                logger.info("[Phase 4] Synthesis for %s", analysis_id)
                
                synthesizer = SynthesizerAgent()
                synthesized_memo = await synthesizer.run({
                    "company_brief": str(company_brief),
                    "market_analysis": str(market_analysis),
                    "competitor_analysis": str(competitor_analysis),
                    "skeptic_analysis": str(skeptic_analysis),
                    "assumptions": str(assumptions),
                    "execution_feasibility": str(execution_feasibility),
                    "contradictions": str(contradictions)
                })
                await repo.update_report_field(analysis_id, "synthesized_memo", synthesized_memo)

                # ── Phase 5: Scoring ─────────────────────────────────
                await repo.update_status(analysis_id, "scoring")
                logger.info("[Phase 5] Scoring for %s", analysis_id)
                
                scoring_engine = ScoringEngine()
                scoring_result = await scoring_engine.run({
                    "synthesized_memo": synthesized_memo
                })
                
                if "error" not in scoring_result:
                    # Update report top-level fields
                    await repo.update_report_field(analysis_id, "overall_confidence_score", scoring_result.get("total_score", 0.0))
                    await repo.update_report_field(analysis_id, "investment_signal", scoring_result.get("investment_signal", "WEAK"))
                    
                    # Synthesized memo typically contains red_flags
                    red_flags = synthesized_memo.get("red_flags", [])
                    await repo.update_report_field(analysis_id, "red_flags", {"flags": red_flags})
                    
                    # Insert ScoreBreakdown relational entity
                    await repo.set_score_breakdown(analysis_id, scoring_result)

                # ── Mark as completed ────────────────────────────────
                await repo.update_status(analysis_id, "completed")
                logger.info("Orchestrator completed  ▸  analysis_id=%s", analysis_id)

            except Exception as exc:
                logger.exception("Orchestrator failed for %s: %s", analysis_id, exc)
                try:
                    await repo.update_status(analysis_id, "failed")
                    await repo.update_report_field(
                        analysis_id,
                        "error_log",
                        {"error": str(exc), "phase": "orchestrator"},
                    )
                except Exception as update_err:
                    logger.exception("Failed to update error status: %s", update_err)
