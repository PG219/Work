from __future__ import annotations

# ----------------- STD / 3rd-party imports -----------------
import os
import json
import asyncio
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List, Dict, Any, Optional, Literal

import openai
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# ----------------- Local imports -----------------
# For Section A (Deterministic)
# Note: These constants are used by the deterministic path only.
from .utils import RISK_LIST, BASE_SEVERITY, MITIGATION, TARGET_DATE
# For Section B (LLM-driven) - This is the key import for ID preservation.
from .utils import PREDEFINED_RISKS_MARKDOWN

# =============================================================================
# SECTION A — Deterministic dataset selection & ID preservation (Excel-driven)
#   - This section is unchanged and remains the ideal path for standardized,
#     auditable assessments.
# =============================================================================

# Paths: Excel files live one level up from this file (governance-agents/)
HERE = Path(__file__).resolve().parent
BASE = HERE.parent

def _data_path(name: str) -> Path:
    p = BASE / name
    if not p.exists():
        raise FileNotFoundError(f"Excel not found: {p}")
    return p

PREDEFINED_RISKS_XLSX    = _data_path("predefined_risks.xlsx")
PREDEFINED_CONTROLS_XLSX = _data_path("predefined_controls.xlsx")
STRIDE_RISKS_XLSX        = _data_path("stride_risks.xlsx")
NIST_CONTROLS_XLSX       = _data_path("nist_controls.xlsx")

# Sheet names
SHEET_PREDEFINED_RISKS    = "Sheet"
SHEET_PREDEFINED_CONTROLS = "Sheet1"
SHEET_STRIDE_RISKS        = "Sheet"
SHEET_NIST_CONTROLS       = "Sheet"

SystemType = Literal[
    "AI_SYSTEM",
    "CYBERSECURITY_SYSTEM",
    "THIRD_PARTY_AI_SYSTEM",
    "THIRD_PARTY_CYBERSECURITY",
]

@dataclass
class AssessmentSources:
    risks_path: Path
    controls_path: Path
    risks_sheet: str
    controls_sheet: str
    scope: Literal["in_house", "third_party"] = "in_house"

SYSTEM_TO_SOURCES: Dict[SystemType, AssessmentSources] = {
    "AI_SYSTEM": AssessmentSources(
        PREDEFINED_RISKS_XLSX, PREDEFINED_CONTROLS_XLSX,
        SHEET_PREDEFINED_RISKS, SHEET_PREDEFINED_CONTROLS, "in_house"
    ),
    "CYBERSECURITY_SYSTEM": AssessmentSources(
        STRIDE_RISKS_XLSX, NIST_CONTROLS_XLSX,
        SHEET_STRIDE_RISKS, SHEET_NIST_CONTROLS, "in_house"
    ),
    "THIRD_PARTY_AI_SYSTEM": AssessmentSources(
        PREDEFINED_RISKS_XLSX, PREDEFINED_CONTROLS_XLSX,
        SHEET_PREDEFINED_RISKS, SHEET_PREDEFINED_CONTROLS, "third_party"
    ),
    "THIRD_PARTY_CYBERSECURITY": AssessmentSources(
        STRIDE_RISKS_XLSX, NIST_CONTROLS_XLSX,
        SHEET_STRIDE_RISKS, SHEET_NIST_CONTROLS, "third_party"
    ),
}

# Column maps
COLS_AI_RISKS = {"risk_id": "risk id", "title": "risk name", "severity": "base_severity", "likelihood": "base_likelihood", "mitigation": "mitigation"}
COLS_CYBER_RISKS = {"risk_id": "risk id", "category": "category", "description": "risk description", "likelihood": "likelihood", "impact": "impact", "severity": "severity", "mitigation": "mitigation"}
COLS_AI_CONTROLS = {"control_id": "code", "section": "section", "title": "control", "requirements": "requirements"}
COLS_NIST_CONTROLS = {"control_id": "control id", "family": "family", "title": "control name", "description": "control description"}

def _read(path: Path, sheet: str) -> pd.DataFrame:
    df = pd.read_excel(path, sheet_name=sheet, dtype=str).fillna("")
    df.columns = [c.strip().lower() for c in df.columns]
    return df

def _records(df: pd.DataFrame) -> List[dict]:
    return df.to_dict(orient="records")

