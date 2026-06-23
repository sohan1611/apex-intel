from enum import Enum

class SubscriptionTier(str, Enum):
    FREE = "FREE"
    PRO_LITE = "PRO_LITE"
    PRO = "PRO"

class SubscriptionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CANCELED = "CANCELED"
    PAST_DUE = "PAST_DUE"
