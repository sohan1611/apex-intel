from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db.connection import get_db
from backend.db.models import User, Subscription
from backend.core.security import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Billing"])

class UpgradeRequest(BaseModel):
    tier: str  # "PRO_LITE" or "PRO"

class UpgradeResponse(BaseModel):
    message: str
    new_tier: str

class CreditPurchaseRequest(BaseModel):
    amount: int

class CreditPurchaseResponse(BaseModel):
    message: str
    purchased_credits: int

@router.post("/upgrade", response_model=UpgradeResponse)
async def upgrade_subscription(
    request: UpgradeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mock endpoint to upgrade a user's subscription tier.
    In a real application, this would integrate with Stripe or Razorpay.
    """
    valid_tiers = {"FREE", "PRO_LITE", "PRO"}
    new_tier = request.tier.upper()
    
    if new_tier not in valid_tiers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subscription tier.",
        )
        
    subscription = current_user.subscription
    if not subscription:
        # Should not happen as it's created on login, but just in case
        subscription = Subscription(user_id=current_user.id)
        db.add(subscription)
        
    subscription.tier = new_tier
    
    if current_user.usage_tracking:
        current_user.usage_tracking.analyses_used = 0  # Reset usage on upgrade
    
    await db.commit()
    
    logger.info(f"User {current_user.email} upgraded to {new_tier}")
    
    return UpgradeResponse(
        message=f"Successfully upgraded to {new_tier}",
        new_tier=new_tier
    )

@router.post("/credits", response_model=CreditPurchaseResponse)
async def purchase_credits(
    request: CreditPurchaseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mock endpoint to purchase pay-per-analysis credits.
    """
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive.")

    # In a real system, we'd process payment here
    
    from backend.db.models import CreditUsageHistory
    
    if current_user.analysis_credits:
        current_user.analysis_credits.purchased_credits += request.amount
        
        # Log purchase
        history = CreditUsageHistory(
            user_id=current_user.id,
            amount=request.amount,
            transaction_type="PURCHASE"
        )
        db.add(history)
        
        await db.commit()
    else:
        raise HTTPException(status_code=500, detail="Credit wallet not found")
        
    logger.info(f"User {current_user.email} purchased {request.amount} credits")
    
    return CreditPurchaseResponse(
        message=f"Successfully purchased {request.amount} credits",
        purchased_credits=current_user.analysis_credits.purchased_credits
    )