def answers_to_system_type(answers: dict) -> SystemType:
    q2 = (answers.get("q2") or "").strip().lower()
    st = (answers.get("system_type") or "").strip().lower()
    if "developing a product in-house" in q2:
        return "AI_SYSTEM" if st.startswith("ai-system") else "CYBERSECURITY_SYSTEM"
    return "THIRD_PARTY_AI_SYSTEM" if "ai-system" in st else "THIRD_PARTY_CYBERSECURITY"

def build_assessment_payload(answers: dict) -> dict:
    system_type = answers_to_system_type(answers)
    src = SYSTEM_TO_SOURCES[system_type]
    risks_df = _read(src.risks_path, src.risks_sheet)
    ctrls_df = _read(src.controls_path, src.controls_sheet)
    rmap = COLS_CYBER_RISKS if "CYBERSECURITY" in system_type else COLS_AI_RISKS
    cmap = COLS_NIST_CONTROLS if "CYBERSECURITY" in system_type else COLS_AI_CONTROLS
    risks: List[Dict[str, Any]] = []
    for r in _records(risks_df):
        rid = (r.get(rmap["risk_id"]) or "").strip()
        if not rid: continue
        risks.append({"risk_id": rid, "title": r.get(rmap.get("title",""), ""), "description": r.get(rmap.get("description",""), ""), "category": r.get(rmap.get("category",""), ""), "likelihood": r.get(rmap.get("likelihood",""), ""), "impact": r.get(rmap.get("impact",""), ""), "severity": r.get(rmap.get("severity",""), ""), "mitigation": r.get(rmap.get("mitigation",""), "")})
    controls: List[Dict[str, Any]] = []
    for c in _records(ctrls_df):
        cid = (c.get(cmap["control_id"]) or "").strip()
        if not cid: continue
        controls.append({"control_id": cid, "title": c.get(cmap.get("title",""), ""), "description": c.get(cmap.get("description",""), c.get(cmap.get("requirements",""), "")), "family": c.get(cmap.get("family",""), ""), "section": c.get(cmap.get("section",""), ""), "requirements": c.get(cmap.get("requirements",""), ""), "mapped_risk_ids": []})
    assert all(x["risk_id"] for x in risks), "risk_id missing in risks output"
    return {"system_type": system_type, "scope": src.scope, "risk_assessment": risks, "control_assessment": controls, "source_meta": {"risks_file": src.risks_path.name, "controls_file": src.controls_path.name}}

def process_questionnaire(answers_json: str) -> str:
    answers = json.loads(answers_json)
    return json.dumps(build_assessment_payload(answers), ensure_ascii=False)

router = APIRouter()
class QuestionnaireIn(BaseModel):
    answers: Dict[str, Any]

@router.post("/process_questionnaire")
def process_questionnaire_api(payload: QuestionnaireIn):
    try:
        return build_assessment_payload(payload.answers)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =============================================================================
# SECTION B — LLM-driven Risk & Control Assessment (MODIFIED & IMPROVED)
#   - Now preserves predefined Risk IDs from the LLM output.
#   - Control mapping is more robust.
#   - Uses standard logging.
# =============================================================================

openai.api_key = os.getenv("OPENAI_API_KEY")
logger = logging.getLogger("uvicorn")

class RiskControlIn(BaseModel):
    summary: str
    session_id: str
    project_id: str | None = None
    controls_path: str = "predefined_controls.xlsx"

class RiskOut(BaseModel):
    risk_id: str
    risk_assessment_id: str
    risk_name: str
    risk_owner: str
    severity: int
    justification: str
    mitigation: str
    target_date: str

class ControlOut(BaseModel):
    control_id: str
    risk_assessment_id: str
    code: str
    section: str
    control: str
    requirements: str
    status: str
    tickets: str
    related_risk: str

class RiskControlOut(BaseModel):
    session_id: str
    project_id: str | None
    risk_assessment_id: str
    risk_matrix: str
    control_matrix: str
    parsed_risks: List[RiskOut]
    parsed_controls: List[ControlOut]
    stored_in_db: bool = False

