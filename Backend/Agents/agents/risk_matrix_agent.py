# agents/risk_control_agent.py

import os
import openai
import pandas as pd
import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
from typing import List, Dict, Any, Optional

# --- UPDATED IMPORT ---
# Import the new markdown variable and remove unused ones
from .utils import PREDEFINED_RISKS_MARKDOWN

# Load API key
openai.api_key = os.getenv("OPENAI_API_KEY")
logger = logging.getLogger("uvicorn")

router = APIRouter()

# --- Pydantic Models (Unchanged) ---
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

# --- Control Loading Functions (Unchanged) ---
def load_predefined_controls(path: str) -> Optional[pd.DataFrame]:
    try:
        if not os.path.exists(path):
            logger.warning(f"Controls file not found: {path}. Using default controls.")
            return create_default_controls()
        
        controls_df = pd.read_excel(path)
        logger.info("Successfully loaded predefined controls from Excel.")
        return controls_df
    except Exception as e:
        logger.error(f"Error reading controls file: {e}. Using default controls.")
        return create_default_controls()

def create_default_controls() -> pd.DataFrame:
    default_controls = [
        {"CODE": "AC-001", "SECTION": "Access Control", "CONTROL": "User Authentication", "REQUIREMENTS": "Implement multi-factor authentication for all users"},
        {"CODE": "DM-001", "SECTION": "Data Management", "CONTROL": "Data Encryption", "REQUIREMENTS": "Encrypt sensitive data at rest and in transit"},
        {"CODE": "AI-001", "SECTION": "AI Governance", "CONTROL": "Model Validation", "REQUIREMENTS": "Validate AI models before deployment"},
        {"CODE": "SC-001", "SECTION": "Security", "CONTROL": "Vulnerability Assessment", "REQUIREMENTS": "Conduct regular security assessments"},
        {"CODE": "CM-001", "SECTION": "Compliance", "CONTROL": "Regulatory Compliance", "REQUIREMENTS": "Ensure compliance with relevant regulations"}
    ]
    return pd.DataFrame(default_controls)

# --- UPDATED: Risk Parsing Function ---
def parse_markdown_table(table_content: str, risk_assessment_id: str) -> List[Dict[str, Any]]:
    """Parse markdown table and extract individual risks using predefined IDs."""
    risks = []
    lines = table_content.strip().split('\n')
    
    data_lines = [line for line in lines if line.strip() and '|' in line and not line.startswith('|--')]
    
    if len(data_lines) > 1:
        data_lines = data_lines[1:]
    
    for line in data_lines:
        cells = [cell.strip() for cell in line.split('|') if cell.strip()]
        
        # Expect 7 columns now, with Risk ID as the first
        if len(cells) >= 7:
            # KEY CHANGE: Use the predefined risk ID from the table
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

# --- Control Parsing Function (Unchanged) ---
def parse_control_table(table_content: str, risk_assessment_id: str) -> List[Dict[str, Any]]:
    """Parse control matrix markdown table and create individual control objects."""
    controls = []
    lines = table_content.strip().split('\n')
    
    data_lines = [line for line in lines if line.strip() and '|' in line and '---' not in line]

    if len(data_lines) > 1:
        data_lines = data_lines[1:]
    
    control_counter = 1
    for line in data_lines:
        cells = [cell.strip() for cell in line.split('|') if cell.strip()]
        
        if len(cells) >= 7:
            control_id = f"CTRL-{risk_assessment_id}-{control_counter:03d}"
            control = {
                'control_id': control_id,
                'risk_assessment_id': risk_assessment_id,
                'code': cells[0],
                'section': cells[1],
                'control': cells[2], 
                'requirements': cells[3],
                'status': cells[4],
                'tickets': cells[5],
                'related_risk': cells[6]
            }
            controls.append(control)
            control_counter += 1
    
    return controls

# --- UPDATED: Risk Generation Function ---
async def generate_risk_matrix(summary: str) -> str:
    """Generate risk matrix using OpenAI."""
    system_prompt = f"""
        You are a risk analysis expert. Your task is to identify applicable risks from a predefined library based on a user's summary.

        1.  **Analyze the summary** to understand the project context.
        2.  **Refer to the official risk library below** to select relevant risks. You MUST use the exact `RISK ID` and `RISK NAME` from this library.
        3.  For each applicable risk, assign an OWNER, a SEVERITY (1-5), and a brief justification.

        **Official Risk Library:**
        {PREDEFINED_RISKS_MARKDOWN}

        Output ONLY a Markdown table with the following columns:
        | Risk ID | Risk | Owner | Severity | Justification | Mitigation | Target Date |
        Do not add any introductory text.
        """

    try:
        resp = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": summary}
            ],
            temperature=0.5,
            max_tokens=800,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating risk matrix: {str(e)}")
        raise HTTPException(500, f"Error generating risk matrix: {str(e)}")

