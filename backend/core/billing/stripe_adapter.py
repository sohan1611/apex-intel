import stripe
from typing import Optional
from fastapi import HTTPException
import logging
from backend.core.billing.provider import BillingProvider, NormalizedBillingEvent
from backend.core.enums import SubscriptionTier
from backend.config.settings import settings
from backend.core.subscription import get_plan_config

logger = logging.getLogger(__name__)

class StripeAdapter(BillingProvider):
    
    def __init__(self):
        if settings.STRIPE_SECRET_KEY:
            stripe.api_key = settings.STRIPE_SECRET_KEY

    def is_enabled(self) -> bool:
        return bool(settings.STRIPE_SECRET_KEY)
        
    def _get_stripe_price_id(self, tier: SubscriptionTier) -> str:
        config = get_plan_config(tier)
        if not config.stripe_price_env:
            raise ValueError(f"Price ID not configured for tier {tier}")
        price_id = getattr(settings, config.stripe_price_env, None)
        if not price_id:
            raise ValueError(f"Price ID env var {config.stripe_price_env} is empty")
        return price_id

    def create_subscription_checkout(
        self, 
        tier: SubscriptionTier, 
        user_id: str, 
        success_url: str, 
        cancel_url: str
    ) -> str:
        if not self.is_enabled():
            raise HTTPException(status_code=501, detail="Stripe payments are not enabled.")
            
        try:
            price_id = self._get_stripe_price_id(tier)
            session = stripe.checkout.Session.create(
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                client_reference_id=user_id,
                metadata={'tier': tier.value, 'user_id': user_id, 'type': 'subscription'}
            )
            return session.url
        except Exception as e:
            logger.error(f"Stripe checkout error: {e}")
            raise HTTPException(status_code=500, detail="Failed to create checkout session")

    def create_payment_checkout(
        self, 
        amount: int, 
        user_id: str, 
        success_url: str, 
        cancel_url: str
    ) -> str:
        if not self.is_enabled():
            raise HTTPException(status_code=501, detail="Stripe payments are not enabled.")
            
        try:
            price_id = getattr(settings, "STRIPE_PRICE_CREDIT", None)
            if not price_id:
                raise ValueError("Credit price ID is not configured")
                
            session = stripe.checkout.Session.create(
                line_items=[{
                    'price': price_id,
                    'quantity': amount,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                client_reference_id=user_id,
                metadata={'amount': amount, 'user_id': user_id, 'type': 'credits'}
            )
            return session.url
        except Exception as e:
            logger.error(f"Stripe checkout error: {e}")
            raise HTTPException(status_code=500, detail="Failed to create checkout session")

    def parse_webhook(
        self, 
        payload: bytes, 
        headers: dict
    ) -> NormalizedBillingEvent:
        if not settings.STRIPE_WEBHOOK_SECRET:
            raise HTTPException(status_code=501, detail="Stripe webhook not configured")
            
        signature_header = headers.get("stripe-signature")
            
        try:
            event = stripe.Webhook.construct_event(
                payload, signature_header, settings.STRIPE_WEBHOOK_SECRET
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
                raise ValueError("No user_id found in Stripe session")

            if metadata.get('type') == 'credits':
                amount = int(metadata.get('amount', 0))
                return NormalizedBillingEvent(
                    provider="stripe",
                    event_id=event["id"],
                    event_type="credits_purchased",
                    user_id=user_id,
                    amount=amount,
                    raw_event=event
                )
            else:
                tier = metadata.get('tier')
                if tier:
                    return NormalizedBillingEvent(
                        provider="stripe",
                        event_id=event["id"],
                        event_type="subscription_upgraded",
                        user_id=user_id,
                        tier=tier,
                        raw_event=event
                    )
        
        return NormalizedBillingEvent(
            provider="stripe", 
            event_id=event.get("id", ""), 
            event_type="ignored", 
            user_id=""
        )
