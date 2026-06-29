from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db.connection import get_db
from backend.db.models import User
from backend.core.security import get_current_user
import logging
import stripe
from fastapi import Request
from backend.db.models import CreditUsageHistory
from backend.config.settings import settings
from sqlalchemy import select

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Billing"])

if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY

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
):
    from backend.core.enums import SubscriptionTier
    from backend.core.subscription import SUBSCRIPTION_PLANS, get_stripe_price_id
    
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
        
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Stripe payments are not yet enabled in this environment."
        )

    price_id = get_stripe_price_id(new_tier_enum)
    if not price_id:
        raise HTTPException(status_code=500, detail="Price ID not configured for this tier.")
    
    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url='http://localhost:3000/dashboard?upgrade=success',
            cancel_url='http://localhost:3000/pricing?upgrade=cancelled',
            client_reference_id=str(current_user.id),
            metadata={'tier': new_tier, 'user_id': str(current_user.id)}
        )
        return UpgradeResponse(
            message="Checkout session created",
            new_tier=new_tier_enum.value,
            checkout_url=checkout_session.url
        )
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@router.post("/credits", response_model=CreditPurchaseResponse)
async def purchase_credits(
    request: CreditPurchaseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive.")

    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Stripe payments are not yet enabled in this environment."
        )

    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price': settings.STRIPE_PRICE_CREDIT,
                    'quantity': request.amount,
                },
            ],
            mode='payment',
            success_url='http://localhost:3000/dashboard?purchase=success',
            cancel_url='http://localhost:3000/pricing?purchase=cancelled',
            client_reference_id=str(current_user.id),
            metadata={'amount': request.amount, 'user_id': str(current_user.id), 'type': 'credits'}
        )
        return CreditPurchaseResponse(
            message="Checkout session created",
            purchased_credits=current_user.analysis_credits.purchased_credits if current_user.analysis_credits else 0,
            checkout_url=checkout_session.url
        )
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=501, detail="Stripe webhook not configured")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('client_reference_id')
        metadata = session.get('metadata', {})
        
        if not user_id:
            logger.error("No user_id found in Stripe session")
            return {"status": "error"}

        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            logger.error(f"User {user_id} not found for webhook processing")
            return {"status": "error"}

        if metadata.get('type') == 'credits':
            amount = int(metadata.get('amount', 0))
            if amount > 0 and user.analysis_credits:
                user.analysis_credits.purchased_credits += amount
                db.add(CreditUsageHistory(user_id=user.id, amount=amount, transaction_type="PURCHASE"))
                await db.commit()
                logger.info(f"Granted {amount} credits to {user.email}")
        else:
            tier = metadata.get('tier')
            if tier and user.subscription:
                user.subscription.tier = tier
                if user.usage_tracking:
                    user.usage_tracking.analyses_used = 0
                await db.commit()
                logger.info(f"Upgraded {user.email} to {tier}")

    return {"status": "success"}

