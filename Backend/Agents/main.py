# main.py
from __future__ import annotations
import os
from pathlib import Path
from typing import List, Optional, Dict, Any

import pandas as pd
from fastapi import FastAPI, HTTPException, Body, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from starlette.requests import Request
from pydantic import BaseModel

# --- Initialization from Orchestrator ---
load_dotenv()
app = FastAPI(title="AI Governance Agent API (Combined)", version="2.0.0")

# --- CORS from Orchestrator ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ---------- Config (from File 1) ----------
ROOT = Path(__file__).resolve().parent

PREDEFINED_RISKS_XLSX    = ROOT / "predefined_risks.xlsx"
PREDEFINED_CONTROLS_XLSX = ROOT / "predefined_controls.xlsx"
STRIDE_RISKS_XLSX        = ROOT / "stride_risks.xlsx"
NIST_CONTROLS_XLSX       = ROOT / "nist_controls.xlsx"

SHEET_PREDEFINED_RISKS    = "Sheet"
SHEET_PREDEFINED_CONTROLS = "Sheet1"
SHEET_STRIDE_RISKS        = "Sheet"
SHEET_NIST_CONTROLS       = "Sheet"

# ---------- Helpers (from File 1) ----------
def _read_xlsx(path: Path, sheet: str) -> pd.DataFrame:
    if not path.exists():
        raise HTTPException(500, f"Excel not found: {path}")
    df = pd.read_excel(path, sheet_name=sheet, dtype=str).fillna("")
    df.columns = [c.strip().lower() for c in df.columns]
    return df

def read_ai_risks() -> pd.DataFrame:
    return _read_xlsx(PREDEFINED_RISKS_XLSX, SHEET_PREDEFINED_RISKS)

def read_ai_controls() -> pd.DataFrame:
    return _read_xlsx(PREDEFINED_CONTROLS_XLSX, SHEET_PREDEFINED_CONTROLS)

def read_cyber_risks() -> pd.DataFrame:
    return _read_xlsx(STRIDE_RISKS_XLSX, SHEET_STRIDE_RISKS)

def read_nist_controls() -> pd.DataFrame:
    return _read_xlsx(NIST_CONTROLS_XLSX, SHEET_NIST_CONTROLS)

def _mk_assessment_id(session_id: str) -> str:
    return f"RC-{session_id[:8].upper()}"

def _sev_to_int(v: str) -> int:
    """Map text severities to 1..5 (L..VH). Unknown => 3."""
    s = str(v or "").strip().lower()
    if s.isdigit():  # already numeric in some sheets
        try:
            n = int(s)
            return max(1, min(5, n))
        except:
            return 3
    mapping = {
        "very high": 5, "critical": 5, "vh": 5,
        "high": 4, "h": 4,
        "medium": 3, "med": 3, "m": 3,
        "low": 2, "l": 2,
        "very low": 1, "vl": 1,
    }
    return mapping.get(s, 3)

def _score_row(text: str, hay: str) -> int:
    """Very simple keyword score: count of overlapping meaningful tokens."""
    if not text or not hay:
        return 0
    t = [w for w in text.lower().split() if len(w) > 3]
    h = hay.lower()
    return sum(1 for w in t if w in h)

def _select_relevant_rows_ai(df: pd.DataFrame, summary: str, limit: Optional[int]) -> pd.DataFrame:
    """Score AI risks by matching summary to name/mitigation."""
    if not summary:
        return df if not limit else df.head(limit)
    scored = []
    for i, r in df.iterrows():
        name = str(r.get("risk name") or r.get("risk") or "")
        mit  = str(r.get("mitigation") or "")
        s = _score_row(summary, f"{name} {mit}")
        scored.append((s, i))
    # Keep rows with score>0; fallback to all if none matched
    keep = [idx for s, idx in scored if s > 0]
    out = df.loc[keep] if keep else df
    if limit:
        out = out.head(limit)
    return out

def _select_relevant_rows_cyber(df: pd.DataFrame, summary: str, limit: Optional[int]) -> pd.DataFrame:
    """Score STRIDE risks by matching summary to description/category/mitigation."""
    if not summary:
        return df if not limit else df.head(limit)
    scored = []
    for i, r in df.iterrows():
        desc = str(r.get("risk description") or "")
        cat  = str(r.get("category") or "")
        mit  = str(r.get("mitigation") or "")
        s = _score_row(summary, f"{desc} {cat} {mit}")
        scored.append((s, i))
    keep = [idx for s, idx in scored if s > 0]
    out = df.loc[keep] if keep else df
    if limit:
        out = out.head(limit)
    return out

