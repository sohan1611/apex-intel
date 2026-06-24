import asyncio
from backend.db.models import User, Subscription, UsageTracking, AnalysisCredit
from backend.core.enums import SubscriptionTier
from backend.core.feature_gates import (
    can_use_nine_agent_pipeline,
    can_use_premium_model,
    check_usage_limit
)

def create_mock_user(tier, credits=0, analyses_used=0, is_admin=False):
    user = User(is_admin=is_admin)
    user.subscription = Subscription(tier=tier.value)
    user.usage_tracking = UsageTracking(analyses_used=analyses_used)
    user.analysis_credits = AnalysisCredit(purchased_credits=credits)
    return user

def run_validation():
    print("Starting Validation (In-Memory)...")
    
    # Scenario A
    user_a = create_mock_user(SubscriptionTier.FREE, credits=0, analyses_used=0)
    using_credit_a = check_usage_limit(user_a)
    assert not using_credit_a
    assert can_use_nine_agent_pipeline(user_a, using_credit_a) == False
    assert can_use_premium_model(user_a, using_credit_a) == False
    print("[PASS] Scenario A Passed (Free User has optimized pipeline and free model)")
    
    # Scenario B
    user_b = create_mock_user(SubscriptionTier.FREE, credits=1, analyses_used=2)
    using_credit_b = check_usage_limit(user_b)
    assert using_credit_b == True
    assert can_use_nine_agent_pipeline(user_b, using_credit_b) == True
    assert can_use_premium_model(user_b, using_credit_b) == True
    print("[PASS] Scenario B Passed (Free User with credits gets full pipeline and premium model)")
    
    # Scenario C
    user_c = create_mock_user(SubscriptionTier.PRO_LITE, credits=0, analyses_used=0)
    using_credit_c = check_usage_limit(user_c)
    assert not using_credit_c
    assert can_use_nine_agent_pipeline(user_c, using_credit_c) == False
    assert can_use_premium_model(user_c, using_credit_c) == True
    print("[PASS] Scenario C Passed (Pro Lite gets optimized pipeline but premium model)")
    
    # Scenario D
    user_d = create_mock_user(SubscriptionTier.PRO, credits=0, analyses_used=0)
    using_credit_d = check_usage_limit(user_d)
    assert not using_credit_d
    assert can_use_nine_agent_pipeline(user_d, using_credit_d) == True
    assert can_use_premium_model(user_d, using_credit_d) == True
    print("[PASS] Scenario D Passed (Pro gets full pipeline and premium model)")
    
    # Scenario E
    user_e = create_mock_user(SubscriptionTier.FREE, credits=0, analyses_used=100, is_admin=True)
    using_credit_e = check_usage_limit(user_e)
    assert not using_credit_e # Admins don't use credits
    assert can_use_nine_agent_pipeline(user_e, using_credit_e) == True
    assert can_use_premium_model(user_e, using_credit_e) == True
    print("[PASS] Scenario E Passed (Admin gets unlimited features despite being over limits)")

    print("[SUCCESS] All validation scenarios passed!")

if __name__ == "__main__":
    run_validation()
