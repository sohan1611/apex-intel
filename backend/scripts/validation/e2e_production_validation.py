import asyncio
import httpx
import jwt
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.future import select
import os
import sys

# Append backend to path so we can import from it
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db.models import User, Subscription, UsageTracking, AnalysisCredit, CostTelemetry
from backend.core.enums import SubscriptionTier
from backend.config.settings import settings

# Railway Public DB URL
DB_URL = "postgresql+asyncpg://postgres:VePxIqZCQLXjhosGTCGJdwvbftteVMQx@acela.proxy.rlwy.net:17660/railway"
API_URL = "https://apex-intel-production-ae8f.up.railway.app/api/v1"

engine = create_async_engine(DB_URL, echo=False)
async_session_maker = async_sessionmaker(bind=engine, expire_on_commit=False)

def create_access_token(user_id: str) -> str:
    """Creates a JWT access token for testing."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

async def setup_users():
    print("Setting up users in DB...", flush=True)
    async with async_session_maker() as db:
        users = []
        scenarios = [
            # A: Free User (optimized, free model)
            ("Scenario A", SubscriptionTier.FREE.value, 0, 0, False),
            # B: Free User + Credit (full, premium)
            ("Scenario B", SubscriptionTier.FREE.value, 1, 2, False),
            # C: Pro Lite (optimized, premium)
            ("Scenario C", SubscriptionTier.PRO_LITE.value, 0, 0, False),
            # D: Pro (full, premium)
            ("Scenario D", SubscriptionTier.PRO.value, 0, 0, False),
            # E: Admin (unlimited features despite over limit)
            ("Scenario E", SubscriptionTier.FREE.value, 0, 100, True)
        ]
        
        for name, tier, credits, usage, is_admin in scenarios:
            user = User(
                email=f"test_{name.replace(' ', '_').lower()}@example.com",
                name=name,
                is_admin=is_admin
            )
            db.add(user)
            await db.flush()
            
            sub = Subscription(user_id=user.id, tier=tier)
            db.add(sub)
            
            future_date = datetime.now(timezone.utc) + timedelta(days=30)
            ut = UsageTracking(user_id=user.id, analyses_used=usage, monthly_reset_date=future_date)
            db.add(ut)
            
            ac = AnalysisCredit(user_id=user.id, purchased_credits=credits)
            db.add(ac)
            
            users.append((name, str(user.id)))
            
        await db.commit()
        return users

async def run_scenario(name: str, user_id: str):
    token = create_access_token(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"[{name}] Starting validation...", flush=True)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Check /me endpoint
        print(f"[{name}] Fetching /me...", flush=True)
        me_resp = await client.get(f"{API_URL}/auth/me", headers=headers)
        if me_resp.status_code != 200:
            print(f"[{name}] Failed to fetch /me: {me_resp.text}", flush=True)
            return
            
        # Post Analysis
        print(f"[{name}] Posting to /analyze...", flush=True)
        payload = {"input_type": "text", "content": f"Test company for {name}"}
        analyze_resp = await client.post(f"{API_URL}/analyze", json=payload, headers=headers)
        
        if analyze_resp.status_code != 200:
            print(f"[{name}] Failed to post /analyze: {analyze_resp.text}", flush=True)
            return
            
        data = analyze_resp.json()
        analysis_id = data.get("analysis_id")
        print(f"[{name}] Queued analysis: {analysis_id}", flush=True)
        
        # Poll Database for Telemetry (max 120 seconds)
        print(f"[{name}] Waiting for orchestrator telemetry...", flush=True)
        for i in range(24):
            await asyncio.sleep(5)
            async with async_session_maker() as db:
                stmt = select(CostTelemetry).where(CostTelemetry.analysis_id == analysis_id)
                result = await db.execute(stmt)
                telemetry = result.scalars().first()
                
                if telemetry:
                    print(f"[{name}] Telemetry Found -> Multiplier: {telemetry.cost_multiplier if hasattr(telemetry, 'cost_multiplier') else telemetry.pipeline_mode}, Model: {telemetry.model_used}", flush=True)
                    return
            print(f"[{name}] Polling {i+1}/24...", flush=True)
            
        print(f"[{name}] [FAILED] Telemetry not found after 120 seconds", flush=True)

async def cleanup_users():
    try:
        async with async_session_maker() as db:
            emails = [f"test_scenario_{x}@example.com" for x in ['a','b','c','d','e']]
            stmt = select(User).where(User.email.in_(emails))
            result = await db.execute(stmt)
            for user in result.scalars():
                await db.delete(user)
            await db.commit()
    except Exception as e:
        print(f"Initial cleanup failed: {e}", flush=True)

async def main():
    print("Starting e2e validation against Railway...", flush=True)
    await cleanup_users()
    users = await setup_users()
    print("Test users created!", flush=True)
    
    for name, user_id in users:
        print(f"\n--- Running {name} ---", flush=True)
        await run_scenario(name, user_id)
        
    print("\nCleaning up test users...", flush=True)
    try:
        async with async_session_maker() as db:
            for _, user_id in users:
                stmt = select(User).where(User.id == user_id)
                result = await db.execute(stmt)
                user = result.scalar_one_or_none()
                if user:
                    await db.delete(user)
            await db.commit()
        print("Cleanup done!", flush=True)
    except Exception as e:
        print(f"Cleanup failed (likely deadlock from background tasks): {e}", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
