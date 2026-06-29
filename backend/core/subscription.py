from typing import Dict, List, Optional
from pydantic import BaseModel
from backend.core.enums import SubscriptionTier

class PlanFeature(BaseModel):
    name: str
    included: bool

class PlanConfig(BaseModel):
    tier: SubscriptionTier
    name: str
    price: int  # Stored as integer value (e.g. 56)
    currency: str = "₹"
    interval: str = "/ month"
    description: str
    monthly_limit: int
    ai_model: str
    pipeline_type: str
    popular: bool = False
    features: List[PlanFeature]
    rank: int
    stripe_product_env: Optional[str] = None
    stripe_price_env: Optional[str] = None

# Single Source of Truth for the Backend
SUBSCRIPTION_PLANS: Dict[SubscriptionTier, PlanConfig] = {
    SubscriptionTier.FREE: PlanConfig(
        tier=SubscriptionTier.FREE,
        name="Free",
        price=0,
        interval="/ month",
        description="Perfect for exploring Apex Intel before upgrading.",
        monthly_limit=2,
        ai_model="Gemini 2.5 Flash Lite",
        pipeline_type="Optimized 3-Agent Pipeline",
        rank=0,
        features=[
            PlanFeature(name="2 analyses per month", included=True),
            PlanFeature(name="Uses previous-generation AI models", included=True),
            PlanFeature(name="Optimized 3-Agent Pipeline", included=True),
            PlanFeature(name="Basic company briefing", included=True),
            PlanFeature(name="Contradiction detection", included=False),
            PlanFeature(name="Hidden assumptions validation", included=False),
            PlanFeature(name="Detailed Investment Score Breakdown", included=False),
        ]
    ),
    SubscriptionTier.PAY_PER_ANALYSIS: PlanConfig(
        tier=SubscriptionTier.PAY_PER_ANALYSIS,
        name="Pay-Per-Analysis",
        price=29,
        interval="/ report",
        description="Need only one report? Purchase a single premium analysis without a subscription.",
        monthly_limit=0,
        ai_model="Gemini 2.5 Flash",
        pipeline_type="Full 9-Agent Pipeline",
        rank=1,
        stripe_price_env="STRIPE_PRICE_CREDIT",
        features=[
            PlanFeature(name="One-time purchase", included=True),
            PlanFeature(name="Credits never expire", included=True),
            PlanFeature(name="No subscription required", included=True),
            PlanFeature(name="Premium AI Model Access", included=True),
            PlanFeature(name="Complete 9-Agent Due Diligence", included=True),
            PlanFeature(name="Detailed Investment Score Breakdown", included=True),
            PlanFeature(name="Priority Founder Support", included=False),
        ]
    ),
    SubscriptionTier.PRO_LITE: PlanConfig(
        tier=SubscriptionTier.PRO_LITE,
        name="Pro Lite",
        price=45,
        interval="/ month",
        description="Ideal for students, founders, and regular startup research.",
        monthly_limit=5,
        ai_model="Gemini 2.5 Flash",
        pipeline_type="Standard 5-Agent Pipeline",
        rank=2,
        stripe_price_env="STRIPE_PRICE_PRO_LITE",
        features=[
            PlanFeature(name="5 analyses per month", included=True),
            PlanFeature(name="Premium AI Model Access", included=True),
            PlanFeature(name="Standard 5-Agent Pipeline", included=True),
            PlanFeature(name="Full Investment Report", included=True),
            PlanFeature(name="Contradiction detection", included=False),
            PlanFeature(name="Hidden assumptions validation", included=False),
            PlanFeature(name="Detailed Investment Score Breakdown", included=False),
        ]
    ),
    SubscriptionTier.PRO: PlanConfig(
        tier=SubscriptionTier.PRO,
        name="Pro",
        price=56,
        interval="/ month",
        description="Complete institutional-grade AI due diligence for investors and power users.",
        monthly_limit=10,
        ai_model="Gemini 2.5 Flash",
        pipeline_type="Full 9-Agent Pipeline",
        popular=True,
        rank=3,
        stripe_price_env="STRIPE_PRICE_PRO",
        features=[
            PlanFeature(name="10 analyses per month", included=True),
            PlanFeature(name="Premium AI Model Access", included=True),
            PlanFeature(name="Complete 9-Agent Due Diligence", included=True),
            PlanFeature(name="Full Investment Report", included=True),
            PlanFeature(name="Contradiction detection engine", included=True),
            PlanFeature(name="Hidden assumptions validation", included=True),
            PlanFeature(name="Detailed Investment Score Breakdown", included=True),
            PlanFeature(name="Priority Founder Support", included=True),
        ]
    )
}

def get_plan_config(tier: SubscriptionTier) -> PlanConfig:
    """Returns the strongly-typed plan configuration."""
    return SUBSCRIPTION_PLANS.get(tier, SUBSCRIPTION_PLANS[SubscriptionTier.FREE])

def get_stripe_price_id(tier: SubscriptionTier) -> Optional[str]:
    """Resolves the Stripe Price ID from settings dynamically based on the plan's env mapping."""
    from backend.config.settings import settings
    config = get_plan_config(tier)
    if not config.stripe_price_env:
        return None
    return getattr(settings, config.stripe_price_env, None)