# --- Control Generation Function (Unchanged) ---
async def generate_control_matrix(risk_matrix: str, controls_df: pd.DataFrame) -> str:
    """Generate control matrix using OpenAI."""
    controls_markdown = controls_df.to_markdown(index=False)
    
    system_prompt = f"""
You are an expert Control Assessment Agent for AI systems.
Your task is to analyze an incoming risk matrix and map appropriate controls to each identified risk.

1.  **Analyze the Input**: The user will provide a risk matrix in markdown format.
2.  **Use Predefined Controls**: You MUST select relevant controls from the official list provided below. Do not invent controls.

**Official Control List:**
{controls_markdown}

3.  **Generate Control Matrix**: For each risk in the input matrix, create a corresponding entry in a new control matrix.
   - Select the most appropriate control(s) from the Official Control List.
   - For the **Related Risk** column, specify the name of the risk from the input matrix that this control mitigates.
   - Assess the implementation **STATUS**. You can set it to "Compliant", "In Progress", or "Not Implemented".
   - If the status is "In Progress" or "Not Implemented", create a placeholder **TICKET** number (e.g., TICK-123). Otherwise, set it to "None".

4.  **Format the Output**: Return the control matrix as a single markdown table with these columns:
   `CODE | SECTION | CONTROL | REQUIREMENTS | STATUS | TICKETS | Related Risk`

If no risks are provided or no controls are applicable, respond with the table header and a single row stating "No applicable controls found."
Do not include any prefix or explanation text, just the markdown table.
"""

    try:
        resp = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Please perform a control assessment based on the following risk matrix:\n\n{risk_matrix}"}
            ],
            temperature=0.3,
            max_tokens=1000,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating control matrix: {str(e)}")
        raise HTTPException(500, f"Error generating control matrix: {str(e)}")

# --- Main Endpoint (Logic Unchanged) ---
@router.post("/", response_model=RiskControlOut)
async def run_risk_control_assessment(payload: RiskControlIn):
    """
    Combined endpoint that generates both risk and control assessments.
    """
    summary = payload.summary.strip()
    session_id = payload.session_id
    project_id = payload.project_id
    controls_path = payload.controls_path
    
    if not summary:
        raise HTTPException(400, "Summary is required")
    
    if not session_id:
        raise HTTPException(400, "Session ID is required")

    try:
        logger.info(f"Starting risk/control assessment for session: {session_id}")
        
        # Step 1: Generate Risk Matrix
        logger.info("Generating risk matrix...")
        risk_matrix = await generate_risk_matrix(summary)
        
        risk_assessment_id = f"RC-{session_id[:8].upper()}"
        
        parsed_risks_data = parse_markdown_table(risk_matrix, risk_assessment_id)
        
        # Step 2: Load Controls
        logger.info("Loading predefined controls...")
        controls_df = load_predefined_controls(controls_path)
        if controls_df is None:
            raise HTTPException(500, "Failed to load controls")
        
        # Step 3: Generate Control Matrix
        logger.info("Generating control matrix...")
        control_matrix = await generate_control_matrix(risk_matrix, controls_df)
        
        parsed_controls_data = parse_control_table(control_matrix, risk_assessment_id)
        
        # Step 4: Format response
        parsed_risks = [RiskOut(**risk) for risk in parsed_risks_data]
        parsed_controls = [ControlOut(**control) for control in parsed_controls_data]
        
        logger.info(f"Assessment complete: {len(parsed_risks)} risks and {len(parsed_controls)} controls generated.")
        
        return RiskControlOut(
            session_id=session_id,
            project_id=project_id,
            risk_assessment_id=risk_assessment_id,
            risk_matrix=risk_matrix,
            control_matrix=control_matrix,
            parsed_risks=parsed_risks,
            parsed_controls=parsed_controls,
            stored_in_db=False
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in risk-control assessment: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Internal server error: {str(e)}")