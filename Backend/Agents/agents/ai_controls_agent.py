# agents/ai_controls_agent.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from typing import List
from agents.shared.excel_io import read_ai_controls
from agents.shared.types import ControlsIn, ControlOutItem, ControlsResponse

router = APIRouter(prefix="/agent/ai", tags=["AI Agents"])

@router.post("/controls", response_model=ControlsResponse)
def ai_controls(payload: ControlsIn):
    if not payload.session_id:
        raise HTTPException(400, "session_id is required")
    if not payload.risk_assessment_id:
        raise HTTPException(400, "risk_assessment_id is required")

    df = read_ai_controls()
    for c in ("code", "section", "control", "requirements"):
        if c not in df.columns:
            raise HTTPException(500, f"AI controls sheet is missing '{c}' column")

    rids = [r for r in (payload.risk_ids or []) if r]
    idx  = 0

    out: List[ControlOutItem] = []
    for j, r in df.iterrows():
        code = (r.get("code") or "").strip()
        if not code:
            continue
        section = (r.get("section") or "").strip()
        control = (r.get("control") or "").strip()
        reqs    = (r.get("requirements") or "").strip()

        if rids:
            related = [rids[idx % len(rids)]]
            idx += 1
        else:
            related = [payload.risk_assessment_id]

        out.append(ControlOutItem(
            control_id=f"CTRL-{payload.risk_assessment_id}-{j+1:03d}",
            code=code,
            section=section,
            control=control,
            requirements=reqs,
            status="Not Implemented",
            tickets="None",
            relatedRisks=related,
        ))

    return ControlsResponse(
        session_id=payload.session_id,
        project_id=payload.project_id,
        risk_assessment_id=payload.risk_assessment_id,
        parsed_controls=out
    )
