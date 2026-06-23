from fastapi import HTTPException, status
from backend.core.enums import SubscriptionTier
from backend.db.models import User

# Monthly limits
TIER_LIMITS = {
    SubscriptionTier.FREE.value: 2,
    SubscriptionTier.PRO_LITE.value: 5,
    SubscriptionTier.PRO.value: 10,
}

def can_use_nine_agent_pipeline(tier: str, using_credit: bool = False) -> bool:
    """PRO users or users paying with a credit get the full 9-agent pipeline."""
    if using_credit:
        return True
    return tier == SubscriptionTier.PRO.value

def can_use_premium_model(tier: str, using_credit: bool = False) -> bool:
    """PRO_LITE, PRO, or credit users get the PREMIUM_MODEL."""
    if using_credit:
        return True
    return tier in [SubscriptionTier.PRO_LITE.value, SubscriptionTier.PRO.value]

def can_view_score_breakdown(tier: str, using_credit: bool = False) -> bool:
    """PRO and credit users get the detailed score breakdown."""
    if using_credit:
        return True
    return tier == SubscriptionTier.PRO.value

def can_view_assumptions(tier: str, using_credit: bool = False) -> bool:
    """PRO LITE, PRO, and credit users get the assumptions & contradictions sections."""
    if using_credit:
        return True
    return tier in [SubscriptionTier.PRO_LITE.value, SubscriptionTier.PRO.value]

def can_generate_investor_memo(tier: str, using_credit: bool = False) -> bool:
    """PRO and credit users get the investor memo."""
    if using_credit:
        return True
    return tier == SubscriptionTier.PRO.value

def can_use_premium_diligence(tier: str, using_credit: bool = False) -> bool:
    """PRO and credit users get premium diligence mode."""
    if using_credit:
        return True
    return tier == SubscriptionTier.PRO.value

def check_usage_limit(user: User) -> bool:
    """
    Checks if a user can run an analysis.
    Returns `using_credit` (bool) indicating whether the analysis should deduct a credit.
    Raises HTTPException if user has exceeded their monthly usage AND has no credits.
    """
    if not user.subscription or not user.usage_tracking:
        raise HTTPException(status_code=403, detail="No active subscription or usage tracking found.")
        
    tier = user.subscription.tier
    used = user.usage_tracking.analyses_used
    limit = TIER_LIMITS.get(tier, 0)
    
    # 1. Check monthly subscription limit
    if used < limit:
        return False # Not using credit
    
    # 2. Check purchased credits
    if user.analysis_credits and user.analysis_credits.purchased_credits > 0:
        return True # Using credit

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN, 
        detail=f"Usage limit reached for {tier} tier. Please upgrade your plan or purchase credits."
    )
