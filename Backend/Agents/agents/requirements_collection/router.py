from __future__ import annotations

import logging
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from .chat_channel import router as chat_router
from .confluence_channel import router as confluence_router
from .document_channel import router as doc_router
from .jira_channel import router as jira_router
from .runtime import (
    get_request_id,
    require_agent_auth,
    sanitize_server_error,
    store_encrypted_credential,
    utc_now_iso,
)
from .schemas import SaveRequest, StoredCredentialRequest, StoredCredentialResponse
from .storage import get_requirements, save_requirements, update_requirement_status

logger = logging.getLogger(__name__)
router = APIRouter()

router.include_router(chat_router)
router.include_router(doc_router)
router.include_router(jira_router)
router.include_router(confluence_router)


@router.get("/health")
def health():
    return {
        "status": "ok",
        "channels": ["chat", "document", "jira", "confluence"],
        "storage": "mongodb",
        "auth": "jwt",
    }


@router.post("/credentials/{provider}", response_model=StoredCredentialResponse)
def store_credential(
    request: Request,
    provider: str,
    body: StoredCredentialRequest,
    auth: Dict = Depends(require_agent_auth),
):
    normalized_provider = provider.strip().lower()
    if normalized_provider not in {"jira", "confluence"}:
        raise HTTPException(status_code=400, detail="Unsupported credential provider")

    try:
        credential_id = store_encrypted_credential(
            auth["user_id"],
            normalized_provider,
            {"email": body.email, "api_token": body.api_token},
        )
    except Exception as exc:
        raise sanitize_server_error(
            "Credential storage failed",
            get_request_id(request),
            exc,
            status_code=500,
            client_message="Failed to store the credential",
        )

    return StoredCredentialResponse(
        credential_id=credential_id,
        provider=normalized_provider,
        stored_at=utc_now_iso(),
    )


@router.post("/save")
def save(request: Request, body: SaveRequest, auth: Dict = Depends(require_agent_auth)):
    del auth
    try:
        result = save_requirements(
            requirements=body.requirements,
            project_id=body.project_id,
            session_id=body.session_id,
        )
        return {"success": True, **result, "request_id": get_request_id(request)}
    except Exception as exc:
        raise sanitize_server_error(
            "Saving requirements failed",
            get_request_id(request),
            exc,
            status_code=500,
            client_message="Failed to save requirements",
        )


@router.get("/")
def list_requirements(
    request: Request,
    project_id: Optional[str] = Query(None),
    session_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    source_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    auth: Dict = Depends(require_agent_auth),
):
    del auth
    try:
        result = get_requirements(
            project_id=project_id,
            session_id=session_id,
            status=status,
            category=category,
            source_type=source_type,
            page=page,
            limit=limit,
        )
        result["request_id"] = get_request_id(request)
        return result
    except Exception as exc:
        raise sanitize_server_error(
            "Fetching requirements failed",
            get_request_id(request),
            exc,
            status_code=500,
            client_message="Failed to fetch requirements",
        )


@router.patch("/{req_id}/status")
def update_status(request: Request, req_id: str, status: str, auth: Dict = Depends(require_agent_auth)):
    del auth
    valid = {"Draft", "Approved", "Rejected", "Implemented", "Pending Review"}
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {sorted(valid)}")

    try:
        updated = update_requirement_status(req_id, status)
    except Exception as exc:
        raise sanitize_server_error(
            "Updating requirement status failed",
            get_request_id(request),
            exc,
            status_code=500,
            client_message="Failed to update requirement status",
        )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Requirement {req_id} not found")
    return {"success": True, "id": req_id, "status": status, "request_id": get_request_id(request)}
