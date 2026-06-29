"""
backend/core/orchestrator/main_orchestrator.py
───────────────────────────────────────────────
The central brain of Apex Intel's analysis pipeline.

The MainOrchestrator executes the 5-phase Directed Acyclic Graph (DAG).
It supports two modes:
  - "optimized": 3 LLM calls total (combines parallel agents & synthesis/scoring)
  - "full": 9 LLM calls total (legacy individual agents)
"""

from __future__ import annotations

import asyncio
import logging

from backend.config.settings import settings
from backend.db.connection import async_session_maker
from backend.repository.report_repository import ReportRepository

from backend.services.scraping_service import ScrapingService
from backend.services.search_service import SearchService

from backend.agents.data_agent import DataAgent
from backend.agents.comprehensive_agent import ComprehensiveAnalysisAgent
from backend.agents.final_synthesis_agent import FinalSynthesisAndScoringAgent

from backend.agents.market_agent import MarketAgent
from backend.agents.competitor_agent import CompetitorAgent
from backend.agents.skeptic_agent import SkepticAgent
from backend.agents.assumption_agent import AssumptionAgent
from backend.agents.execution_agent import ExecutionAgent
from backend.agents.contradiction_agent import ContradictionAgent
from backend.agents.synthesizer import SynthesizerAgent
from backend.agents.scoring_engine import ScoringEngine

logger = logging.getLogger(__name__)


