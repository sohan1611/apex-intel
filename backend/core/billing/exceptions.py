class BillingError(Exception):
    """Base class for all billing exceptions."""
    pass

class PaymentProviderError(BillingError):
    """Raised when the payment provider API fails."""
    pass

class WebhookVerificationError(BillingError):
    """Raised when a webhook signature cannot be verified."""
    pass

class DuplicateWebhookError(BillingError):
    """Raised when a webhook event has already been processed."""
    pass

class SubscriptionTransitionError(BillingError):
    """Raised for invalid subscription changes (e.g. invalid plan)."""
    pass

class CreditBalanceError(BillingError):
    """Raised when credit operations fail."""
    pass

class ConfigurationError(BillingError):
    """Raised when billing configuration is invalid or missing."""
    pass
