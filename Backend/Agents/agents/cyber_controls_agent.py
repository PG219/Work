# agents/cyber_controls_agent.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from typing import List
from agents.shared.excel_io import read_nist_controls
from agents.shared.types import ControlsIn, ControlOutItem, ControlsResponse

router = APIRouter(prefix="/agent/cyber", tags=["Cybersecurity Agents"])

@router.post("/controls", response_model=ControlsResponse)
def cyber_controls(payload: ControlsIn):
    """
    Generate cybersecurity (NIST) controls and link them to relevant risk IDs.
    This version correctly rotates through the list of risk_ids passed from the backend.
    """
    if not payload.session_id:
        raise HTTPException(400, "session_id is required")
    if not payload.risk_assessment_id:
        raise HTTPException(400, "risk_assessment_id is required")

    df = read_nist_controls()
    # Ensure expected columns exist in the Excel
    for c in ("control id", "family", "control name", "control description"):
        if c not in df.columns:
            raise HTTPException(500, f"NIST controls sheet is missing '{c}' column")

    # List of risk IDs from the risk agent (e.g. ["STR-020", "STR-031", ...])
    rids = [r for r in (payload.risk_ids or []) if r]
    idx = 0  # will be used to rotate risks through controls

    out: List[ControlOutItem] = []
    for j, r in df.iterrows():
        cid = (r.get("control id") or "").strip()
        if not cid:
            continue
        family = (r.get("family") or "").strip()
        name = (r.get("control name") or "").strip()
        desc = (r.get("control description") or "").strip()

        # Rotate risk linkage
        if rids:
            related = [rids[idx % len(rids)]]
            idx += 1
        else:
            related = [payload.risk_assessment_id]

        out.append(ControlOutItem(
            control_id=f"CTRL-{payload.risk_assessment_id}-{j+1:03d}",
            code=cid,
            section=family,
            control=name,
            requirements=desc,
            status="Not Implemented",
            tickets="None",
            relatedRisks=related
        ))

    return ControlsResponse(
        session_id=payload.session_id,
        project_id=payload.project_id,
        risk_assessment_id=payload.risk_assessment_id,
        parsed_controls=out
    )