class MainOrchestrator:
    """
    Coordinates the full analysis pipeline.
    """

    async def run_analysis(
        self,
        analysis_id: str,
        input_type: str,
        content: str,
        mode: str | None = None,
        model_name: str = "gemini-2.5-flash",
    ) -> None:
        execution_mode = mode or settings.ANALYSIS_MODE_OPTIMIZED
        logger.info(
            "Orchestrator started  ▸  analysis_id=%s  input_type=%s  mode=%s",
            analysis_id,
            input_type,
            execution_mode,
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
                
                data_agent = DataAgent(model_name=model_name)
                company_brief = await data_agent.run({
                    "raw_input": content,
                    "scraped_content": scraped_content
                })
                
                if "error" in company_brief:
                    raise RuntimeError(f"DataAgent failed: {company_brief['error']}")
                
                await repo.update_report_field(analysis_id, "company_brief", company_brief)

                if execution_mode == "optimized":
                    # ── OPTIMIZED MODE: 3 Calls Total ──────────────────────────
                    
                    # Phase 2: Comprehensive Analysis (1 Call)
                    await repo.update_status(analysis_id, "analysis")
                    logger.info("[Phase 2] Comprehensive analysis (optimized) for %s", analysis_id)
                    search_service = SearchService()
                    company_name = company_brief.get("core_value_prop", "Startup")
                    search_results_data = await search_service.search(f"{company_name} market competitors")
                    search_results = "\n".join(
                        [f"- {r['title']}: {r['snippet']} ({r.get('link', '')})" for r in search_results_data]
                    )

                    comprehensive_agent = ComprehensiveAnalysisAgent(model_name=model_name)
                    comprehensive_analysis = await comprehensive_agent.run({
                        "company_brief": str(company_brief),
                        "search_results": search_results
                    })

                    if "error" in comprehensive_analysis:
                        raise RuntimeError(f"ComprehensiveAnalysisAgent failed: {comprehensive_analysis['error']}")

                    # Update granular database fields
                    market_analysis = comprehensive_analysis.get("market_analysis", {})
                    competitor_analysis = comprehensive_analysis.get("competitor_analysis", {})
                    skeptic_analysis = comprehensive_analysis.get("skeptic_analysis", {})
                    assumptions = comprehensive_analysis.get("assumptions", {})
                    execution_feasibility = comprehensive_analysis.get("execution_feasibility", {})

                    await repo.update_report_field(analysis_id, "market_analysis", market_analysis)
                    await repo.update_report_field(analysis_id, "competitor_analysis", competitor_analysis)
                    await repo.update_report_field(analysis_id, "skeptic_analysis", skeptic_analysis)
                    await repo.update_report_field(analysis_id, "assumptions", assumptions)
                    await repo.update_report_field(analysis_id, "execution_feasibility", execution_feasibility)

                    # Populate relational tables
                    if isinstance(competitor_analysis, dict) and "competitors" in competitor_analysis:
                        await repo.add_competitors(analysis_id, competitor_analysis["competitors"])
                    if isinstance(assumptions, dict) and "core_assumptions" in assumptions:
                        await repo.add_assumptions(analysis_id, assumptions["core_assumptions"])
                    if isinstance(skeptic_analysis, dict) and "top_risks" in skeptic_analysis:
                        await repo.add_risk_analyses(analysis_id, skeptic_analysis["top_risks"])

                    # Phase 3-5: Synthesis & Scoring (1 Call)
                    await repo.update_status(analysis_id, "synthesis")
                    logger.info("[Phase 3-5] Final Synthesis & Scoring (optimized) for %s", analysis_id)
                    
                    synthesis_agent = FinalSynthesisAndScoringAgent(model_name=model_name)
                    final_result = await synthesis_agent.run({
                        "company_brief": str(company_brief),
                        "comprehensive_analysis": str(comprehensive_analysis)
                    })

                    if "error" in final_result:
                        raise RuntimeError(f"FinalSynthesisAndScoringAgent failed: {final_result['error']}")

                    contradictions = {"identified_contradictions": final_result.get("identified_contradictions", [])}
                    synthesized_memo = final_result.get("synthesized_memo", {})
                    scoring_result = final_result.get("scoring", {})

                    await repo.update_report_field(analysis_id, "contradictions", contradictions)
                    await repo.update_report_field(analysis_id, "synthesized_memo", synthesized_memo)
                    
                    await repo.update_status(analysis_id, "scoring")

                    await repo.update_report_field(analysis_id, "overall_confidence_score", scoring_result.get("total_score", 0.0) / 100)
                    await repo.update_report_field(analysis_id, "investment_signal", scoring_result.get("investment_signal", "WEAK"))
                    
                    red_flags = synthesized_memo.get("red_flags", []) if isinstance(synthesized_memo, dict) else []
                    await repo.update_report_field(analysis_id, "red_flags", {"flags": red_flags})
                    
                    await repo.set_score_breakdown(analysis_id, scoring_result)

                else:
                    # ── FULL MODE: 9 Calls Total ──────────────────────────
                    
                    # ── Phase 2: Parallel Agent Analysis ─────────────────
                    await repo.update_status(analysis_id, "analysis")
                    logger.info("[Phase 2] Agent analysis for %s", analysis_id)
                    
                    search_service = SearchService()
                    company_name = company_brief.get("core_value_prop", "Startup")
                    search_results_data = await search_service.search(f"{company_name} market competitors")
                    search_results = "\n".join(
                        [f"- {r['title']}: {r['snippet']} ({r.get('link', '')})" for r in search_results_data]
                    )

                    market_agent = MarketAgent(model_name=model_name)
                    competitor_agent = CompetitorAgent(model_name=model_name)
                    skeptic_agent = SkepticAgent(model_name=model_name)
                    assumption_agent = AssumptionAgent(model_name=model_name)
                    execution_agent = ExecutionAgent(model_name=model_name)

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

                    if isinstance(competitor_analysis, dict) and "competitors" in competitor_analysis:
                        await repo.add_competitors(analysis_id, competitor_analysis["competitors"])
                    elif isinstance(competitor_analysis, list) and competitor_analysis:
                        await repo.add_competitors(analysis_id, competitor_analysis)

                    if isinstance(assumptions, dict) and "core_assumptions" in assumptions:
                        await repo.add_assumptions(analysis_id, assumptions["core_assumptions"])
                    elif isinstance(assumptions, list) and assumptions:
                        await repo.add_assumptions(analysis_id, assumptions)

                    if isinstance(skeptic_analysis, dict) and "top_risks" in skeptic_analysis:
                        await repo.add_risk_analyses(analysis_id, skeptic_analysis["top_risks"])
                    elif isinstance(skeptic_analysis, list) and skeptic_analysis:
                        await repo.add_risk_analyses(analysis_id, skeptic_analysis)

                    # ── Phase 3: Cross-Validation ────────────────────────
                    await repo.update_status(analysis_id, "contradictions")
                    logger.info("[Phase 3] Cross-validation for %s", analysis_id)
                    
                    contradiction_agent = ContradictionAgent(model_name=model_name)
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
                    
                    synthesizer = SynthesizerAgent(model_name=model_name)
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
                    
                    scoring_engine = ScoringEngine(model_name=model_name)
                    scoring_result = await scoring_engine.run({
                        "synthesized_memo": synthesized_memo
                    })
                    
                    if "error" not in scoring_result:
                        await repo.update_report_field(analysis_id, "overall_confidence_score", scoring_result.get("total_score", 0.0) / 100)
                        await repo.update_report_field(analysis_id, "investment_signal", scoring_result.get("investment_signal", "WEAK"))
                        red_flags = synthesized_memo.get("red_flags", []) if isinstance(synthesized_memo, dict) else []
                        await repo.update_report_field(analysis_id, "red_flags", {"flags": red_flags})
                        await repo.set_score_breakdown(analysis_id, scoring_result)
                    else:
                        logger.warning(
                            "[Phase 5] Scoring engine returned error for %s: %s",
                            analysis_id, scoring_result.get("error"),
                        )

                # ── Cost Telemetry ───────────────────────────────────
                from backend.db.models import CostTelemetry, Report, User
                from sqlalchemy import select
                from sqlalchemy.orm import selectinload
                
                stmt = select(Report).where(Report.id == analysis_id)
                result = await session.execute(stmt)
                report = result.scalar_one_or_none()
                
                if report and report.user_id:
                    user_stmt = select(User).options(selectinload(User.subscription)).where(User.id == report.user_id)
                    user_res = await session.execute(user_stmt)
                    user_obj = user_res.scalar_one_or_none()
                    
                    if user_obj and user_obj.subscription:
                        multiplier = 3 if execution_mode == "optimized" else 9
                        est_tokens = 4500 * multiplier
                        est_cost = 0.015 * multiplier
                        
                        telemetry = CostTelemetry(
                            user_id=user_obj.id,
                            analysis_id=analysis_id,
                            subscription_tier=user_obj.subscription.tier,
                            model_used=model_name,
                            pipeline_mode=execution_mode,
                            estimated_token_usage=est_tokens,
                            estimated_cost=est_cost
                        )
                        session.add(telemetry)
                        await session.commit()

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
