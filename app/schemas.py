from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserProfileUpdate(BaseModel):
    research_direction: Optional[str] = None
    target_schools: Optional[str] = None
    degree_background: Optional[str] = None
    gpa: Optional[str] = None
    language_scores: Optional[str] = None


class ProfessorCreate(BaseModel):
    name: str
    university: Optional[str] = None
    department: Optional[str] = None
    research_areas: Optional[str] = None
    recent_publications: Optional[str] = None
    homepage_url: Optional[str] = None
    google_scholar_url: Optional[str] = None
    lab_website_url: Optional[str] = None


class ProfessorOut(BaseModel):
    id: int
    name: str
    university: Optional[str] = None
    department: Optional[str] = None
    research_areas: Optional[str] = None
    recent_publications: Optional[str] = None
    homepage_url: Optional[str] = None
    google_scholar_url: Optional[str] = None
    lab_website_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FavoriteToggle(BaseModel):
    professor_id: int
    is_favorited: bool


class ContactStatusUpdate(BaseModel):
    professor_id: int
    contact_status: str


class EmailGenerate(BaseModel):
    professor_id: int


class EmailOptimize(BaseModel):
    draft_id: int
    focus_area: Optional[str] = None


class EmailUpdate(BaseModel):
    draft_id: int
    subject: Optional[str] = None
    body: Optional[str] = None


class ScraperInput(BaseModel):
    university: str
    department: str
    research_area: str


class MatchScoreInput(BaseModel):
    user_background: str
    professor_research: str


class URLExtractInput(BaseModel):
    url: str


class InteractionOut(BaseModel):
    id: int
    user_id: int
    professor_id: int
    is_favorited: int
    contact_status: str
    match_score: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EmailDraftOut(BaseModel):
    id: int
    user_id: int
    professor_id: int
    subject: Optional[str] = None
    body: Optional[str] = None
    ai_suggestions: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfileOut(BaseModel):
    id: int
    user_id: int
    research_direction: Optional[str] = None
    target_schools: Optional[str] = None
    degree_background: Optional[str] = None
    gpa: Optional[str] = None
    language_scores: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
