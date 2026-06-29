from dataclasses import dataclass
from typing import Optional, Dict, Any

@dataclass
class SubscriptionActivated:
    user_id: str
    tier: str
    provider: str
    event_id: str

@dataclass
class SubscriptionRenewed:
    user_id: str
    tier: str
    provider: str
    event_id: str

@dataclass
class SubscriptionCancelled:
    user_id: str
    provider: str
    event_id: str

@dataclass
class CreditsPurchased:
    user_id: str
    amount: int
    provider: str
    event_id: str

@dataclass
class CreditsRefunded:
    user_id: str
    amount: int
    provider: str
    event_id: str

@dataclass
class PaymentFailed:
    user_id: str
    provider: str
    event_id: str
    reason: Optional[str] = None

@dataclass
class WebhookIgnored:
    provider: str
    event_id: str
    reason: Optional[str] = None
