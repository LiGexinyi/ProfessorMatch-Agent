from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=True)
    email = Column(String(320), nullable=True)
    role = Column(String(10), default="user", nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)
    last_signed_in = Column(DateTime, default=utcnow, nullable=False)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    interactions = relationship("UserProfessorInteraction", back_populates="user")
    email_drafts = relationship("EmailDraft", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    research_direction = Column(Text, nullable=True)
    target_schools = Column(Text, nullable=True)
    degree_background = Column(String(255), nullable=True)
    gpa = Column(String(10), nullable=True)
    language_scores = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="profile")


class Professor(Base):
    __tablename__ = "professors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    university = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    research_areas = Column(Text, nullable=True)
    recent_publications = Column(Text, nullable=True)
    homepage_url = Column(Text, nullable=True)
    google_scholar_url = Column(Text, nullable=True)
    lab_website_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    interactions = relationship("UserProfessorInteraction", back_populates="professor")
    email_drafts = relationship("EmailDraft", back_populates="professor")


class EmailDraft(Base):
    __tablename__ = "email_drafts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    professor_id = Column(Integer, ForeignKey("professors.id", ondelete="CASCADE"), nullable=False)
    subject = Column(Text, nullable=True)
    body = Column(Text, nullable=True)
    ai_suggestions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="email_drafts")
    professor = relationship("Professor", back_populates="email_drafts")


class UserProfessorInteraction(Base):
    __tablename__ = "user_professor_interactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    professor_id = Column(Integer, ForeignKey("professors.id", ondelete="CASCADE"), nullable=False)
    is_favorited = Column(Integer, default=0, nullable=False)
    contact_status = Column(String(20), default="pending", nullable=False)
    match_score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="interactions")
    professor = relationship("Professor", back_populates="interactions")
