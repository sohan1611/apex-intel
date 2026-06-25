# Subscriptions & Billing

Apex Intel implements a tiered access model to control access to the AI evaluation pipeline.

## Tiers

1.  **FREE**
    - Default tier assigned to all new sign-ups.
    - Limits: 2 analyses per month.
    - Best for: Trying out the platform.
2.  **PRO_LITE**
    - Limits: 15 analyses per month.
    - Best for: Angel investors and solo operators.
3.  **PRO**
    - Limits: 50 analyses per month.
    - Features: Includes priority queuing (architected) and access to more advanced models (future-proofed).
    - Best for: VC funds and syndicates.

## Usage Tracking

Each user has an associated `usage_tracking` record in the database.
- `analyses_used`: Incremented each time an analysis successfully completes.
- `monthly_reset_date`: A timestamp updated every 30 days. When the current date passes this timestamp, `analyses_used` is reset to 0.

## Credits System

Users can also purchase unexpiring "Credits" which are consumed when their monthly quota runs out.
- The system first attempts to deduct from the monthly tier allowance.
- If the allowance is exhausted, the system checks `analysis_credits`.
- If credits exist, one is consumed; otherwise, a `403 Forbidden` error is returned.

## Upgrading

Endpoints are provided in `backend/api/routes/billing.py` to upgrade a user's subscription or purchase credits. In a production environment, these endpoints would integrate with a payment processor like Stripe via webhooks.
