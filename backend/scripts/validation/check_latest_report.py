import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select, text
from backend.db.models import Report
from backend.config.settings import settings

engine = create_async_engine(settings.DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

async def main():
    async with async_session_maker() as db:
        # Get latest report
        result = await db.execute(select(Report).order_by(Report.created_at.desc()).limit(1))
        report = result.scalars().first()
        
        if report:
            print(f"Latest Report ID: {report.id}")
            print(f"Status: {report.status}")
            print(f"Target URL: {report.target_url}")
            
            # Get execution logs for this report
            logs_result = await db.execute(text(f"SELECT agent_name, status, error_message FROM agent_execution_logs WHERE report_id = '{report.id}'"))
            logs = logs_result.fetchall()
            print("\n--- Agent Execution Logs ---")
            for log in logs:
                print(f"Agent: {log[0]}, Status: {log[1]}, Error: {log[2]}")
                
            # Get orchestration telemetry for this report
            telemetry_result = await db.execute(text(f"SELECT * FROM orchestration_telemetry WHERE report_id = '{report.id}'"))
            telemetries = telemetry_result.fetchall()
            print("\n--- Orchestration Telemetry ---")
            for t in telemetries:
                print(t)
        else:
            print("No reports found")

if __name__ == "__main__":
    asyncio.run(main())
