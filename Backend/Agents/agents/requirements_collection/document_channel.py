from __future__ import annotations

import io
import json
import logging
import os
import re
from typing import Dict, List, Tuple

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

from .requirement_engine import enrich_requirement
from .runtime import (
    get_request_id,
    get_required_model_env,
    invoke_with_retry,
    require_agent_auth,
    sanitize_server_error,
)
from .schemas import DocumentUploadResponse, SecurityRequirement, SourceMetadata

logger = logging.getLogger(__name__)
router = APIRouter()

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".xls", ".md", ".txt"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/plain",
    "text/markdown",
    "application/octet-stream",
}
MAX_UPLOAD_BYTES = int(os.getenv("REQUIREMENTS_MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
MAX_DOCUMENT_CHARS = int(os.getenv("REQUIREMENTS_MAX_DOCUMENT_CHARS", "12000"))
GROUNDING_THRESHOLD = int(os.getenv("REQUIREMENTS_GROUNDING_THRESHOLD", "2"))
GENERIC_TITLES = {"requirement", "security requirement", "n/a", "tbd", "todo"}
ACTION_VERBS = {
    "shall", "must", "should", "will", "enforce", "ensure", "implement", "require",
    "prevent", "protect", "encrypt", "authenticate", "authorize", "validate", "log", "monitor",
}
STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "for", "all", "any", "must", "shall",
    "should", "will", "be", "is",
}


def _extract_pdf(data: bytes) -> str:
    try:
        import pypdf
    except ImportError as exc:
        raise HTTPException(status_code=500, detail="PDF parser not installed") from exc
    reader = pypdf.PdfReader(io.BytesIO(data))
    return "\n\n".join(page.extract_text() or "" for page in reader.pages)


def _extract_docx(data: bytes) -> str:
    try:
        import docx2txt
    except ImportError as exc:
        raise HTTPException(status_code=500, detail="DOCX parser not installed") from exc
    return docx2txt.process(io.BytesIO(data))


def _extract_xlsx(data: bytes) -> str:
    try:
        import pandas as pd
    except ImportError as exc:
        raise HTTPException(status_code=500, detail="Excel parser not installed") from exc

    workbook = pd.ExcelFile(io.BytesIO(data))
    parts = []
    for sheet in workbook.sheet_names:
        dataframe = workbook.parse(sheet).fillna("")
        parts.append(f"=== Sheet: {sheet} ===\n{dataframe.to_string(index=False)}")
    return "\n\n".join(parts)


def _extract_text(data: bytes) -> str:
    return data.decode("utf-8", errors="ignore")


def extract_text_from_file(filename: str, data: bytes) -> str:
    ext = os.path.splitext(filename.lower())[1]
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'")
    if ext == ".pdf":
        return _extract_pdf(data)
    if ext == ".docx":
        return _extract_docx(data)
    if ext in {".xlsx", ".xls"}:
        return _extract_xlsx(data)
    return _extract_text(data)


EXTRACT_PROMPT = """You are a security requirements analyst. Extract ALL security requirements from the document text below.

Return ONLY a valid JSON array with no markdown fences.
Each element must have:
  "title": short imperative title
  "description": full requirement in SHALL/MUST language
  "acceptance_criteria": list of measurable, testable criteria
  "tags": list of relevant keyword tags

Document text:
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
    desc_lower = description.lower()
    if not any(verb in desc_lower for verb in ACTION_VERBS):
        return False, "No action verb found"
    return True, "ok"


def _is_grounded(req_text: str, source_text: str, threshold: int = GROUNDING_THRESHOLD) -> bool:
    words = set(re.findall(r"\b\w{4,}\b", req_text.lower())) - STOPWORDS
    if not words:
        return True
    source_lower = source_text.lower()
    matched = sum(1 for word in words if word in source_lower)
    return matched >= threshold


def _extract_with_gemini(text: str, filename: str, request_id: str) -> Tuple[List[SecurityRequirement], bool, int]:
    try:
        from langchain_core.messages import HumanMessage
        from langchain_google_genai import ChatGoogleGenerativeAI
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="LLM dependency not installed") from exc

    model_name = get_required_model_env("GEMINI_CHAT_MODEL", dev_default="gemini-2.5-flash")
    llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.1)

    truncated_text = text[:MAX_DOCUMENT_CHARS]
    truncated = len(text) > len(truncated_text)
    prompt = EXTRACT_PROMPT.format(text=truncated_text)

    try:
        response = invoke_with_retry(llm, [HumanMessage(content=prompt)], operation="requirements-document")
        raw = response.content.strip()
    except Exception as exc:
        raise sanitize_server_error(
            "Document extraction failed",
            request_id,
            exc,
            status_code=502,
            client_message="The document extraction model is temporarily unavailable",
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
            return [], truncated, len(truncated_text)
        try:
            items = json.loads(match.group(0))
        except Exception:
            return [], truncated, len(truncated_text)

    requirements: List[SecurityRequirement] = []
    for item in items:
        if not isinstance(item, dict) or not item.get("title") or not item.get("description"):
            continue
        is_valid, reason = _validate_requirement(item)
        if not is_valid:
            logger.info("Rejected document requirement for %s: %s", filename, reason)
            continue
        grounded_text = f"{item['title']} {item['description']}"
        if not _is_grounded(grounded_text, truncated_text):
            logger.info("Rejected ungrounded document requirement for %s: %s", filename, item["title"])
            continue
        req = SecurityRequirement(
            title=item["title"],
            description=item["description"],
            acceptance_criteria=item.get("acceptance_criteria", []),
            tags=item.get("tags", []),
            raw_text=item.get("description"),
            source=SourceMetadata(type="document", reference=filename),
        )
        enrich_requirement(req)
        requirements.append(req)

    return requirements, truncated, len(truncated_text)


@router.post("/document", response_model=DocumentUploadResponse)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    auth: Dict = Depends(require_agent_auth),
):
    del auth
    request_id = get_request_id(request)
    filename = file.filename or "upload"
    ext = os.path.splitext(filename.lower())[1]
    content_type = file.content_type or "application/octet-stream"

    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file content type")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_UPLOAD_BYTES} bytes limit")

    text = extract_text_from_file(filename, data)
    requirements, truncated, processed_chars = _extract_with_gemini(text, filename, request_id)

    return DocumentUploadResponse(
        filename=filename,
        requirements_found=len(requirements),
        requirements=requirements,
        truncated=truncated,
        original_chars=len(text),
        processed_chars=processed_chars,
    )
