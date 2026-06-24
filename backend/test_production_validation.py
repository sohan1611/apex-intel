import asyncio
import os
import uuid
import urllib.request
import urllib.error
import json
import ssl
import time
from datetime import datetime, timezone

# Override the database URL to point to the live Railway Postgres DB via the TCP Proxy
os.environ["DATABASE_URL"] = "postgresql+asyncpg://postgres:VePxIqZCQLXjhosGTCGJdwvbftteVMQx@acela.proxy.rlwy.net:17660/railway"

from backend.db.connection import async_session_maker
from backend.db.models import User, Subscription, UsageTracking, AnalysisCredit
from backend.core.enums import SubscriptionTier
from backend.core.security import create_access_token

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

API_BASE = "https://apex-intel-production-ae8f.up.railway.app/api/v1"

async def create_user_on_live_db(tier: SubscriptionTier, credits: int = 0, analyses_used: int = 0, is_admin: bool = False):
    user_id = uuid.uuid4()
    async with async_session_maker() as session:
        user = User(
            id=user_id,
            email=f"test_{user_id}@example.com",
            name=f"Test User {tier.value} {is_admin}",
            is_admin=is_admin
        )
        session.add(user)
        
        sub = Subscription(user_id=user_id, tier=tier.value)
        session.add(sub)
        
        usage = UsageTracking(user_id=user_id, analyses_used=analyses_used, monthly_reset_date=datetime.now(timezone.utc))
        session.add(usage)
        
        cred = AnalysisCredit(user_id=user_id, purchased_credits=credits)
        session.add(cred)
        
        await session.commit()
        return str(user_id)

def call_analyze_api(token: str, content: str):
    url = f"{API_BASE}/analyze"
    data = json.dumps({'input_type': 'text', 'content': content}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    })
    
    try:
        with urllib.request.urlopen(req, context=ctx) as f:
            resp = json.loads(f.read().decode('utf-8'))
            return True, resp
    except urllib.error.HTTPError as e:
        return False, json.loads(e.read().decode('utf-8'))

async def run_live_tests():
    print("[START] Starting Live Environment Validation against Railway PostgreSQL...")
    
    # ── Scenario A: Free User (Limit 2) ──
    print("\n--- Scenario A: Free User (0 credits, 2 used) ---")
    uid_a = await create_user_on_live_db(SubscriptionTier.FREE, credits=0, analyses_used=2)
    tok_a = create_access_token({"sub": uid_a})
    success, resp = call_analyze_api(tok_a, "Test Free")
    if not success and resp.get('detail') and 'limit reached' in resp['detail']:
        print("[PASS] Free User blocked properly (Limit Enforced)")
    else:
        print(f"[FAIL] Expected 403 Forbidden, got: {resp}")

    # ── Scenario B: Free User + Credit ──
    print("\n--- Scenario B: Free User + Credit (1 credit, 2 used) ---")
    uid_b = await create_user_on_live_db(SubscriptionTier.FREE, credits=1, analyses_used=2)
    tok_b = create_access_token({"sub": uid_b})
    success, resp = call_analyze_api(tok_b, "Test Free + Credit")
    if success:
        print(f"[PASS] Free User with credit allowed. Analysis queued: {resp['analysis_id']}")
    else:
        print(f"[FAIL] Expected 200 OK, got: {resp}")

    # ── Scenario C: Pro Lite ──
    print("\n--- Scenario C: Pro Lite User (0 credits, 0 used) ---")
    uid_c = await create_user_on_live_db(SubscriptionTier.PRO_LITE, credits=0, analyses_used=0)
    tok_c = create_access_token({"sub": uid_c})
    success, resp = call_analyze_api(tok_c, "Test Pro Lite")
    if success:
        print(f"[PASS] Pro Lite user allowed. Analysis queued: {resp['analysis_id']}")
    else:
        print(f"[FAIL] Expected 200 OK, got: {resp}")

    # ── Scenario D: Pro ──
    print("\n--- Scenario D: Pro User (0 credits, 0 used) ---")
    uid_d = await create_user_on_live_db(SubscriptionTier.PRO, credits=0, analyses_used=0)
    tok_d = create_access_token({"sub": uid_d})
    success, resp = call_analyze_api(tok_d, "Test Pro")
    if success:
        print(f"[PASS] Pro user allowed. Analysis queued: {resp['analysis_id']}")
    else:
        print(f"[FAIL] Expected 200 OK, got: {resp}")

    # ── Scenario E: Admin ──
    print("\n--- Scenario E: Admin User (Over limit, 0 credits) ---")
    uid_e = await create_user_on_live_db(SubscriptionTier.FREE, credits=0, analyses_used=100, is_admin=True)
    tok_e = create_access_token({"sub": uid_e})
    success, resp = call_analyze_api(tok_e, "Test Admin")
    if success:
        print(f"[PASS] Admin user bypasses limits. Analysis queued: {resp['analysis_id']}")
    else:
        print(f"[FAIL] Expected 200 OK, got: {resp}")
        
    print("\n[SUCCESS] Live Validation Complete!")

if __name__ == "__main__":
    asyncio.run(run_live_tests())
