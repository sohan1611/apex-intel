from fastapi import HTTPException, status
from backend.core.enums import SubscriptionTier
from backend.db.models import User
from backend.core.subscription import get_plan_config

def can_use_nine_agent_pipeline(user: User, using_credit: bool = False) -> bool:
    """PRO users or users paying with a credit get the full 9-agent pipeline."""
    if user.is_admin or using_credit:
        return True
    if not user.subscription:
        return False
    # Check if their plan includes the Full 9-Agent Pipeline
    config = get_plan_config(SubscriptionTier(user.subscription.tier))
    return "9-Agent" in config.pipeline_type

def can_use_premium_model(user: User, using_credit: bool = False) -> bool:
    """Check if the user gets the premium model."""
    if user.is_admin or using_credit:
        return True
    if not user.subscription:
        return False
    config = get_plan_config(SubscriptionTier(user.subscription.tier))
    # E.g. "Gemini 2.5 Flash Lite" vs "Gemini 2.5 Flash"
    return "Lite" not in config.ai_model

def can_view_score_breakdown(user: User, using_credit: bool = False) -> bool:
    if user.is_admin or using_credit:
        return True
    if not user.subscription:
        return False
    config = get_plan_config(SubscriptionTier(user.subscription.tier))
    for feature in config.features:
        if "Score Breakdown" in feature.name and feature.included:
            return True
    return False

def can_view_assumptions(user: User, using_credit: bool = False) -> bool:
    if user.is_admin or using_credit:
        return True
    if not user.subscription:
        return False
    config = get_plan_config(SubscriptionTier(user.subscription.tier))
    for feature in config.features:
        if "assumptions" in feature.name.lower() and feature.included:
            return True
    return False

def can_generate_investor_memo(user: User, using_credit: bool = False) -> bool:
    return can_use_nine_agent_pipeline(user, using_credit)

def can_use_premium_diligence(user: User, using_credit: bool = False) -> bool:
    return can_use_nine_agent_pipeline(user, using_credit)

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
        return False
        
    tier = SubscriptionTier(user.subscription.tier)
    used = user.usage_tracking.analyses_used
    
    config = get_plan_config(tier)
    limit = config.monthly_limit
    
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
        detail=f"Usage limit reached for {tier.value} tier. Please upgrade your plan or purchase credits."
    )