def load_predefined_controls(path: str) -> Optional[pd.DataFrame]:
    try:
        controls_path = (BASE / path).resolve() if not os.path.isabs(path) else Path(path)
        if not controls_path.exists():
            logger.warning(f"Controls file not found: {controls_path}. Using default controls.")
            return create_default_controls()
        controls_df = pd.read_excel(controls_path)
        logger.info("✅ Successfully loaded predefined controls from Excel.")
        return controls_df
    except Exception as e:
        logger.error(f"Error reading controls file: {e}. Using default controls.")
        return create_default_controls()

def create_default_controls() -> pd.DataFrame:
    default_controls = [
        {"CODE": "AC-001", "SECTION": "Access Control", "CONTROL": "User Authentication", "REQUIREMENTS": "Implement multi-factor authentication for all users"},
        {"CODE": "DM-001", "SECTION": "Data Management", "CONTROL": "Data Encryption", "REQUIREMENTS": "Encrypt sensitive data at rest and in transit"},
        {"CODE": "AI-001", "SECTION": "AI Governance", "CONTROL": "Model Validation", "REQUIREMENTS": "Validate AI models before deployment"},
    ]
    return pd.DataFrame(default_controls)

# --- MODIFIED: Risk Parsing Function (Preserves Predefined IDs) ---
def parse_markdown_table(table_content: str, risk_assessment_id: str) -> List[Dict[str, Any]]:
    """Parse markdown table and extract individual risks using predefined IDs from the LLM response."""
    risks = []
    lines = table_content.strip().split('\n')
    data_lines = [line for line in lines if line.strip() and '|' in line and not line.startswith('|--')]
    if len(data_lines) > 1: data_lines = data_lines[1:]

    for line in data_lines:
        cells = [cell.strip() for cell in line.split('|') if cell.strip()]
        if len(cells) >= 7:
            # KEY CHANGE: The first column is the predefined Risk ID, provided by the LLM.
            # This preserves the link to the canonical risk library.
            risk_id = cells[0]
            risk = {
                'risk_id': risk_id,
                'risk_assessment_id': risk_assessment_id,
                'risk_name': cells[1],
                'risk_owner': cells[2],
                'severity': int(cells[3]) if cells[3].isdigit() else 3,
                'justification': cells[4],
                'mitigation': cells[5],
                'target_date': cells[6]
            }
            risks.append(risk)
    return risks

# --- MODIFIED: Control Parsing Function (Simplified & More Robust) ---
def parse_control_table(table_content: str, risk_assessment_id: str) -> List[Dict[str, Any]]:
    """Parse control matrix markdown table, including the 'Related Risk' column."""
    controls = []
    lines = table_content.strip().split('\n')
    data_lines = [line for line in lines if line.strip() and '|' in line and '---' not in line]
    if len(data_lines) > 1: data_lines = data_lines[1:]

    for idx, line in enumerate(data_lines):
        cells = [cell.strip() for cell in line.split('|') if cell.strip()]
        if len(cells) >= 7:
            # KEY CHANGE: The 7th column is the 'Related Risk', provided by the LLM.
            # This is more reliable than keyword matching.
            control_id = f"CTRL-{risk_assessment_id}-{idx+1:03d}"
            control = {
                'control_id': control_id,
                'risk_assessment_id': risk_assessment_id,
                'code': cells[0], 'section': cells[1], 'control': cells[2],
                'requirements': cells[3], 'status': cells[4], 'tickets': cells[5],
                'related_risk': cells[6]
            }
            controls.append(control)
    return controls

