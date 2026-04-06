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
from .schemas import JiraConfig, JiraImportResponse, SecurityRequirement, SourceMetadata

logger = logging.getLogger(__name__)
router = APIRouter()

JIRA_EXTRACTION_PROMPT = """You are a security requirements analyst. Extract security requirements from this JIRA issue.

Return ONLY a valid JSON array with no markdown fences.
Each element must include:
  "title": short imperative title
  "description": full SHALL/MUST requirement
  "acceptance_criteria": list of measurable criteria
  "tags": list of tags

Issue key: {issue_key}
Issue summary: {summary}
Issue description:
{description}"""


def _extract_requirements(issue_key: str, summary: str, description: str, issue_url: str, request_id: str) -> List[SecurityRequirement]:
    try:
        from langchain_core.messages import HumanMessage
        from langchain_google_genai import ChatGoogleGenerativeAI
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="LLM dependency not installed") from exc

    llm = ChatGoogleGenerativeAI(
        model=get_required_model_env("GEMINI_CHAT_MODEL", dev_default="gemini-2.5-flash"),
        temperature=0.1,
    )
    prompt = JIRA_EXTRACTION_PROMPT.format(issue_key=issue_key, summary=summary, description=description[:10000])

    try:
        response = invoke_with_retry(llm, [HumanMessage(content=prompt)], operation="requirements-jira")
        raw = response.content.strip()
    except Exception as exc:
        raise sanitize_server_error(
            "Jira extraction failed",
            request_id,
            exc,
            status_code=502,
            client_message="The Jira extraction model is temporarily unavailable",
        )

    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw.rstrip())

    try:
        items = json.loads(raw)
        if not isinstance(items, list):
            items = [items] if isinstance(items, dict) else []
    except json.JSONDecodeError:
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        if not match:
            return []
        try:
            items = json.loads(match.group(0))
        except Exception:
            return []

    requirements: List[SecurityRequirement] = []
    for item in items:
        if not isinstance(item, dict) or not item.get("title") or not item.get("description"):
            continue
        req = SecurityRequirement(
            title=item["title"],
            description=item["description"],
            acceptance_criteria=item.get("acceptance_criteria", []),
            tags=item.get("tags", []),
            source=SourceMetadata(type="jira", reference=issue_key, url=issue_url),
        )
        enrich_requirement(req)
        requirements.append(req)
    return requirements


@router.post("/jira", response_model=JiraImportResponse)
def import_from_jira(request: Request, config: JiraConfig, auth: Dict = Depends(require_agent_auth)):
    request_id = get_request_id(request)

    try:
        import httpx
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="httpx not installed") from exc

    try:
        secrets = load_encrypted_credential(auth["user_id"], "jira", config.credential_id)
    except Exception as exc:
        raise sanitize_server_error(
            "Jira credential load failed",
            request_id,
            exc,
            status_code=400 if isinstance(exc, HTTPException) else 500,
            client_message="Unable to use the stored Jira credential",
        )

    base = config.base_url.rstrip("/")
    params = {
        "jql": config.jql_filter or f'project = "{config.project_key}" ORDER BY updated DESC',
        "maxResults": config.max_results,
        "fields": "summary,description,issuetype,labels",
    }

    try:
        resp = httpx.get(
            f"{base}/rest/api/3/search",
            params=params,
            auth=(secrets.get("email", ""), secrets.get("api_token", "")),
            headers={"Accept": "application/json"},
            timeout=30,
        )
        resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.warning("Jira API error request_id=%s status=%s", request_id, exc.response.status_code)
        raise HTTPException(status_code=exc.response.status_code, detail=f"Jira API request failed. request_id={request_id}")
    except Exception as exc:
        raise sanitize_server_error(
            "Jira API request failed",
            request_id,
            exc,
            status_code=502,
            client_message="Failed to connect to Jira",
        )

    payload = resp.json()
    issues = payload.get("issues", [])
    total = payload.get("total", len(issues))
    skipped: List[str] = []
    requirements: List[SecurityRequirement] = []

    for issue in issues:
        fields = issue.get("fields", {})
        issue_key = issue.get("key", "UNKNOWN")
        summary = fields.get("summary") or ""
        description = json.dumps(fields.get("description") or {})
        if not (summary or description):
            skipped.append(issue_key)
            continue
        requirements.extend(
            _extract_requirements(
                issue_key=issue_key,
                summary=summary,
                description=description,
                issue_url=f"{base}/browse/{issue_key}",
                request_id=request_id,
            )
        )

    return JiraImportResponse(
        tickets_processed=len(issues),
        requirements=requirements,
        skipped=skipped,
        truncated=total > len(issues),
        requested_results=config.max_results,
        returned_results=len(issues),
    )
