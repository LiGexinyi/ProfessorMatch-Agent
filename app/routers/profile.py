from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserProfile
from app.schemas import UserProfileOut, UserProfileUpdate

router = APIRouter(prefix="/api/profile", tags=["profile"])


async def _get_or_create_user(db: AsyncSession) -> User:
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    if not user:
        user = User(name="Guest", email="guest@example.com")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


@router.get("", response_model=UserProfileOut)
async def get_profile(db: AsyncSession = Depends(get_db)):
    user = await _get_or_create_user(db)
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


@router.put("", response_model=dict)
async def update_profile(
    data: UserProfileUpdate, db: AsyncSession = Depends(get_db)
):
    user = await _get_or_create_user(db)
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    update_data = data.model_dump(exclude_unset=True)

    if profile:
        for key, value in update_data.items():
            setattr(profile, key, value)
    else:
        profile = UserProfile(user_id=user.id, **update_data)
        db.add(profile)

    await db.commit()
    return {"success": True}