# --- MODIFIED: Risk Generation Prompt (Instructs LLM to provide the ID) ---
async def generate_risk_matrix(summary: str) -> str:
    """Generate risk matrix using OpenAI, ensuring the predefined Risk ID is returned."""
    system_prompt = f"""
You are a risk analysis expert. Your task is to identify applicable risks from a predefined library based on a user's summary.

1.  **Analyze the summary** to understand the project context.
2.  **Refer to the official risk library below** to select relevant risks. You MUST use the exact `RISK ID` and `RISK NAME` from this library.
3.  For each applicable risk, assign an OWNER, a SEVERITY (1-5), and a brief justification.

**Official Risk Library:**
{PREDEFINED_RISKS_MARKDOWN}

Output ONLY a Markdown table with the following columns. The `Risk ID` column is MANDATORY.
| Risk ID | Risk | Owner | Severity | Justification | Mitigation | Target Date |
Do not add any introductory text.
"""
    try:
        resp = await asyncio.to_thread(
            openai.chat.completions.create,
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": summary}],
            temperature=0.5, max_tokens=1000,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating risk matrix: {e}", exc_info=True)
        raise HTTPException(500, f"Error generating risk matrix: {str(e)}")

# --- MODIFIED: Control Generation Prompt (Instructs LLM to map risks) ---
async def generate_control_matrix(risk_matrix: str, controls_df: pd.DataFrame) -> str:
    """Generate control matrix using OpenAI, instructing it to link controls to risks."""
    controls_markdown = controls_df.to_markdown(index=False)
    system_prompt = f"""
You are an expert Control Assessment Agent for AI systems.
Your task is to analyze an incoming risk matrix and map appropriate controls to each identified risk.

1.  **Analyze the Input**: The user will provide a risk matrix in markdown format.
2.  **Use Predefined Controls**: You MUST select relevant controls from the official list provided below. Do not invent new controls.

**Official Control List:**
{controls_markdown}

3.  **Generate Control Matrix**: For each risk in the input matrix, create a corresponding entry in a new control matrix.
   - Select the most appropriate control(s) from the Official Control List.
   - For the **Related Risk** column, specify the name of the risk from the input matrix that this control mitigates. This is a mandatory field.
   - Assess the implementation **STATUS**: "Compliant", "In Progress", or "Not Implemented".
   - If status is "In Progress" or "Not Implemented", create a placeholder **TICKET** (e.g., TICK-123); else "None".

4.  **Format**: Return a single markdown table with these exact columns:
   `CODE | SECTION | CONTROL | REQUIREMENTS | STATUS | TICKETS | Related Risk`
Do not add any prefix text.
"""
    try:
        resp = await asyncio.to_thread(
            openai.chat.completions.create,
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": f"Please perform a control assessment based on the following risk matrix:\n\n{risk_matrix}"}],
            temperature=0.3, max_tokens=1000,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating control matrix: {e}", exc_info=True)
        raise HTTPException(500, f"Error generating control matrix: {str(e)}")

# --- MODIFIED: Main LLM Endpoint (Uses standard logging) ---
@router.post("/", response_model=RiskControlOut)
async def run_risk_control_assessment(payload: RiskControlIn):
    """
    LLM-driven endpoint that generates both risk and control assessments.
    """
    summary = (payload.summary or "").strip()
    session_id = payload.session_id
    if not summary: raise HTTPException(400, "Summary is required")
    if not session_id: raise HTTPException(400, "Session ID is required")

    try:
        logger.info(f"control assessment for session: {session_id}")
        risk_matrix = await generate_risk_matrix(summary)
        risk_assessment_id = f"RC-{session_id[:8].upper()}"
        parsed_risks_data = parse_markdown_table(risk_matrix, risk_assessment_id)
        logger.info(f"Identified {len(parsed_risks_data)} risks from summary.")

        controls_df = load_predefined_controls(payload.controls_path)
        if controls_df is None: raise HTTPException(500, "Failed to load controls")

        control_matrix = await generate_control_matrix(risk_matrix, controls_df)
        parsed_controls_data = parse_control_table(control_matrix, risk_assessment_id)
        logger.info(f"Mapped {len(parsed_controls_data)} controls to identified risks.")

        # Create a mapping from risk name to risk ID for efficient lookup.
        risk_name_to_id_map = {risk['risk_name']: risk['risk_id'] for risk in parsed_risks_data}

        # Replace the 'related_risk' name from the LLM with the corresponding risk_id.
        for control in parsed_controls_data:
            risk_name = control.get('related_risk', '')
            # Use the map to find the ID. Fall back to a formatted string if not found.
            control['related_risk'] = risk_name_to_id_map.get(risk_name, f"UNMAPPED: {risk_name}")

        parsed_risks = [RiskOut(**risk) for risk in parsed_risks_data]
        parsed_controls = [ControlOut(**control) for control in parsed_controls_data]
        
        logger.info("✅ Assessment complete.")
        return RiskControlOut(
            session_id=session_id, project_id=payload.project_id, risk_assessment_id=risk_assessment_id,
            risk_matrix=risk_matrix, control_matrix=control_matrix,
            parsed_risks=parsed_risks, parsed_controls=parsed_controls, stored_in_db=False
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Critical error in risk-control assessment: {e}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")