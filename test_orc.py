import asyncio
from backend.core.orchestrator.main_orchestrator import MainOrchestrator
from backend.db.connection import engine, async_session_maker
from backend.db.models import Base, Report

async def run():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session_maker() as session:
        new_report = Report(
            input_type="text",
            input_content="Acme Corp is a B2B SaaS company that provides AI-driven analytics for the healthcare industry.",
            status="queued"
        )
        session.add(new_report)
        await session.commit()
        await session.refresh(new_report)
        analysis_id = str(new_report.id)
        print("Created report:", analysis_id)
        
    orc = MainOrchestrator()
    await orc.run_analysis(
        analysis_id=analysis_id,
        input_type="text",
        content="Acme Corp is a B2B SaaS company that provides AI-driven analytics for the healthcare industry."
    )
    
    async with async_session_maker() as session:
        report = await session.get(Report, new_report.id)
        print("Final Status:", report.status)
        if report.error_log:
            print("Error log:", report.error_log)

if __name__ == '__main__':
    asyncio.run(run())
