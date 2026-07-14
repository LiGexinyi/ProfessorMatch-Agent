import json
import logging
import re

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Professor
from app.schemas import MatchScoreInput, ProfessorCreate, ScraperInput
from app.services.llm import extract_text_content, invoke_llm, parse_json_from_text

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/scraper", tags=["scraper"])


@router.post("/fetch", response_model=dict)
async def fetch_professors(data: ScraperInput, db: AsyncSession = Depends(get_db)):
    prompt = f"""Please search and list relevant professor information based on the following:

University: {data.university}
Department: {data.department}
Research Area: {data.research_area}

Return a JSON array containing at least 5 professors. Each professor should include:
- name: Professor name
- university: University name
- department: Department name
- researchAreas: Research areas (comma separated)
- recentPublications: Recent paper titles and abstracts (semicolon separated)
- homepageUrl: Personal homepage URL (if available)
- googleScholarUrl: Google Scholar URL (if available)
- labWebsiteUrl: Lab website URL (if available)

Return format:
[
  {{
    "name": "Professor Name",
    "university": "University Name",
    "department": "Department Name",
    "researchAreas": "Area1, Area2",
    "recentPublications": "Paper1 abstract; Paper2 abstract",
    "homepageUrl": "URL",
    "googleScholarUrl": "URL",
    "labWebsiteUrl": "URL"
  }}
]

Return ONLY the JSON array, no other text."""

    try:
        response = await invoke_llm(
            messages=[{"role": "user", "content": prompt}],
        )

        content = extract_text_content(response)
        if not content:
            raise ValueError("Invalid response from LLM")

        json_match = re.search(r"\[[\s\S]*\]", content)
        if not json_match:
            raise ValueError("Failed to parse professor data from LLM response")

        professors_data = json.loads(json_match.group(0))

        created_professors = []
        for prof in professors_data:
            professor = Professor(
                name=prof.get("name", ""),
                university=prof.get("university", ""),
                department=prof.get("department", ""),
                research_areas=prof.get("researchAreas", ""),
                recent_publications=prof.get("recentPublications", ""),
                homepage_url=prof.get("homepageUrl", ""),
                google_scholar_url=prof.get("googleScholarUrl", ""),
                lab_website_url=prof.get("labWebsiteUrl", ""),
            )
            db.add(professor)
            await db.flush()
            created_professors.append({"id": professor.id, **prof})

        await db.commit()

        return {
            "success": True,
            "count": len(created_professors),
            "professors": created_professors,
        }
    except Exception as e:
        logger.error(f"Error fetching professors: {e}")
        raise


@router.post("/match-score", response_model=dict)
async def generate_match_score(data: MatchScoreInput):
    prompt = f"""Please calculate the match score (0-100) between the user and professor based on the following:

User Background:
{data.user_background}

Professor Research:
{data.professor_research}

Evaluate the following aspects:
1. Research direction alignment
2. Academic background relevance
3. Research interest consistency

Return a JSON object containing:
- score: Overall match score (0-100)
- reasoning: Brief explanation
- strengths: Matching strengths (array)
- gaps: Areas for improvement (array)

Return format:
{{
  "score": 85,
  "reasoning": "User's research background highly aligns with professor's research direction...",
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"]
}}

Return ONLY the JSON object, no other text."""

    try:
        response = await invoke_llm(
            messages=[{"role": "user", "content": prompt}],
        )

        content = extract_text_content(response)
        if not content:
            raise ValueError("Invalid response from LLM")

        match_data = parse_json_from_text(content)
        if not match_data:
            raise ValueError("Failed to parse match score from LLM response")

        return match_data
    except Exception as e:
        logger.error(f"Error generating match score: {e}")
        raise
