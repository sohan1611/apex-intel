from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from pydantic import BaseModel
from backend.core.enums import SubscriptionTier

class NormalizedBillingEvent(BaseModel):
    provider: str
    event_id: str
    event_type: str # "subscription_upgraded", "credits_purchased", etc.
    user_id: str
    tier: Optional[str] = None
    amount: Optional[int] = None
    raw_event: Dict[str, Any] = {}

class BillingProvider(ABC):
    
    @abstractmethod
    def is_enabled(self) -> bool:
        """Check if the provider is configured and ready to use."""
        pass

    @abstractmethod
    def create_subscription_checkout(
        self, 
        tier: SubscriptionTier, 
        user_id: str, 
        success_url: str, 
        cancel_url: str
    ) -> str:
        """Create a checkout session for a subscription upgrade and return the checkout URL."""
        pass
        
    @abstractmethod
    def create_payment_checkout(
        self, 
        amount: int, 
        user_id: str, 
        success_url: str, 
        cancel_url: str
    ) -> str:
        """Create a checkout session for a one-time purchase (e.g. credits) and return the checkout URL."""
        pass
        
    @abstractmethod
    def parse_webhook(
        self, 
        payload: bytes, 
        headers: Dict[str, str]
    ) -> NormalizedBillingEvent:
        """Parse the raw webhook request from the provider into a generic NormalizedBillingEvent.
        Raises ValueError or HTTPException on invalid signature/payload."""
        pass
