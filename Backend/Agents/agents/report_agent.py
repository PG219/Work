# agents/report_agent.py

from fastapi import APIRouter
from typing import Dict, Any
from pydantic import BaseModel, Field
from goverance_agent_v1 import app, AssessmentState

class AssessmentInput(BaseModel):
    risk_matrix: Dict[str, Any] = Field(...,description='Data for the risk assessment matrix')
    controls:Dict[str, Any] = Field(...,description='The control assessment matrix data')
    answers:Dict[str, str] = {}

router = APIRouter()

@router.post("/assessment-report", response_model=Dict[str, Any])
def run_full_assessment(input_data:AssessmentInput):
    """
    Runs the full AI governance assessment and returns the final report.
    This endpoint triggers the entire LangGraph workflow from start to finish.
    """
    # Initialize an empty state to start the workflow
    initial_state = AssessmentState(
        # Pass the data from the request body to the initial state
        risk_matrix=input_data.risk_matrix,
        controls=input_data.controls,
        answers_map=input_data.answers,
        # Initialize other state variables as empty dictionaries or lists
        policy_documents="",
        per_question_scores={},
        per_question_rationales={},
        framework_scores={},
        overall_score=0.0,
        recommendations=[],
        detailed_analysis={},
        report={},
    )
    
    # Invoke the LangGraph application, which will run all nodes in sequence
    final_state = app.invoke(initial_state)
    
    # Return the 'report' section of the final state
    return final_state['report']