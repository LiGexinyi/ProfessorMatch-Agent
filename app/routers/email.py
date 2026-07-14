import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import EmailDraft, Professor, User, UserProfile
from app.schemas import EmailDraftOut, EmailGenerate, EmailOptimize, EmailUpdate
from app.services.llm import extract_text_content, invoke_llm, parse_json_from_text

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/email", tags=["email"])


async def _get_or_create_user(db: AsyncSession) -> User:
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    if not user:
        user = User(name="Guest", email="guest@example.com")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


@router.post("/generate", response_model=dict)
async def generate_email(data: EmailGenerate, db: AsyncSession = Depends(get_db)):
    user = await _get_or_create_user(db)

    result = await db.execute(
        select(Professor).where(Professor.id == data.professor_id)
    )
    professor = result.scalar_one_or_none()
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")

    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()

    prompt = f"""You are an expert in writing professional cold emails to professors for research opportunities.

User Profile:
- Name: {user.name or "Applicant"}
- Email: {user.email or "N/A"}
- Research Direction: {profile.research_direction if profile else "Not specified"}
- Target Schools: {profile.target_schools if profile else "Not specified"}
- Degree Background: {profile.degree_background if profile else "Not specified"}
- GPA: {profile.gpa if profile else "Not specified"}
- Language Scores: {profile.language_scores if profile else "Not specified"}

Professor Information:
- Name: {professor.name}
- University: {professor.university or "Not specified"}
- Department: {professor.department or "Not specified"}
- Research Areas: {professor.research_areas or "Not specified"}
- Recent Publications: {professor.recent_publications or "Not specified"}

Please generate a professional, personalized cold email in English that:
1. Is concise and respectful (3-4 paragraphs)
2. Demonstrates genuine interest in the professor's research
3. Highlights relevant aspects of the applicant's background
4. Clearly expresses interest in research opportunities
5. Includes a professional closing

Return the email in the following JSON format:
{{
  "subject": "Email subject line",
  "body": "Email body text"
}}"""

    response = await invoke_llm(
        messages=[{"role": "user", "content": prompt}],
        model="gpt-4o-mini",
    )

    content = extract_text_content(response)
    if not content:
        raise HTTPException(status_code=500, detail="Failed to generate email")

    email_data = parse_json_from_text(content)
    if not email_data or not isinstance(email_data, dict):
        email_data = {"subject": "Research Opportunity Inquiry", "body": content}

    draft = EmailDraft(
        user_id=user.id,
        professor_id=data.professor_id,
        subject=email_data.get("subject", ""),
        body=email_data.get("body", ""),
    )
    db.add(draft)
    await db.commit()
    await db.refresh(draft)

    return {
        "id": draft.id,
        "subject": email_data.get("subject", ""),
        "body": email_data.get("body", ""),
    }


@router.get("/{draft_id}", response_model=EmailDraftOut)
async def get_email_draft(draft_id: int, db: AsyncSession = Depends(get_db)):
    user = await _get_or_create_user(db)
    result = await db.execute(
        select(EmailDraft).where(EmailDraft.id == draft_id)
    )
    draft = result.scalar_one_or_none()
    if not draft or draft.user_id != user.id:
        raise HTTPException(status_code=404, detail="Email draft not found")
    return draft


@router.post("/optimize", response_model=dict)
async def optimize_email(data: EmailOptimize, db: AsyncSession = Depends(get_db)):
    user = await _get_or_create_user(db)
    result = await db.execute(
        select(EmailDraft).where(EmailDraft.id == data.draft_id)
    )
    draft = result.scalar_one_or_none()
    if not draft or draft.user_id != user.id:
        raise HTTPException(status_code=404, detail="Email draft not found")

    focus_text = f"Focus on improving: {data.focus_area}" if data.focus_area else "Provide overall improvements"

    prompt = f"""You are an expert in optimizing professional emails. Please review and improve the following email draft.

Current Email:
Subject: {draft.subject}
Body: {draft.body}

{focus_text}

Please provide:
1. Specific suggestions for improvement (3-5 key points)
2. An improved version of the email

Return in JSON format:
{{
  "suggestions": ["suggestion 1", "suggestion 2"],
  "improvedSubject": "improved subject",
  "improvedBody": "improved body"
}}"""

    response = await invoke_llm(
        messages=[{"role": "user", "content": prompt}],
        model="gpt-4o-mini",
    )

    content = extract_text_content(response)
    suggestions = parse_json_from_text(content)

    if not suggestions or not isinstance(suggestions, dict):
        suggestions = {
            "suggestions": [content] if content else [],
            "improvedSubject": draft.subject,
            "improvedBody": draft.body,
        }

    return {
        "suggestions": suggestions.get("suggestions", []),
        "improvedEmail": {
            "subject": suggestions.get("improvedSubject", draft.subject),
            "body": suggestions.get("improvedBody", draft.body),
        },
    }


@router.post("/update", response_model=dict)
async def update_email(data: EmailUpdate, db: AsyncSession = Depends(get_db)):
    user = await _get_or_create_user(db)
    result = await db.execute(
        select(EmailDraft).where(EmailDraft.id == data.draft_id)
    )
    draft = result.scalar_one_or_none()
    if not draft or draft.user_id != user.id:
        raise HTTPException(status_code=404, detail="Email draft not found")

    if data.subject is not None:
        draft.subject = data.subject
    if data.body is not None:
        draft.body = data.body

    await db.commit()
    return {"success": True}
