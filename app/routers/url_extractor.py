import json
import logging
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Professor
from app.schemas import URLExtractInput
from app.services.llm import extract_text_content, invoke_llm, parse_json_from_text

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/url-extractor", tags=["url-extractor"])


EXTRACT_PROMPT_TEMPLATE = """Please visit the following professor homepage URL and extract relevant information:

URL: {url}

Extract the following information:
1. Professor name
2. University and department
3. Research areas (list all main research fields)
4. Recent publications (list the latest 5-10 papers with titles and brief descriptions)
5. Personal homepage URL
6. Google Scholar link (if available)
7. Lab website link (if available)

Return a JSON object with these fields:
{{
  "name": "Professor Name",
  "university": "University Name",
  "department": "Department Name",
  "researchAreas": "Area1, Area2, ...",
  "recentPublications": "Paper1 abstract; Paper2 abstract; ...",
  "homepageUrl": "Homepage URL",
  "googleScholarUrl": "Google Scholar URL",
  "labWebsiteUrl": "Lab website URL",
  "extractionNotes": "Any notes or difficulties during extraction"
}}

Return ONLY the JSON object, no other text. If the URL cannot be accessed or information is incomplete, note this in extractionNotes."""


@router.post("/extract", response_model=dict)
async def extract_professor_info(data: URLExtractInput):
    prompt = EXTRACT_PROMPT_TEMPLATE.format(url=data.url)

    try:
        response = await invoke_llm(
            messages=[{"role": "user", "content": prompt}],
        )

        content = extract_text_content(response)
        if not content:
            raise ValueError("Invalid response from LLM")

        professor_data = parse_json_from_text(content)
        if not professor_data or not isinstance(professor_data, dict):
            raise ValueError("Failed to parse professor data from URL")

        return {
            "success": True,
            "data": professor_data,
            "message": "Successfully extracted professor info from URL",
        }
    except Exception as e:
        logger.error(f"Error extracting professor info from URL: {e}")
        raise


@router.post("/extract-and-create", response_model=dict)
async def extract_and_create_professor(
    data: URLExtractInput, db: AsyncSession = Depends(get_db)
):
    prompt = EXTRACT_PROMPT_TEMPLATE.format(url=data.url)

    try:
        response = await invoke_llm(
            messages=[{"role": "user", "content": prompt}],
        )

        content = extract_text_content(response)
        if not content:
            raise ValueError("Invalid response from LLM")

        professor_data = parse_json_from_text(content)
        if not professor_data or not isinstance(professor_data, dict):
            raise ValueError("Failed to parse professor data from URL")

        professor = Professor(
            name=professor_data.get("name", ""),
            university=professor_data.get("university", ""),
            department=professor_data.get("department", ""),
            research_areas=professor_data.get("researchAreas", ""),
            recent_publications=professor_data.get("recentPublications", ""),
            homepage_url=professor_data.get("homepageUrl", data.url),
            google_scholar_url=professor_data.get("googleScholarUrl", ""),
            lab_website_url=professor_data.get("labWebsiteUrl", ""),
        )
        db.add(professor)
        await db.commit()
        await db.refresh(professor)

        return {
            "success": True,
            "professorId": professor.id,
            "data": professor_data,
            "message": "Successfully extracted and created professor from URL",
        }
    except Exception as e:
        logger.error(f"Error extracting and creating professor: {e}")
        raise
