from __future__ import annotations

import json
import logging
import re
from typing import Dict, List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from .requirement_engine import enrich_requirement
from .runtime import (
    get_request_id,
    get_required_model_env,
    invoke_with_retry,
    load_chat_session,
    require_agent_auth,
    sanitize_server_error,
    save_chat_session,
)
from .schemas import ChatRequest, ChatResponse, SecurityRequirement, SourceMetadata

logger = logging.getLogger(__name__)
router = APIRouter()

SYSTEM_PROMPT = """You are an expert Security Requirements Engineer. Your job is to collect and document
security requirements through a structured conversation.

Approach:
1. Ask targeted questions about: data types handled, user types, compliance obligations,
   third-party integrations, and deployment environment.
2. After 2-3 exchanges, begin extracting concrete security requirements from the answers.
3. Each requirement should be specific, testable, and mapped to a security domain.

At the END of every response, include a JSON block (even if empty) in this exact format:
```json
{
  "requirements": [
    {
      "title": "Short imperative title (e.g. Enforce MFA for All Admin Accounts)",
      "description": "Full SHALL/MUST requirement statement with context",
      "acceptance_criteria": ["Measurable criterion 1", "Measurable criterion 2"],
      "tags": ["relevant", "keyword", "tags"]
    }
  ],
  "follow_up_questions": ["Question to ask next if more info needed"],
  "is_complete": false
}
```
Set is_complete=true after you have gathered enough context (typically 4-6 exchanges).
Always include the JSON block, using empty arrays if no requirements were extracted."""


def _get_gemini():
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="LLM dependency not installed") from exc

    model_name = get_required_model_env("GEMINI_CHAT_MODEL", dev_default="gemini-2.5-flash")
    return ChatGoogleGenerativeAI(model=model_name, temperature=0.3)


def _parse_llm_response(raw: str):
    json_match = re.search(r"```json\s*(\{.*?\})\s*```", raw, re.DOTALL)
    reply_text = raw
    requirements, follow_ups, is_complete = [], [], False

    if json_match:
        reply_text = raw[:json_match.start()].strip()
        try:
            data = json.loads(json_match.group(1))
            requirements = data.get("requirements", [])
            follow_ups = data.get("follow_up_questions", [])
            is_complete = data.get("is_complete", False)
        except json.JSONDecodeError:
            logger.warning("Failed to parse chat JSON block")

    return reply_text, requirements, follow_ups, is_complete


@router.post("/chat", response_model=ChatResponse)
def chat_collect(request: Request, body: ChatRequest, auth: Dict = Depends(require_agent_auth)):
    session_id = body.session_id or str(uuid4())
    request_id = get_request_id(request)

    session = load_chat_session(session_id, auth["user_id"]) or {
        "session_id": session_id,
        "history": [],
        "requirements": [],
    }
    llm = _get_gemini()

    from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    history = body.history or session.get("history", [])
    for msg in history:
        role = msg["role"] if isinstance(msg, dict) else msg.role
        content = msg["content"] if isinstance(msg, dict) else msg.content
        messages.append(HumanMessage(content=content) if role == "user" else AIMessage(content=content))
    messages.append(HumanMessage(content=body.message))

    try:
        response = invoke_with_retry(llm, messages, operation="requirements-chat")
        raw_reply = response.content
    except Exception as exc:
        raise sanitize_server_error(
            "Gemini chat invocation failed",
            request_id,
            exc,
            status_code=502,
            client_message="The chat model is temporarily unavailable",
        )

    reply_text, raw_reqs, follow_ups, is_complete = _parse_llm_response(raw_reply)

    extracted: List[SecurityRequirement] = []
    for raw_req in raw_reqs:
        if not raw_req.get("title") or not raw_req.get("description"):
            continue
        req = SecurityRequirement(
            title=raw_req["title"],
            description=raw_req["description"],
            acceptance_criteria=raw_req.get("acceptance_criteria", []),
            tags=raw_req.get("tags", []),
            source=SourceMetadata(type="chat", reference=session_id),
        )
        enrich_requirement(req)
        extracted.append(req)
        session["requirements"].append(req.model_dump())

    session["history"] = history + [
        {"role": "user", "content": body.message},
        {"role": "assistant", "content": raw_reply},
    ]
    save_chat_session(session_id, auth["user_id"], session["history"], session["requirements"])

    return ChatResponse(
        session_id=session_id,
        reply=reply_text,
        extracted_requirements=extracted,
        follow_up_questions=follow_ups,
        is_complete=is_complete,
    )


@router.get("/chat/{session_id}/requirements")
def get_session_requirements(
    request: Request,
    session_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    auth: Dict = Depends(require_agent_auth),
):
    session = load_chat_session(session_id, auth["user_id"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    requirements = session.get("requirements", [])
    total = len(requirements)
    start = (page - 1) * limit
    end = start + limit

    return {
        "session_id": session_id,
        "count": total,
        "requirements": requirements[start:end],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
        "request_id": get_request_id(request),
    }
