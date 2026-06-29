import logging
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.core.billing.provider import BillingProvider, NormalizedBillingEvent
from backend.core.billing.exceptions import (
    DuplicateWebhookError,
    SubscriptionTransitionError,
)
from backend.core.billing.events import (
    SubscriptionActivated,
    CreditsPurchased,
    PaymentFailed,
    WebhookIgnored
)
from backend.db.models import User, CreditUsageHistory, ProcessedWebhook, BillingAudit
from backend.core.enums import SubscriptionTier

logger = logging.getLogger(__name__)

class BillingService:
    def __init__(self, provider: BillingProvider, db: AsyncSession):
        self.provider = provider
        self.db = db

    async def _audit_log(
        self, 
        user_id: uuid.UUID, 
        provider: str, 
        event_type: str, 
        action: str, 
        previous_state: Optional[str] = None, 
        new_state: Optional[str] = None, 
        metadata: Optional[Dict[str, Any]] = None
    ):
        audit = BillingAudit(
            user_id=user_id,
            provider=provider,
            event_type=event_type,
            action=action,
            previous_state=previous_state,
            new_state=new_state,
            metadata=metadata
        )
        self.db.add(audit)

    async def _ensure_idempotency(self, event: NormalizedBillingEvent) -> bool:
        """Check if event is already processed. Returns True if processed, False if new."""
        stmt = select(ProcessedWebhook).where(
            ProcessedWebhook.provider == event.provider,
            ProcessedWebhook.event_id == event.event_id
        )
        result = await self.db.execute(stmt)
        record = result.scalar_one_or_none()
        
        if record:
            if record.status == "SUCCESS":
                return True
            else:
                # If it failed previously, we can retry by incrementing retry_count
                record.retry_count += 1
                return False
        
        # Create a new processing record
        record = ProcessedWebhook(
            provider=event.provider,
            event_id=event.event_id,
            event_type=event.event_type,
            status="PROCESSING"
        )
        self.db.add(record)
        await self.db.flush() # flush to lock it in the transaction
        return False

    async def _mark_webhook_status(self, event: NormalizedBillingEvent, status: str):
        stmt = select(ProcessedWebhook).where(
            ProcessedWebhook.provider == event.provider,
            ProcessedWebhook.event_id == event.event_id
        )
        result = await self.db.execute(stmt)
        record = result.scalar_one_or_none()
        if record:
            record.status = status

    async def create_subscription_checkout(self, tier: SubscriptionTier, user_id: str, success_url: str, cancel_url: str) -> str:
        return self.provider.create_subscription_checkout(tier, user_id, success_url, cancel_url)

    async def create_credit_checkout(self, amount: int, user_id: str, success_url: str, cancel_url: str) -> str:
        return self.provider.create_payment_checkout(amount, user_id, success_url, cancel_url)

    async def process_webhook(self, payload: bytes, headers: Dict[str, str]) -> None:
        # 1. Parse Event
        event = self.provider.parse_webhook(payload, headers)
        if event.event_type == "ignored":
            logger.info(f"Domain Event: {WebhookIgnored(provider=event.provider, event_id=event.event_id, reason='Ignored by provider')}")
            return

        if not event.user_id:
            logger.error("No user_id found in billing event")
            logger.info(f"Domain Event: {WebhookIgnored(provider=event.provider, event_id=event.event_id, reason='No user_id')}")
            return

        # 2. Idempotency Check
        if await self._ensure_idempotency(event):
            logger.info(f"Ignoring duplicate webhook: {event.event_id}")
            raise DuplicateWebhookError("Event already processed")

        try:
            # 3. Retrieve User
            stmt = select(User).where(User.id == uuid.UUID(event.user_id))
            result = await self.db.execute(stmt)
            user = result.scalar_one_or_none()

            if not user:
                logger.error(f"User {event.user_id} not found for webhook processing")
                await self._mark_webhook_status(event, "FAILED")
                await self.db.commit()
                return

            # 4. Handle Event Type
            if event.event_type == "credits_purchased" and event.amount:
                await self._grant_credits(user, event)
            elif event.event_type == "subscription_upgraded" and event.tier:
                await self._upgrade_subscription(user, event)
                
            # 5. Mark Success & Commit Transaction
            await self._mark_webhook_status(event, "SUCCESS")
            await self.db.commit()
            
        except Exception as e:
            # Rollback on business logic failure and mark as FAILED
            await self.db.rollback()
            # Start a new transaction to log the failure state
            await self._mark_webhook_status(event, "FAILED")
            await self.db.commit()
            logger.error(f"Failed to process webhook {event.event_id}: {e}")
            logger.info(f"Domain Event: {PaymentFailed(user_id=event.user_id, provider=event.provider, event_id=event.event_id, reason=str(e))}")
            raise

    async def _grant_credits(self, user: User, event: NormalizedBillingEvent):
        if event.amount and event.amount > 0 and user.analysis_credits:
            old_credits = user.analysis_credits.purchased_credits
            user.analysis_credits.purchased_credits += event.amount
            self.db.add(CreditUsageHistory(user_id=user.id, amount=event.amount, transaction_type="PURCHASE"))
            
            await self._audit_log(
                user_id=user.id,
                provider=event.provider,
                event_type=event.event_type,
                action="CreditsPurchased",
                previous_state=str(old_credits),
                new_state=str(user.analysis_credits.purchased_credits),
                metadata={"amount": event.amount}
            )
            logger.info(f"Granted {event.amount} credits to {user.email}")
            domain_event = CreditsPurchased(user_id=str(user.id), amount=event.amount, provider=event.provider, event_id=event.event_id)
            logger.info(f"Domain Event: {domain_event}")

    async def _upgrade_subscription(self, user: User, event: NormalizedBillingEvent):
        if user.subscription:
            old_tier = user.subscription.tier
            user.subscription.tier = event.tier
            if user.usage_tracking:
                user.usage_tracking.analyses_used = 0
            
            await self._audit_log(
                user_id=user.id,
                provider=event.provider,
                event_type=event.event_type,
                action="SubscriptionUpgraded",
                previous_state=old_tier,
                new_state=event.tier
            )
            logger.info(f"Upgraded {user.email} from {old_tier} to {event.tier}")
            domain_event = SubscriptionActivated(user_id=str(user.id), tier=event.tier, provider=event.provider, event_id=event.event_id)
            logger.info(f"Domain Event: {domain_event}")
