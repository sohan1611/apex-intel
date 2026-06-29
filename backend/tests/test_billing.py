import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from backend.core.billing.service import BillingService
from backend.core.billing.exceptions import DuplicateWebhookError
from backend.core.billing.provider import NormalizedBillingEvent, BillingProvider
from backend.db.models import User, ProcessedWebhook, Subscription, CreditUsageHistory

@pytest.fixture
def mock_db():
    db = AsyncMock()
    # By default, scalar_one_or_none returns None (no processed webhook)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    db.execute.return_value = mock_result
    return db

@pytest.fixture
def mock_provider():
    provider = MagicMock(spec=BillingProvider)
    return provider

@pytest.mark.asyncio
async def test_duplicate_webhook_delivery(mock_db, mock_provider):
    service = BillingService(provider=mock_provider, db=mock_db)
    
    # Mock provider returning a valid event
    event = NormalizedBillingEvent(
        provider="stripe",
        event_id="evt_123",
        event_type="subscription_upgraded",
        user_id=str(uuid.uuid4())
    )
    mock_provider.parse_webhook.return_value = event
    
    # Mock db to return an existing SUCCESS ProcessedWebhook
    mock_processed = ProcessedWebhook(status="SUCCESS")
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_processed
    mock_db.execute.return_value = mock_result
    
    with pytest.raises(DuplicateWebhookError):
        await service.process_webhook(b"payload", {"sig": "header"})

@pytest.mark.asyncio
async def test_successful_subscription_upgrade(mock_db, mock_provider):
    service = BillingService(provider=mock_provider, db=mock_db)
    
    user_id = uuid.uuid4()
    event = NormalizedBillingEvent(
        provider="stripe",
        event_id="evt_123",
        event_type="subscription_upgraded",
        user_id=str(user_id),
        tier="PRO"
    )
    mock_provider.parse_webhook.return_value = event
    
    # First execute() is ensure_idempotency -> None (not processed)
    # Second execute() is User lookup -> Mock User
    # Third execute() is mark_webhook_status -> None (so it doesn't fail, though it should ideally find the processing one, but our mock is simple)
    
    mock_user = User(id=user_id, subscription=Subscription(tier="FREE"))
    
    # Setting up side effects for db.execute
    def execute_side_effect(*args, **kwargs):
        mock_result = MagicMock()
        # Simplistic mock: if querying User, return user, else return None
        if "users" in str(args[0]):
            mock_result.scalar_one_or_none.return_value = mock_user
        else:
            mock_result.scalar_one_or_none.return_value = None
        return mock_result
    
    mock_db.execute.side_effect = execute_side_effect
    
    await service.process_webhook(b"payload", {"sig": "header"})
    
    assert mock_user.subscription.tier == "PRO"
    assert mock_db.commit.called
