# agents/cyber_risk_agent.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from typing import List
from agents.shared.excel_io import read_cyber_risks
from agents.shared.types import RiskIn, RiskOutItem, RiskResponse

router = APIRouter(prefix="/agent/cyber", tags=["Cyber Agents"])

def _mk_assessment_id(session_id: str) -> str:
    return f"RC-{session_id[:8].upper()}"

@router.post("/risk", response_model=RiskResponse)
def cyber_risk(payload: RiskIn):
    if not payload.session_id:
        raise HTTPException(400, "session_id is required")

    rid = _mk_assessment_id(payload.session_id)
    df = read_cyber_risks()
    # Expected STRIDE columns (lowercase):
    # "risk id", "category", "risk description", "likelihood", "impact", "severity", "mitigation"
    for c in ("risk id", "risk description", "severity"):
        if c not in df.columns:
            raise HTTPException(500, f"STRIDE sheet is missing '{c}' column")

    out: List[RiskOutItem] = []
    for _, r in df.iterrows():
        risk_id = (r.get("risk id") or "").strip()
        if not risk_id:
            continue
        name = (r.get("risk description") or "").strip()
        sev_raw = (r.get("severity") or "").strip()
        mitigation = (r.get("mitigation") or "").strip()
        sev = int(sev_raw) if sev_raw.isdigit() else 3

        out.append(RiskOutItem(
            risk_id=risk_id,
            risk_assessment_id=rid,
            risk_name=name,
            risk_owner="Owner",
            severity=sev,
            justification="",
            mitigation=mitigation,
            target_date=""
        ))

    return RiskResponse(
        session_id=payload.session_id,
        project_id=payload.project_id,
        risk_assessment_id=rid,
        parsed_risks=out
    )
