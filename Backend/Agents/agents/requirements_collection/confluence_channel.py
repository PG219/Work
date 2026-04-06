from __future__ import annotations

import json
import logging
import re
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, Request

from .requirement_engine import enrich_requirement
from .runtime import (
    get_request_id,
    get_required_model_env,
    invoke_with_retry,
    load_encrypted_credential,
    require_agent_auth,
    sanitize_server_error,
)
from .schemas import ConfluenceConfig, ConfluenceImportResponse, SecurityRequirement, SourceMetadata

logger = logging.getLogger(__name__)
router = APIRouter()
GENERIC_TITLES = {"requirement", "security requirement", "n/a", "tbd", "todo"}
ACTION_VERBS = {
    "shall", "must", "should", "will", "enforce", "ensure", "implement", "require",
    "prevent", "protect", "encrypt", "authenticate", "authorize", "validate", "log", "monitor",
}
STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "for", "all", "any", "must", "shall",
    "should", "will", "be", "is",
}
GROUNDING_THRESHOLD = 2

EXTRACT_PROMPT = """You are a security requirements analyst. Extract security requirements from this Confluence page.

Return ONLY a valid JSON array with no markdown fences.
Each element:
  "title": short imperative title
  "description": full requirement in SHALL/MUST language
  "acceptance_criteria": list of measurable criteria
  "tags": relevant keyword tags

Page: {title}
Content:
{text}"""


def _validate_requirement(item: dict) -> tuple[bool, str]:
    title = str(item.get("title") or "").strip()
    description = str(item.get("description") or "").strip()

    if len(title) < 10:
        return False, "Title too short"
    if len(description) < 30:
        return False, "Description too short"
    if title.lower() in GENERIC_TITLES:
        return False, "Generic title rejected"
    if not any(verb in description.lower() for verb in ACTION_VERBS):
        return False, "No action verb found"
    return True, "ok"


def _is_grounded(req_text: str, source_text: str, threshold: int = GROUNDING_THRESHOLD) -> bool:
    words = set(re.findall(r"\b\w{4,}\b", req_text.lower())) - STOPWORDS
    if not words:
        return True
    source_lower = source_text.lower()
    matched = sum(1 for word in words if word in source_lower)
    return matched >= threshold


def _html_to_text(html: str) -> str:
    text = re.sub(r"<style[^>]*>.*?</style>", " ", html, flags=re.DOTALL)
    text = re.sub(r"<script[^>]*>.*?</script>", " ", text, flags=re.DOTALL)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&lt;", "<", text)
    text = re.sub(r"&gt;", ">", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _extract_reqs_from_page(text: str, title: str, page_url: str, request_id: str) -> List[SecurityRequirement]:
    try:
        from langchain_core.messages import HumanMessage
        from langchain_google_genai import ChatGoogleGenerativeAI
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="LLM dependency not installed") from exc

    llm = ChatGoogleGenerativeAI(
        model=get_required_model_env("GEMINI_CHAT_MODEL", dev_default="gemini-2.5-flash"),
        temperature=0.1,
    )

    prompt = EXTRACT_PROMPT.format(title=title, text=text[:10000])
    try:
        response = invoke_with_retry(llm, [HumanMessage(content=prompt)], operation="requirements-confluence")
        raw = response.content.strip()
    except Exception as exc:
        raise sanitize_server_error(
            "Confluence extraction failed",
            request_id,
            exc,
            status_code=502,
            client_message="The Confluence extraction model is temporarily unavailable",
        )

    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw.rstrip())

    try:
        items = json.loads(raw)
        if not isinstance(items, list):
            items = []
    except json.JSONDecodeError:
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        try:
            items = json.loads(match.group(0)) if match else []
        except Exception:
            items = []

    requirements: List[SecurityRequirement] = []
    for item in items:
        if not isinstance(item, dict) or not item.get("title") or not item.get("description"):
            continue
        is_valid, reason = _validate_requirement(item)
        if not is_valid:
            logger.info("Rejected confluence requirement for %s: %s", title, reason)
            continue
        grounded_text = f"{item['title']} {item['description']}"
        if not _is_grounded(grounded_text, text):
            logger.info("Rejected ungrounded confluence requirement for %s: %s", title, item["title"])
            continue
        req = SecurityRequirement(
            title=item["title"],
            description=item["description"],
            acceptance_criteria=item.get("acceptance_criteria", []),
            tags=item.get("tags", []),
            source=SourceMetadata(type="confluence", reference=title, url=page_url),
        )
        enrich_requirement(req)
        requirements.append(req)

    return requirements


@router.post("/confluence", response_model=ConfluenceImportResponse)
def import_from_confluence(request: Request, config: ConfluenceConfig, auth: Dict = Depends(require_agent_auth)):
    request_id = get_request_id(request)

    try:
        import httpx
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="httpx not installed") from exc

    try:
        secrets = load_encrypted_credential(auth["user_id"], "confluence", config.credential_id)
    except Exception as exc:
        raise sanitize_server_error(
            "Confluence credential load failed",
            request_id,
            exc,
            status_code=400 if isinstance(exc, HTTPException) else 500,
            client_message="Unable to use the stored Confluence credential",
        )

    auth_tuple = (secrets.get("email", ""), secrets.get("api_token", ""))
    base = config.base_url.rstrip("/")
    params: dict = {
        "spaceKey": config.space_key,
        "expand": "body.storage,title,_links",
        "limit": config.limit,
    }
    if config.page_title:
        params["title"] = config.page_title

    try:
        resp = httpx.get(
            f"{base}/wiki/rest/api/content",
            params=params,
            auth=auth_tuple,
            headers={"Accept": "application/json"},
            timeout=30,
        )
        resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.warning("Confluence API error request_id=%s status=%s", request_id, exc.response.status_code)
        raise HTTPException(status_code=exc.response.status_code, detail=f"Confluence API request failed. request_id={request_id}")
    except Exception as exc:
        raise sanitize_server_error(
            "Confluence API request failed",
            request_id,
            exc,
            status_code=502,
            client_message="Failed to connect to Confluence",
        )

    payload = resp.json()
    pages = payload.get("results", [])
    truncated = len(pages) >= config.limit and bool(payload.get("_links", {}).get("next"))
    all_requirements: List[SecurityRequirement] = []

    for page in pages:
        html = page.get("body", {}).get("storage", {}).get("value", "")
        text = _html_to_text(html)
        if not text:
            continue
        title = page.get("title", "Untitled")
        page_id = page.get("id", "")
        page_url = f"{base}/wiki/spaces/{config.space_key}/pages/{page_id}"
        all_requirements.extend(_extract_reqs_from_page(text, title, page_url, request_id))

    return ConfluenceImportResponse(
        pages_processed=len(pages),
        requirements=all_requirements,
        truncated=truncated,
        requested_limit=config.limit,
        returned_pages=len(pages),
    )
