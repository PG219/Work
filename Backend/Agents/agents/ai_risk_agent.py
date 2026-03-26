# agents/ai_risk_agent.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from typing import List
from agents.shared.excel_io import read_ai_risks
from agents.shared.types import RiskIn, RiskOutItem, RiskResponse

router = APIRouter(prefix="/agent/ai", tags=["AI Agents"])

def _mk_assessment_id(session_id: str) -> str:
    return f"RC-{session_id[:8].upper()}"

@router.post("/risk", response_model=RiskResponse)
def ai_risk(payload: RiskIn):
    if not payload.session_id:
        raise HTTPException(400, "session_id is required")

    rid = _mk_assessment_id(payload.session_id)
    df = read_ai_risks()

    # Expected AI columns (lowercase)
    # "risk id", "risk name" (or "risk"), "base_severity", "base_likelihood", "mitigation"
    name_col = "risk name" if "risk name" in df.columns else ("risk" if "risk" in df.columns else None)
    if not name_col:
        raise HTTPException(500, "AI risks sheet is missing 'risk name' column")

    rows: List[RiskOutItem] = []
    for _, r in df.iterrows():
        risk_id = (r.get("risk id") or "").strip()
        if not risk_id:
            continue
        name = (r.get(name_col) or "").strip()
        severity_raw = (r.get("base_severity") or "").strip()
        mitigation = (r.get("mitigation") or "").strip()
        severity = int(severity_raw) if severity_raw.isdigit() else 3

        rows.append(RiskOutItem(
            risk_id=risk_id,
            risk_assessment_id=rid,
            risk_name=name,
            risk_owner="Owner",
            severity=severity,
            justification="",
            mitigation=mitigation,
            target_date=""
        ))

    return RiskResponse(
        session_id=payload.session_id,
        project_id=payload.project_id,
        risk_assessment_id=rid,
        parsed_risks=rows
    )
 