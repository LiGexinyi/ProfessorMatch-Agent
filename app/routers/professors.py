from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Professor, User, UserProfessorInteraction
from app.schemas import (
    ContactStatusUpdate,
    FavoriteToggle,
    InteractionOut,
    ProfessorCreate,
    ProfessorOut,
)

router = APIRouter(prefix="/api/professors", tags=["professors"])


async def _get_or_create_user(db: AsyncSession) -> User:
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    if not user:
        user = User(name="Guest", email="guest@example.com")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


@router.get("", response_model=list[ProfessorOut])
async def list_professors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Professor))
    return result.scalars().all()


@router.get("/{professor_id}", response_model=ProfessorOut)
async def get_professor(professor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Professor).where(Professor.id == professor_id)
    )
    prof = result.scalar_one_or_none()
    if not prof:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Professor not found")
    return prof


@router.post("", response_model=dict)
async def create_professor(
    data: ProfessorCreate, db: AsyncSession = Depends(get_db)
):
    professor = Professor(**data.model_dump())
    db.add(professor)
    await db.commit()
    await db.refresh(professor)
    return {"id": professor.id, "success": True}


@router.post("/favorite", response_model=dict)
async def toggle_favorite(
    data: FavoriteToggle, db: AsyncSession = Depends(get_db)
):
    user = await _get_or_create_user(db)
    result = await db.execute(
        select(UserProfessorInteraction).where(
            UserProfessorInteraction.user_id == user.id,
            UserProfessorInteraction.professor_id == data.professor_id,
        )
    )
    interaction = result.scalar_one_or_none()

    if interaction:
        interaction.is_favorited = 1 if data.is_favorited else 0
    else:
        interaction = UserProfessorInteraction(
            user_id=user.id,
            professor_id=data.professor_id,
            is_favorited=1 if data.is_favorited else 0,
            contact_status="pending",
        )
        db.add(interaction)

    await db.commit()
    return {"success": True}


@router.post("/contact-status", response_model=dict)
async def update_contact_status(
    data: ContactStatusUpdate, db: AsyncSession = Depends(get_db)
):
    user = await _get_or_create_user(db)
    result = await db.execute(
        select(UserProfessorInteraction).where(
            UserProfessorInteraction.user_id == user.id,
            UserProfessorInteraction.professor_id == data.professor_id,
        )
    )
    interaction = result.scalar_one_or_none()

    if interaction:
        interaction.contact_status = data.contact_status
    else:
        interaction = UserProfessorInteraction(
            user_id=user.id,
            professor_id=data.professor_id,
            contact_status=data.contact_status,
            is_favorited=0,
        )
        db.add(interaction)

    await db.commit()
    return {"success": True}


@router.get("/user/interactions", response_model=list[InteractionOut])
async def get_user_interactions(db: AsyncSession = Depends(get_db)):
    user = await _get_or_create_user(db)
    result = await db.execute(
        select(UserProfessorInteraction).where(
            UserProfessorInteraction.user_id == user.id
        )
    )
    return result.scalars().all()


@router.get("/user/favorites", response_model=list[InteractionOut])
async def get_favorites(db: AsyncSession = Depends(get_db)):
    user = await _get_or_create_user(db)
    result = await db.execute(
        select(UserProfessorInteraction).where(
            UserProfessorInteraction.user_id == user.id,
            UserProfessorInteraction.is_favorited == 1,
        )
    )
    return result.scalars().all()
