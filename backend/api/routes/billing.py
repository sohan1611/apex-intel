from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from backend.db.connection import get_db
from backend.db.models import User, CreditUsageHistory
from backend.core.security import get_current_user
from backend.core.enums import SubscriptionTier
from backend.core.subscription import SUBSCRIPTION_PLANS
from backend.core.billing.stripe_adapter import StripeAdapter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Billing"])

from backend.config.settings import settings

# Dependency to inject the billing provider
def get_billing_provider():
    if settings.PAYMENT_PROVIDER.lower() == "stripe":
        return StripeAdapter()
    elif settings.PAYMENT_PROVIDER.lower() == "razorpay":
        # return RazorpayAdapter()
        raise NotImplementedError("Razorpay adapter not yet implemented.")
    else:
        raise ValueError(f"Unknown payment provider: {settings.PAYMENT_PROVIDER}")

class UpgradeRequest(BaseModel):
    tier: str  # "PRO_LITE" or "PRO"

class UpgradeResponse(BaseModel):
    message: str
    new_tier: str
    checkout_url: str = None

class CreditPurchaseRequest(BaseModel):
    amount: int

class CreditPurchaseResponse(BaseModel):
    message: str
    purchased_credits: int
    checkout_url: str = None

@router.post("/upgrade", response_model=UpgradeResponse)
async def upgrade_subscription(
    request: UpgradeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    provider=Depends(get_billing_provider)
):
    try:
        new_tier_enum = SubscriptionTier(request.tier.upper())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subscription tier.",
        )
        
    if new_tier_enum not in SUBSCRIPTION_PLANS or SUBSCRIPTION_PLANS[new_tier_enum].price == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upgrade to this tier.",
        )

    checkout_url = provider.create_subscription_checkout(
        tier=new_tier_enum,
        user_id=str(current_user.id),
        success_url='http://localhost:3000/dashboard?upgrade=success',
        cancel_url='http://localhost:3000/pricing?upgrade=cancelled'
    )
    
    return UpgradeResponse(
        message="Checkout session created",
        new_tier=new_tier_enum.value,
        checkout_url=checkout_url
    )

@router.post("/credits", response_model=CreditPurchaseResponse)
async def purchase_credits(
    request: CreditPurchaseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    provider=Depends(get_billing_provider)
):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive.")

    checkout_url = provider.create_payment_checkout(
        amount=request.amount,
        user_id=str(current_user.id),
        success_url='http://localhost:3000/dashboard?purchase=success',
        cancel_url='http://localhost:3000/pricing?purchase=cancelled'
    )
    
    return CreditPurchaseResponse(
        message="Checkout session created",
        purchased_credits=current_user.analysis_credits.purchased_credits if current_user.analysis_credits else 0,
        checkout_url=checkout_url
    )

@router.post("/webhook")
async def billing_webhook(
    request: Request, 
    db: AsyncSession = Depends(get_db),
    provider=Depends(get_billing_provider)
):
    payload = await request.body()
    
    try:
        event = provider.parse_webhook(payload, dict(request.headers))
    except ValueError as e:
        logger.error(f"Webhook parsing error: {e}")
        return {"status": "error"}
        
    if event.event_type == "ignored":
        return {"status": "success"}
        
    if not event.user_id:
        logger.error("No user_id found in billing event")
        return {"status": "error"}

    stmt = select(User).where(User.id == event.user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        logger.error(f"User {event.user_id} not found for webhook processing")
        return {"status": "error"}

    if event.event_type == "credits_purchased" and event.amount:
        if event.amount > 0 and user.analysis_credits:
            user.analysis_credits.purchased_credits += event.amount
            db.add(CreditUsageHistory(user_id=user.id, amount=event.amount, transaction_type="PURCHASE"))
            await db.commit()
            logger.info(f"Granted {event.amount} credits to {user.email}")
            
    elif event.event_type == "subscription_upgraded" and event.tier:
        if user.subscription:
            user.subscription.tier = event.tier
            if user.usage_tracking:
                user.usage_tracking.analyses_used = 0
            await db.commit()
            logger.info(f"Upgraded {user.email} to {event.tier}")

    return {"status": "success"}
