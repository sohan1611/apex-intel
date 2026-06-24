from fastapi import HTTPException, status
from backend.core.enums import SubscriptionTier
from backend.db.models import User

from backend.config.settings import settings

# Monthly limits
TIER_LIMITS = {
    SubscriptionTier.FREE.value: settings.FREE_LIMIT,
    SubscriptionTier.PRO_LITE.value: settings.PRO_LITE_LIMIT,
    SubscriptionTier.PRO.value: settings.PRO_LIMIT,
}

def can_use_nine_agent_pipeline(user: User, using_credit: bool = False) -> bool:
    """PRO users or users paying with a credit get the full 9-agent pipeline."""
    if user.is_admin or using_credit:
        return True
    return user.subscription.tier == SubscriptionTier.PRO.value

def can_use_premium_model(user: User, using_credit: bool = False) -> bool:
    """PRO_LITE, PRO, or credit users get the PREMIUM_MODEL."""
    if user.is_admin or using_credit:
        return True
    return user.subscription.tier in [SubscriptionTier.PRO_LITE.value, SubscriptionTier.PRO.value]

def can_view_score_breakdown(user: User, using_credit: bool = False) -> bool:
    """PRO and credit users get the detailed score breakdown."""
    if user.is_admin or using_credit:
        return True
    return user.subscription.tier == SubscriptionTier.PRO.value

def can_view_assumptions(user: User, using_credit: bool = False) -> bool:
    """PRO LITE, PRO, and credit users get the assumptions & contradictions sections."""
    if user.is_admin or using_credit:
        return True
    return user.subscription.tier in [SubscriptionTier.PRO_LITE.value, SubscriptionTier.PRO.value]

def can_generate_investor_memo(user: User, using_credit: bool = False) -> bool:
    """PRO and credit users get the investor memo."""
    if user.is_admin or using_credit:
        return True
    return user.subscription.tier == SubscriptionTier.PRO.value

def can_use_premium_diligence(user: User, using_credit: bool = False) -> bool:
    """PRO and credit users get premium diligence mode."""
    if user.is_admin or using_credit:
        return True
    return user.subscription.tier == SubscriptionTier.PRO.value

def check_usage_limit(user: User) -> bool:
    """
    Checks if a user can run an analysis.
    Returns `using_credit` (bool) indicating whether the analysis should deduct a credit.
    Raises HTTPException if user has exceeded their monthly usage AND has no credits.
    """
    if not user.subscription or not user.usage_tracking:
        raise HTTPException(status_code=403, detail="No active subscription or usage tracking found.")
        
    from datetime import datetime, timezone
    
    # Check for monthly reset
    now_utc = datetime.now(timezone.utc)
    if user.usage_tracking.monthly_reset_date <= now_utc:
        # Reset is due. We return False to indicate it's a regular quota use.
        # The actual database update of the reset date and usage count will
        # happen in `analyze.py` during the transaction.
        return False
        
    tier = user.subscription.tier
    used = user.usage_tracking.analyses_used
    limit = TIER_LIMITS.get(tier, 0)
    
    if user.is_admin:
        return False # Admins never consume credits
        
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
