import jwt
from fastapi import Request
from backend.config.settings import settings
import logging

logger = logging.getLogger(__name__)

def get_user_rate_limit(request: Request) -> str:
    """
    Returns the appropriate rate limit string for the user based on their tier.
    Reads the JWT from the Authorization header to avoid DB lookups on every request.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return settings.RATE_LIMIT_FREE

    token = auth_header.split(" ")[1]
    try:
        # Decode without verifying expiration just for rate limit tiering (saves time)
        # We rely on FastAPI dependencies to actually enforce token validity.
        payload = jwt.decode(token, options={"verify_signature": False})
        
        is_admin = payload.get("is_admin", False)
        if is_admin:
            return settings.RATE_LIMIT_ADMIN
            
        tier = payload.get("tier", "FREE")
        if tier == "PRO":
            return settings.RATE_LIMIT_PRO
        elif tier == "PRO_LITE":
            return settings.RATE_LIMIT_PRO_LITE
            
        return settings.RATE_LIMIT_FREE
    except Exception as e:
        logger.debug(f"Rate limit JWT parse error: {e}")
        return settings.RATE_LIMIT_FREE