# ---------- Models (from File 1) ----------
class RiskIn(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    summary: Optional[str] = ""
    limit: Optional[int] = None

class ControlsIn(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    risk_assessment_id: str
    risk_ids: Optional[List[str]] = None

class RiskOutItem(BaseModel):
    risk_id: str
    risk_assessment_id: str
    risk_name: str
    risk_owner: str
    severity: int
    justification: str
    mitigation: str
    target_date: str

class ControlOutItem(BaseModel):
    control_id: str
    code: str
    section: str
    control: str
    requirements: str
    status: str
    tickets: str
    relatedRisks: List[str]

class RiskResponse(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    risk_assessment_id: str
    parsed_risks: List[RiskOutItem]

class ControlsResponse(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    risk_assessment_id: str
    parsed_controls: List[ControlOutItem]

# --- APIRouter for Excel-based Endpoints (Orchestrator structure) ---
excel_agent_router = APIRouter()

# ---------- AI Risk (Logic from File 1) ----------
@excel_agent_router.post("/ai/risk", response_model=RiskResponse, tags=["Excel Agent - AI"])
def ai_risk(payload: RiskIn):
    if not payload.session_id:
        raise HTTPException(400, "session_id is required")

    rid = _mk_assessment_id(payload.session_id)
    df = read_ai_risks()
    name_col = "risk name" if "risk name" in df.columns else ("risk" if "risk" in df.columns else None)
    if not name_col:
        raise HTTPException(500, "AI risks sheet is missing 'risk name' column")

    df2 = _select_relevant_rows_ai(df, payload.summary or "", payload.limit)

    out: List[RiskOutItem] = []
    for _, r in df2.iterrows():
        risk_id = (r.get("risk id") or "").strip()
        if not risk_id:
            continue
        name = (r.get(name_col) or "").strip()
        sev   = _sev_to_int(r.get("base_severity") or r.get("severity") or "")
        mit   = (r.get("mitigation") or "").strip()

        out.append(RiskOutItem(
            risk_id=risk_id,
            risk_assessment_id=rid,
            risk_name=name,
            risk_owner="Owner",
            severity=sev,
            justification="",
            mitigation=mit,
            target_date=""
        ))

    return RiskResponse(
        session_id=payload.session_id,
        project_id=payload.project_id,
        risk_assessment_id=rid,
        parsed_risks=out
    )

# ---------- AI Controls (Logic from File 1 - Corrected) ----------
@excel_agent_router.post("/ai/controls", response_model=ControlsResponse, tags=["Excel Agent - AI"])
def ai_controls(payload: ControlsIn):
    if not payload.session_id:
        raise HTTPException(400, "session_id is required")
    if not payload.risk_assessment_id:
        raise HTTPException(400, "risk_assessment_id is required")

    df = read_ai_controls()
    for c in ("code", "section", "control", "requirements"):
        if c not in df.columns:
            raise HTTPException(500, f"AI controls sheet is missing '{c}' column")

    # rotate through provided risk_ids (if any)
    rids = [r for r in (payload.risk_ids or []) if r]
    idx = 0

    out: List[ControlOutItem] = []
    for j, r in df.iterrows():
        code = (r.get("code") or "").strip()
        if not code:
            continue
        section = (r.get("section") or "").strip()
        name    = (r.get("control") or "").strip()
        reqs    = (r.get("requirements") or "").strip()

        # choose a related risk id, or fallback to assessment id
        if rids:
            related = [rids[idx % len(rids)]]
            idx += 1
        else:
            related = [payload.risk_assessment_id]

        out.append(ControlOutItem(
            control_id=f"CTRL-{payload.risk_assessment_id}-{j+1:03d}",
            code=code,
            section=section,
            control=name,
            requirements=reqs,
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

# ---------- Cyber Risk (Logic from File 1) ----------
@excel_agent_router.post("/cyber/risk", response_model=RiskResponse, tags=["Excel Agent - Cyber"])
def cyber_risk(payload: RiskIn):
    if not payload.session_id:
        raise HTTPException(400, "session_id is required")

    rid = _mk_assessment_id(payload.session_id)
    df = read_cyber_risks()
    for c in ("risk id", "risk description", "severity"):
        if c not in df.columns:
            raise HTTPException(500, f"STRIDE sheet is missing '{c}' column")

    df2 = _select_relevant_rows_cyber(df, payload.summary or "", payload.limit)

    out: List[RiskOutItem] = []
    for _, r in df2.iterrows():
        risk_id = (r.get("risk id") or "").strip()
        if not risk_id:
            continue
        name = (r.get("risk description") or "").strip()
        sev  = _sev_to_int(r.get("severity") or r.get("base_severity") or "")
        mit  = (r.get("mitigation") or "").strip()

        out.append(RiskOutItem(
            risk_id=risk_id,
            risk_assessment_id=rid,
            risk_name=name,
            risk_owner="Owner",
            severity=sev,
            justification="",
            mitigation=mit,
            target_date=""
        ))

    return RiskResponse(
        session_id=payload.session_id,
        project_id=payload.project_id,
        risk_assessment_id=rid,
        parsed_risks=out
    )

# ---------- Cyber Controls (Logic from File 1 - Corrected) ----------
@excel_agent_router.post("/cyber/controls", response_model=ControlsResponse, tags=["Excel Agent - Cyber"])
def cyber_controls(payload: ControlsIn):
    if not payload.session_id:
        raise HTTPException(400, "session_id is required")
    if not payload.risk_assessment_id:
        raise HTTPException(400, "risk_assessment_id is required")

    df = read_nist_controls()
    for c in ("control id", "family", "control name", "control description"):
        if c not in df.columns:
            raise HTTPException(500, f"NIST controls sheet is missing '{c}' column")

    rids = [r for r in (payload.risk_ids or []) if r]
    idx = 0

    out: List[ControlOutItem] = []
    for j, r in df.iterrows():
        cid   = (r.get("control id") or "").strip()
        if not cid:
            continue
        family = (r.get("family") or "").strip()
        name   = (r.get("control name") or "").strip()
        desc   = (r.get("control description") or "").strip()

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

# -------- Middleware and Helpers from Orchestrator (File 2) --------

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"--> {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        print(f"<-- {request.method} {request.url.path} {response.status_code}")
        return response
    except Exception as e:
        print(f"!! {request.method} {request.url.path} raised: {e}")
        raise

def _safe_include(router_import_callable, prefix: str, name: str):
    try:
        router = router_import_callable()
        app.include_router(router, prefix=prefix, tags=[name])
        print(f"[OK] Mounted {name} at {prefix}")
    except Exception as e:
        print(f"[WARN] Skipped dynamic agent '{name}': {e}")


# --- Mount Routers: Integrated Excel Agent + Dynamic External Agents ---

# 1. Mount the self-contained Excel-reading agent that is now part of this file
app.include_router(excel_agent_router, prefix="/agent")
print("[OK] Mounted built-in Excel Agent at /agent")

# 2. Keep the dynamic, resilient loading for other external agents
_safe_include(lambda: __import__("agents.chat_agent", fromlist=["router"]).router,
              "/agent/chat", "chat_agent")

_safe_include(lambda: __import__("agents.risk_matrix_agent", fromlist=["router"]).router,
              "/agent/risk-matrix", "risk_matrix_agent")

_safe_include(lambda: __import__("agents.report_agent", fromlist=["router"]).router,
              "/agent/assessment", "report_agent")

def _mount_governance():
    for modname in ("goverance_agent", "goverance_agent_v1"):
        try:
            gapp = __import__(modname, fromlist=["app"]).app
            # Note: The stub from File 2 is now the fallback if this module fails.
            app.include_router(gapp.router, prefix="/agent/governance", tags=["governance_agent"])
            print(f"[OK] Mounted governance app from {modname} at /agent/governance")
            return
        except Exception as e:
            print(f"[WARN] Governance module '{modname}' not used: {e}")
    # If no governance module is found, add a fallback stub so the backend never 404s.
    @app.post("/agent/governance/assess", tags=["governance_agent (stub)"])
    def governance_stub(payload: Dict[str, Any] = Body(default={})):
        controls: Dict[str, Any] = payload.get("controls", {}) or {}
        total = len(controls); implemented = sum(1 for v in controls.values() if v.get("evidence"))
        pct = round((implemented / total) * 100, 1) if total else 0.0
        return {"scores": {"EU": pct, "NIST": pct, "ISO": pct}, "implementedControls": implemented, "totalControls": total, "report": {"summary": f"{implemented}/{total} controls evidenced ({pct}%).", "details": {}}}
    print("[INFO] Mounted governance stub as a fallback.")

_mount_governance()


# --- Optional RAG Service (Startup Event) ---
@app.on_event("startup")
async def startup_event():
    try:
        mod = __import__("agents.app", fromlist=["router", "initialize_rag_service"])
        router, initialize_rag_service = mod.router, mod.initialize_rag_service
        if initialize_rag_service:
            print("Application startup: Initializing RAG service...")
            initialize_rag_service()
            print("RAG service initialization complete.")
        if router:
            app.include_router(router, prefix="/agent/rag", tags=["rag_agent"])
            print("[OK] Mounted RAG at /agent/rag")
    except Exception as e:
        print(f"[WARN] RAG service init skipped: {e}")


# --- Health and Root Endpoints ---
@app.get("/", tags=["Health"])
def read_root():
    return {"message": "AI Governance Agent API (Combined)", "version": "2.0.0"}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


# --- Run command (for direct execution) ---
if __name__ == "__main__":
    import uvicorn
    # Make sure you have the excel files in the same directory to run this
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)