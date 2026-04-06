# agents/requirements_collection/schemas.py
from __future__ import annotations
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

RequirementCategory = Literal[
    "Authentication", "Access Control", "Encryption", "Data Protection",
    "Logging", "API Security", "Session Management", "Configuration",
    "Business Logic", "Compliance", "Third-party Integration", "Other"
]
Priority     = Literal["Critical", "High", "Medium", "Low"]
Status       = Literal["Draft", "Approved", "Rejected", "Implemented", "Pending Review"]
FrameworkRef = Literal["OWASP ASVS 4.0", "NIST CSF 2.0", "ISO 27001:2022", "PCI DSS 4.0"]

class ComplianceMapping(BaseModel):
    framework:   FrameworkRef
    version:     str
    control:     str
    description: Optional[str] = None

class SourceMetadata(BaseModel):
    type:      Literal["chat", "document", "jira", "confluence"]
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    reference: Optional[str] = None
    url:       Optional[str] = None

class SecurityRequirement(BaseModel):
    id:                  str = Field(default_factory=lambda: f"REQ-{uuid.uuid4().hex[:8].upper()}")
    title:               str
    description:         str
    category:            RequirementCategory = "Other"
    priority:            Priority = "Medium"
    status:              Status   = "Draft"
    compliance_mappings: List[ComplianceMapping] = []
    linked_assets:       List[str] = []
    source:              SourceMetadata
    verification_method: Optional[str] = None
    acceptance_criteria: List[str] = []
    tags:                List[str] = []
    raw_text:            Optional[str] = None

class ChatMessage(BaseModel):
    role:    Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message:    str
    history:    List[ChatMessage] = []

class ChatResponse(BaseModel):
    session_id:             str
    reply:                  str
    extracted_requirements: List[SecurityRequirement] = []
    follow_up_questions:    List[str] = []
    is_complete:            bool = False

class DocumentUploadResponse(BaseModel):
    filename:           str
    requirements_found: int
    requirements:       List[SecurityRequirement]
    truncated:          bool = False
    original_chars:     int = 0
    processed_chars:    int = 0

class JiraConfig(BaseModel):
    base_url:    str
    project_key: str
    jql_filter:  Optional[str] = None
    credential_id: str
    max_results: int = Field(default=100, ge=1, le=500)

class JiraImportResponse(BaseModel):
    tickets_processed: int
    requirements:      List[SecurityRequirement]
    skipped:           List[str] = []
    truncated:         bool = False
    requested_results: int
    returned_results:  int

class ConfluenceConfig(BaseModel):
    base_url:   str
    space_key:  str
    page_title: Optional[str] = None
    credential_id: str
    limit:      int = Field(default=50, ge=1, le=200)

class ConfluenceImportResponse(BaseModel):
    pages_processed: int
    requirements:    List[SecurityRequirement]
    truncated:       bool = False
    requested_limit: int
    returned_pages:  int

class SaveRequest(BaseModel):
    requirements: List[SecurityRequirement]
    project_id:   Optional[str] = None
    session_id:   Optional[str] = None


class StoredCredentialRequest(BaseModel):
    email: str
    api_token: str


class StoredCredentialResponse(BaseModel):
    credential_id: str
    provider: str
    stored_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
