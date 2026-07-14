import asyncio
import json
import logging
import math
import random
from typing import Any, Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

RETRY_MAX_RETRIES = 4
RETRY_BASE_DELAY_MS = 500
RETRY_MAX_DELAY_MS = 30_000


def _compute_backoff_delay(attempt: int, retry_after_ms: Optional[float] = None) -> float:
    cap = min(RETRY_BASE_DELAY_MS * (2 ** attempt), RETRY_MAX_DELAY_MS)
    jittered = cap / 2 + random.random() * (cap / 2)
    return min(max(jittered, retry_after_ms or 0), RETRY_MAX_DELAY_MS) / 1000


async def invoke_llm(
    messages: list[dict[str, Any]],
    model: Optional[str] = None,
    max_tokens: Optional[int] = None,
    temperature: Optional[float] = None,
    response_format: Optional[dict] = None,
) -> dict[str, Any]:
    if not settings.llm_api_key:
        raise ValueError("LLM_API_KEY is not configured")

    payload: dict[str, Any] = {"messages": messages}
    if model:
        payload["model"] = model
    else:
        payload["model"] = settings.llm_model
    if max_tokens:
        payload["max_tokens"] = max_tokens
    if temperature is not None:
        payload["temperature"] = temperature
    if response_format:
        payload["response_format"] = response_format

    last_error = None
    async with httpx.AsyncClient(timeout=60.0) as client:
        for attempt in range(RETRY_MAX_RETRIES + 1):
            try:
                response = await client.post(
                    settings.llm_api_url,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {settings.llm_api_key}",
                    },
                    json=payload,
                )

                if response.status_code == 200:
                    return response.json()

                if attempt < RETRY_MAX_RETRIES:
                    retry_after = response.headers.get("retry-after")
                    retry_after_ms = None
                    if retry_after:
                        try:
                            retry_after_ms = float(retry_after) * 1000
                        except ValueError:
                            pass
                    delay = _compute_backoff_delay(attempt, retry_after_ms)
                    logger.warning(
                        f"LLM request retry {attempt + 1}/{RETRY_MAX_RETRIES} "
                        f"after status {response.status_code}, delay={delay:.1f}s"
                    )
                    await asyncio.sleep(delay)
                    continue

                error_text = response.text
                raise RuntimeError(
                    f"LLM invoke failed: {response.status_code} {response.text} - {error_text}"
                )

            except httpx.NetworkError as e:
                last_error = e
                if attempt < RETRY_MAX_RETRIES:
                    delay = _compute_backoff_delay(attempt)
                    logger.warning(
                        f"LLM request retry {attempt + 1}/{RETRY_MAX_RETRIES} "
                        f"after network error, delay={delay:.1f}s"
                    )
                    await asyncio.sleep(delay)
                    continue
                raise

    raise RuntimeError(
        f"LLM request failed after exhausting retries: {last_error}"
    )


def extract_text_content(response: dict) -> str:
    choices = response.get("choices", [])
    if not choices:
        return ""
    content = choices[0].get("message", {}).get("content", "")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(
            part.get("text", json.dumps(part)) if isinstance(part, dict) else str(part)
            for part in content
        )
    return str(content)


def parse_json_from_text(text: str) -> Any:
    json_match = re.search(r"\{[\s\S]*\}", text)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    json_match = re.search(r"\[[\s\S]*\]", text)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    return None


import re
