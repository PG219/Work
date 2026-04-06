"""
Deterministic enrichment for collected requirements.

Category and priority inference remain heuristic, but compliance mappings are
now derived from the PostgreSQL-backed NIST control catalog instead of a
handwritten in-memory lookup table.
"""
from __future__ import annotations

import re
from typing import List, Tuple

from agents.db_io import read_nist_controls

from .schemas import ComplianceMapping, Priority, RequirementCategory, SecurityRequirement

_nist_cache: List[dict] | None = None

CATEGORY_RULES: List[Tuple[List[str], RequirementCategory]] = [
    (["authenticat", "mfa", "2fa", "sso", "saml", "oauth", "login", "password", "biometric"], "Authentication"),
    (["access control", "rbac", "permission", "authoriz", "privilege", "role", "least privilege"], "Access Control"),
    (["encrypt", "tls", "ssl", "aes", "rsa", "cryptograph", "at rest", "in transit", "key management"], "Encryption"),
    (["pii", "personal data", "gdpr", "data protect", "privacy", "sensitive data", "classification"], "Data Protection"),
    (["log", "audit", "monitor", "siem", "trail", "event", "alert"], "Logging"),
    (["api", "endpoint", "rest", "graphql", "swagger", "openapi", "rate limit", "webhook"], "API Security"),
    (["session", "cookie", "token", "jwt", "csrf", "timeout", "idle"], "Session Management"),
    (["config", "hardening", "baseline", "default setting", "secure default"], "Configuration"),
    (["stripe", "sendgrid", "third.party", "vendor", "integrat", "webhook", "supplier"], "Third-party Integration"),
    (["pci", "hipaa", "soc2", "iso 27001", "nist", "owasp", "compliance", "certif", "gdpr"], "Compliance"),
    (["business rule", "workflow", "process logic", "fraud", "transaction"], "Business Logic"),
]

PRIORITY_SIGNALS: dict = {
    "Critical": ["must not", "critical", "mandatory", "immediately", "zero tolerance", "prohibited"],
    "High": ["shall", "must", "required", "high priority", "important", "significant"],
    "Medium": ["should", "moderate", "recommended", "preferred"],
    "Low": ["may", "nice to have", "optional", "low priority", "minor", "when possible"],
}


def _txt(req: SecurityRequirement) -> str:
    return f"{req.title} {req.description} {' '.join(req.tags)}".lower()


def _tokenize(text: str) -> set[str]:
    return {token for token in re.findall(r"[a-z0-9]{4,}", text.lower())}


def _load_nist_controls() -> List[dict]:
    global _nist_cache
    if _nist_cache is not None:
        return _nist_cache

    try:
        df = read_nist_controls()
    except Exception:
        _nist_cache = []
        return _nist_cache

    controls: List[dict] = []
    for _, row in df.iterrows():
        control_id = str(row.get("control id") or "").strip()
        control_name = str(row.get("control name") or "").strip()
        control_description = str(row.get("control description") or "").strip()
        if not control_id or not (control_name or control_description):
            continue

        controls.append(
            {
                "control": control_id,
                "description": control_name or control_description,
                "tokens": _tokenize(f"{control_id} {control_name} {control_description}"),
            }
        )

    _nist_cache = controls
    return _nist_cache


def infer_category(req: SecurityRequirement) -> RequirementCategory:
    txt = _txt(req)
    for keywords, cat in CATEGORY_RULES:
        if any(re.search(kw, txt) for kw in keywords):
            return cat
    return "Other"


def infer_priority(req: SecurityRequirement) -> Priority:
    txt = _txt(req)
    for priority, signals in PRIORITY_SIGNALS.items():
        if any(signal in txt for signal in signals):
            return priority
    return "Medium"


def map_compliance_frameworks(req: SecurityRequirement) -> List[ComplianceMapping]:
    txt_tokens = _tokenize(_txt(req))
    if not txt_tokens:
        return []

    mappings: List[ComplianceMapping] = []
    for control in _load_nist_controls():
        if len(txt_tokens & control["tokens"]) < 2:
            continue

        mappings.append(
            ComplianceMapping(
                framework="NIST CSF 2.0",
                version="2.0",
                control=control["control"],
                description=control["description"],
            )
        )
        if len(mappings) >= 3:
            break

    return mappings


def enrich_requirement(req: SecurityRequirement) -> SecurityRequirement:
    req.category = infer_category(req)
    req.priority = infer_priority(req)
    if not req.compliance_mappings:
        req.compliance_mappings = map_compliance_frameworks(req)
    return req


def build_summary(requirements: list) -> dict:
    from collections import Counter

    categories = Counter(r.get("category", "Other") for r in requirements)
    priorities = Counter(r.get("priority", "Medium") for r in requirements)
    sources = Counter(r.get("source", {}).get("type", "unknown") for r in requirements)
    frameworks: set = set()
    for r in requirements:
        for mapping in r.get("compliance_mappings", []):
            frameworks.add(mapping.get("framework", ""))
    return {
        "by_category": dict(categories),
        "by_priority": dict(priorities),
        "by_source": dict(sources),
        "frameworks": sorted(frameworks),
        "total": len(requirements),
    }
