from __future__ import annotations

import logging
import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, Optional
from uuid import uuid4

import jwt
from cryptography.fernet import Fernet, InvalidToken
from fastapi import Header, HTTPException, Request

logger = logging.getLogger(__name__)

_mongo_client = None
_db = None
_indexes_ready = False
_demo_sessions: Dict[str, dict] = {}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def is_production() -> bool:
    return os.getenv("NODE_ENV", "").lower() == "production" or os.getenv("ENVIRONMENT", "").lower() == "production"


def is_requirements_demo_mode() -> bool:
    return os.getenv("REQUIREMENTS_DEMO_MODE", "").strip().lower() in {"1", "true", "yes", "on"}


def get_request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "unknown-request")


def get_agent_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret and is_production():
        raise RuntimeError("JWT_SECRET must be set in production")
    return secret or "your-secret-key-change-in-production"


def require_agent_auth(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if is_requirements_demo_mode() and not authorization:
        return {
            "user_id": "demo-user",
            "token_payload": {"demo": True},
        }

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = jwt.decode(token, get_agent_jwt_secret(), algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("userId") or payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    return {"user_id": str(user_id), "token_payload": payload}


def _get_db_name() -> str:
    db_name = os.getenv("MONGODB_DB")
    if db_name:
        return db_name
    if is_production():
        raise RuntimeError("MONGODB_DB environment variable must be set in production")
    return "AI-Governance"


def get_mongo_database():
    global _mongo_client, _db, _indexes_ready
    if _db is not None:
        return _db

    try:
        from pymongo import MongoClient
    except ImportError as exc:
        raise RuntimeError("pymongo not installed") from exc

    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise RuntimeError("MONGODB_URI environment variable not set")

    _mongo_client = MongoClient(uri)
    _db = _mongo_client[_get_db_name()]

    if not _indexes_ready:
        _db["SecurityRequirements"].create_index("id", unique=True, sparse=True)
        _db["SecurityRequirements"].create_index("project_id")
        _db["SecurityRequirements"].create_index("session_id")
        _db["SecurityRequirements"].create_index("status")
        _db["SecurityRequirements"].create_index("category")
        _db["SecurityRequirements"].create_index("source.type")

        _db["RequirementsChatSessions"].create_index("session_id", unique=True)
        _db["RequirementsChatSessions"].create_index("user_id")
        _db["RequirementsCredentials"].create_index([("user_id", 1), ("provider", 1), ("credential_id", 1)], unique=True)
        _db["RequirementsCredentials"].create_index("updated_at")
        _indexes_ready = True

    return _db


def get_collection(name: str):
    return get_mongo_database()[name]


def _get_fernet() -> Fernet:
    key = os.getenv("REQUIREMENTS_SECRET_KEY")
    if not key:
        raise RuntimeError("REQUIREMENTS_SECRET_KEY environment variable not set")
    try:
        return Fernet(key.encode("utf-8"))
    except Exception as exc:
        raise RuntimeError("REQUIREMENTS_SECRET_KEY is invalid") from exc


def store_encrypted_credential(user_id: str, provider: str, fields: Dict[str, str]) -> str:
    if not fields:
        raise ValueError("Credential fields are required")

    fernet = _get_fernet()
    collection = get_collection("RequirementsCredentials")
    credential_id = f"{provider}-{uuid4().hex[:16]}"
    encrypted_fields = {
        key: fernet.encrypt(value.encode("utf-8")).decode("utf-8")
        for key, value in fields.items()
        if value
    }
    collection.update_one(
        {"user_id": user_id, "provider": provider, "credential_id": credential_id},
        {
            "$set": {
                "user_id": user_id,
                "provider": provider,
                "credential_id": credential_id,
                "fields": encrypted_fields,
                "updated_at": utc_now_iso(),
            }
        },
        upsert=True,
    )
    return credential_id


def load_encrypted_credential(user_id: str, provider: str, credential_id: str) -> Dict[str, str]:
    fernet = _get_fernet()
    doc = get_collection("RequirementsCredentials").find_one(
        {"user_id": user_id, "provider": provider, "credential_id": credential_id},
        {"_id": 0},
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Credential reference not found")

    try:
        return {
            key: fernet.decrypt(value.encode("utf-8")).decode("utf-8")
            for key, value in (doc.get("fields") or {}).items()
        }
    except InvalidToken as exc:
        raise RuntimeError("Stored credential could not be decrypted") from exc


def save_chat_session(session_id: str, user_id: str, history: list, requirements: list) -> None:
    if not os.getenv("MONGODB_URI"):
        _demo_sessions[(user_id, session_id)] = {
            "session_id": session_id,
            "user_id": user_id,
            "history": history,
            "requirements": requirements,
            "updated_at": utc_now_iso(),
        }
        return

    get_collection("RequirementsChatSessions").update_one(
        {"session_id": session_id},
        {
            "$set": {
                "session_id": session_id,
                "user_id": user_id,
                "history": history,
                "requirements": requirements,
                "updated_at": utc_now_iso(),
            }
        },
        upsert=True,
    )


def load_chat_session(session_id: str, user_id: str) -> Optional[dict]:
    if not os.getenv("MONGODB_URI"):
        return _demo_sessions.get((user_id, session_id))

    return get_collection("RequirementsChatSessions").find_one(
        {"session_id": session_id, "user_id": user_id},
        {"_id": 0},
    )


def get_required_model_env(name: str, dev_default: Optional[str] = None) -> str:
    value = os.getenv(name)
    if value:
        return value
    if is_production() or dev_default is None:
        raise RuntimeError(f"{name} environment variable not set")
    return dev_default


def _is_retryable_exception(exc: Exception) -> bool:
    text = str(exc).lower()
    return any(signal in text for signal in ("429", "503", "rate limit", "temporarily unavailable", "resource exhausted"))


def invoke_with_retry(llm: Any, messages: Iterable[Any], *, operation: str, retries: int = 3, base_delay: float = 1.0):
    attempt = 0
    while True:
        attempt += 1
        try:
            return llm.invoke(list(messages))
        except Exception as exc:
            if attempt >= retries or not _is_retryable_exception(exc):
                raise
            sleep_for = base_delay * (2 ** (attempt - 1))
            logger.warning("%s failed on attempt %s, retrying in %.1fs: %s", operation, attempt, sleep_for, exc)
            time.sleep(sleep_for)


def sanitize_server_error(logger_message: str, request_id: str, exc: Exception, status_code: int = 500, client_message: str = "Request failed") -> HTTPException:
    logger.exception("%s request_id=%s error=%s", logger_message, request_id, exc)
    return HTTPException(status_code=status_code, detail=f"{client_message}. request_id={request_id}")
