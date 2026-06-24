from datetime import datetime, timedelta, timezone
import logging
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from google.oauth2 import id_token
from google.auth.transport import requests

from backend.config.settings import settings
from backend.db.connection import get_db
from backend.db.models import User, Subscription, UsageTracking, AnalysisCredit
from backend.core.security import create_access_token
from backend.core.enums import SubscriptionTier, SubscriptionStatus

logger = logging.getLogger(__name__)

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    id_token: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/google", response_model=TokenResponse)
async def google_login(request: GoogleLoginRequest, session: AsyncSession = Depends(get_db)):
    """Verifies Google id_token and returns a backend JWT."""
    try:
        # Verify the Google token (skip audience check if not configured)
        aud = settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None
        id_info = id_token.verify_oauth2_token(
            request.id_token, 
            requests.Request(), 
            audience=aud
        )
        
        google_id = id_info.get("sub")
        email = id_info.get("email")
        name = id_info.get("name")
        avatar = id_info.get("picture")
        
        if not google_id or not email:
            raise HTTPException(status_code=400, detail="Invalid Google token payload")

        # Check if user exists
        stmt = select(User).options(
            selectinload(User.subscription),
            selectinload(User.usage_tracking),
            selectinload(User.analysis_credits)
        ).where(User.google_id == google_id)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            # Create new user
            user = User(
                email=email,
                google_id=google_id,
                name=name,
                avatar=avatar
            )
            session.add(user)
            await session.flush()  # To get user.id generated
            
            # Create default FREE subscription
            subscription = Subscription(
                user_id=user.id,
                tier=SubscriptionTier.FREE.value,
                status=SubscriptionStatus.ACTIVE.value
            )
            session.add(subscription)

            # Create default Usage Tracking
            usage = UsageTracking(
                user_id=user.id,
                analyses_used=0,
                monthly_reset_date=datetime.now(timezone.utc) + timedelta(days=30)
            )
            session.add(usage)

            # Create default Analysis Credits wallet
            credits = AnalysisCredit(
                user_id=user.id,
                purchased_credits=0
            )
            session.add(credits)

            await session.commit()
            await session.refresh(user)
        else:
            # Update user info if changed
            user.name = name
            user.avatar = avatar
            
            if not user.subscription:
                subscription = Subscription(
                    user_id=user.id,
                    tier=SubscriptionTier.FREE.value,
                    status=SubscriptionStatus.ACTIVE.value
                )
                session.add(subscription)
            
            if not user.usage_tracking:
                usage = UsageTracking(
                    user_id=user.id,
                    analyses_used=0,
                    monthly_reset_date=datetime.now(timezone.utc) + timedelta(days=30)
                )
                session.add(usage)

            if not user.analysis_credits:
                credits = AnalysisCredit(
                    user_id=user.id,
                    purchased_credits=0
                )
                session.add(credits)
            
            await session.commit()
            
        # Generate backend access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "tier": user.subscription.tier},
            expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "avatar": user.avatar,
                "tier": user.subscription.tier,
                "analyses_used": user.usage_tracking.analyses_used,
                "monthly_reset_date": user.usage_tracking.monthly_reset_date.isoformat(),
                "purchased_credits": user.analysis_credits.purchased_credits,
                "is_admin": user.is_admin
            }
        )

    except ValueError as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")
    except Exception as e:
        logger.error(f"Error in google_login: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, session: AsyncSession = Depends(get_db)):
    """Registers a new user with email and password."""
    try:
        # Check if user exists
        stmt = select(User).options(
            selectinload(User.subscription),
            selectinload(User.usage_tracking),
            selectinload(User.analysis_credits)
        ).where(User.email == request.email)
        result = await session.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

        from backend.core.security import get_password_hash
        hashed_password = get_password_hash(request.password)

        user = User(
            email=request.email,
            name=request.name,
            hashed_password=hashed_password,
        )
        session.add(user)
        await session.flush()
        
        # Create default FREE subscription
        subscription = Subscription(
            user_id=user.id,
            tier=SubscriptionTier.FREE.value,
            status=SubscriptionStatus.ACTIVE.value
        )
        session.add(subscription)

        # Create default Usage Tracking
        usage = UsageTracking(
            user_id=user.id,
            analyses_used=0,
            monthly_reset_date=datetime.now(timezone.utc) + timedelta(days=30)
        )
        session.add(usage)

        # Create default Analysis Credits wallet
        credits = AnalysisCredit(
            user_id=user.id,
            purchased_credits=0
        )
        session.add(credits)

        await session.commit()
        await session.refresh(user)

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        from backend.core.security import create_access_token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "tier": user.subscription.tier},
            expires_delta=access_token_expires
        )

        return TokenResponse(
            access_token=access_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "avatar": user.avatar,
                "tier": user.subscription.tier,
                "analyses_used": user.usage_tracking.analyses_used,
                "monthly_reset_date": user.usage_tracking.monthly_reset_date.isoformat(),
                "purchased_credits": user.analysis_credits.purchased_credits,
                "is_admin": user.is_admin
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in register: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, session: AsyncSession = Depends(get_db)):
    """Logs in an existing user with email and password."""
    try:
        stmt = select(User).options(
            selectinload(User.subscription),
            selectinload(User.usage_tracking),
            selectinload(User.analysis_credits)
        ).where(User.email == request.email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        if not user or not user.hashed_password:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        from backend.core.security import verify_password
        if not verify_password(request.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        from backend.core.security import create_access_token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "tier": user.subscription.tier},
            expires_delta=access_token_expires
        )

        return TokenResponse(
            access_token=access_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "avatar": user.avatar,
                "tier": user.subscription.tier,
                "analyses_used": user.usage_tracking.analyses_used,
                "monthly_reset_date": user.usage_tracking.monthly_reset_date.isoformat(),
                "purchased_credits": user.analysis_credits.purchased_credits,
                "is_admin": user.is_admin
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in login: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

from backend.core.security import get_current_user

@router.get("/me")
async def get_me(session: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Returns the current user profile, useful for refreshing session state."""
    stmt = select(User).options(
        selectinload(User.subscription),
        selectinload(User.usage_tracking),
        selectinload(User.analysis_credits)
    ).where(User.id == current_user.id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "avatar": user.avatar,
            "tier": user.subscription.tier,
            "analyses_used": user.usage_tracking.analyses_used,
            "monthly_reset_date": user.usage_tracking.monthly_reset_date.isoformat(),
            "purchased_credits": user.analysis_credits.purchased_credits,
            "is_admin": user.is_admin
        }
    }
