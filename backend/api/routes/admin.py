from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from backend.db.session import get_db
from backend.db.models import User, Report, Subscription
from backend.core.security import get_current_user

router = APIRouter()

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.get("/stats")
async def get_global_stats(
    session: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve global platform statistics for admin dashboard."""
    # Count total users
    total_users_result = await session.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar() or 0
    
    # Count total reports
    total_reports_result = await session.execute(select(func.count(Report.id)))
    total_reports = total_reports_result.scalar() or 0
    
    # Count PRO users
    pro_users_result = await session.execute(
        select(func.count(Subscription.id)).where(Subscription.tier == "PRO")
    )
    pro_users = pro_users_result.scalar() or 0
    
    # Count PRO_LITE users
    pro_lite_users_result = await session.execute(
        select(func.count(Subscription.id)).where(Subscription.tier == "PRO_LITE")
    )
    pro_lite_users = pro_lite_users_result.scalar() or 0
    
    return {
        "total_users": total_users,
        "total_reports": total_reports,
        "pro_users": pro_users,
        "pro_lite_users": pro_lite_users
    }

@router.get("/users")
async def get_all_users(
    session: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve list of all users."""
    result = await session.execute(
        select(User)
        .order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "name": u.name,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ]
