from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from backend.db.connection import get_db
from backend.db.models import User
from backend.core.security import get_current_user
from backend.core.enums import SubscriptionTier
from backend.core.subscription import SUBSCRIPTION_PLANS
from backend.core.billing.stripe_adapter import StripeAdapter
from backend.core.billing.service import BillingService
from backend.core.billing.exceptions import DuplicateWebhookError
from backend.config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Billing"])

def get_billing_provider():
    if settings.PAYMENT_PROVIDER.lower() == "stripe":
        return StripeAdapter()
    elif settings.PAYMENT_PROVIDER.lower() == "razorpay":
        raise NotImplementedError("Razorpay adapter not yet implemented.")
    else:
        raise ValueError(f"Unknown payment provider: {settings.PAYMENT_PROVIDER}")

def get_billing_service(
    db: AsyncSession = Depends(get_db), 
    provider=Depends(get_billing_provider)
) -> BillingService:
    return BillingService(provider=provider, db=db)

class UpgradeRequest(BaseModel):
    tier: str

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
    current_user: User = Depends(get_current_user),
    service: BillingService = Depends(get_billing_service)
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

    try:
        checkout_url = await service.create_subscription_checkout(
            tier=new_tier_enum,
            user_id=str(current_user.id),
            success_url='http://localhost:3000/dashboard?upgrade=success',
            cancel_url='http://localhost:3000/pricing?upgrade=cancelled'
        )
    except Exception as e:
        logger.error(f"Error creating subscription checkout: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate checkout")
    
    return UpgradeResponse(
        message="Checkout session created",
        new_tier=new_tier_enum.value,
        checkout_url=checkout_url
    )

@router.post("/credits", response_model=CreditPurchaseResponse)
async def purchase_credits(
    request: CreditPurchaseRequest,
    current_user: User = Depends(get_current_user),
    service: BillingService = Depends(get_billing_service)
):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive.")

    try:
        checkout_url = await service.create_credit_checkout(
            amount=request.amount,
            user_id=str(current_user.id),
            success_url='http://localhost:3000/dashboard?purchase=success',
            cancel_url='http://localhost:3000/pricing?purchase=cancelled'
        )
    except Exception as e:
        logger.error(f"Error creating credit checkout: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate checkout")
    
    return CreditPurchaseResponse(
        message="Checkout session created",
        purchased_credits=current_user.analysis_credits.purchased_credits if current_user.analysis_credits else 0,
        checkout_url=checkout_url
    )

@router.post("/webhook")
async def billing_webhook(
    request: Request, 
    service: BillingService = Depends(get_billing_service)
):
    payload = await request.body()
    
    try:
        await service.process_webhook(payload, dict(request.headers))
    except DuplicateWebhookError:
        # We acknowledge duplicate webhooks so the provider stops sending them
        return {"status": "success", "message": "Already processed"}
    except ValueError as e:
        logger.error(f"Webhook parsing error: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload or signature")
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal processing error")

    return {"status": "success"}
