# agents/requirements_collection/storage.py
"""
MongoDB persistence for security requirements.
Collection: SecurityRequirements  (matches project naming convention)
"""
from __future__ import annotations
from typing import List, Optional, Dict, Any

from .schemas import SecurityRequirement
from .requirement_engine import build_summary
from .runtime import get_collection, utc_now_iso


def save_requirements(
    requirements: List[SecurityRequirement],
    project_id:   Optional[str] = None,
    session_id:   Optional[str] = None,
) -> Dict[str, Any]:
    col  = get_collection("SecurityRequirements")
    docs = []
    for req in requirements:
        doc = req.model_dump()
        doc["project_id"]  = project_id
        doc["session_id"]  = session_id
        doc["saved_at"]    = utc_now_iso()
        docs.append(doc)

    if not docs:
        return {"saved": 0, "ids": []}

    # upsert by requirement id to avoid duplicates
    saved_ids = []
    for doc in docs:
        col.update_one(
            {"id": doc["id"]},
            {"$set": doc},
            upsert=True,
        )
        saved_ids.append(doc["id"])

    return {
        "saved":      len(saved_ids),
        "ids":        saved_ids,
        "project_id": project_id,
        "session_id": session_id,
    }


def get_requirements(
    project_id: Optional[str] = None,
    session_id: Optional[str] = None,
    status:     Optional[str] = None,
    category:   Optional[str] = None,
    source_type:Optional[str] = None,
    page:       int = 1,
    limit:      int = 50,
) -> Dict[str, Any]:
    col   = get_collection("SecurityRequirements")
    query: dict = {}

    if project_id:  query["project_id"]  = project_id
    if session_id:  query["session_id"]  = session_id
    if status:      query["status"]      = status
    if category:    query["category"]    = category
    if source_type: query["source.type"] = source_type

    total = col.count_documents(query)
    skip  = (page - 1) * limit
    docs  = list(col.find(query, {"_id": 0}).skip(skip).limit(limit).sort("saved_at", -1))

    return {
        "requirements": docs,
        "pagination": {
            "page":  page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
        "summary": build_summary(docs),
    }


def update_requirement_status(req_id: str, status: str) -> bool:
    col    = get_collection("SecurityRequirements")
    result = col.update_one({"id": req_id}, {"$set": {"status": status}})
    return result.modified_count > 0
