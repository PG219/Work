#!/usr/bin/env python3
"""
AI Governance Assessor (API Mode)
-----------------------------------
This variant runs as a FastAPI service. It accepts questions, answers, and a
control matrix via a POST request to the /assess endpoint.

Logs assessment progress percentage to 'logs.txt'.
Run as a web server:
    uvicorn governance_agent_v1:app --reload
"""

from __future__ import annotations
import json
import os
import sys
import uvicorn
from dataclasses import dataclass, field
from typing import Dict, List, Any, TypedDict, Optional, TextIO

# --- FastAPI and Pydantic imports ---
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# --- Rich imports for Progress Logging ---
from rich.console import Console
from rich.panel import Panel
from rich.progress import track # <-- Re-added for progress
from rich import print as rprint_orig # Keep original rprint for critical errors

# --- File Logging Setup ---
LOG_FILE = "logs.txt"
log_file_sink: Optional[TextIO] = None
try:
    # Use 'a' to append if you want to keep logs between runs, 'w' to overwrite
    log_file_sink = open(LOG_FILE, "w")
except Exception as e:
    rprint_orig(f"FATAL: Could not open log file {LOG_FILE}: {e}", file=sys.stderr)
    sys.exit(1)

# Define the file console object for file logging
FILE_CONSOLE = Console(file=log_file_sink, record=True, tab_size=4, log_path=False, width=120)
def file_log(*objects, sep=" ", end="\n", style=None, **kwargs):
    """Logs to the file."""
    # Ensure sink is available before writing
    if FILE_CONSOLE.file:
        FILE_CONSOLE.print(*objects, sep=sep, end=end, style=style, **kwargs)
# --- End File Logging Setup ---

try:
    from langgraph.graph import StateGraph, END
    import yaml  # type: ignore
except ImportError:
    rprint_orig("[red]LangGraph or PyYAML not found. Please install them with 'pip install langgraph pyyaml'.[/red]", file=sys.stderr)
    sys.exit(1)

# Vertex AI (Gemini)
USE_VERTEX = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "True").lower() in ("1", "true", "yes")
try:
    if USE_VERTEX:
        from vertexai import init as vertexai_init
        from vertexai.generative_models import GenerativeModel, GenerationConfig, Part
except Exception as e:
    rprint_orig(f"[red]Vertex AI SDK not found or error during import: {e}. Please install google-cloud-aiplatform.[/red]", file=sys.stderr)
    sys.exit(1)

from google.oauth2 import service_account

FRAMEWORKS = ["EU", "NIST", "ISO"]

# --- Regulation Mapping (unchanged) ---
REGULATION_MAPPING = {
    "controls": {
        "human_oversight_design": {"EU": "Art. 14", "NIST": "Gov-4.2", "ISO": "Cl. 9.3"},
        "incident_response": {"EU": "Art. 62", "NIST": "Mng-5", "ISO": "Cl. 10.1"},
        "monitoring_bias_drift": {"EU": "Art. 15", "NIST": "Msr-2.4", "ISO": "Cl. 9.1"},
        "third_party_validation": {"EU": "Art. 17", "NIST": "Gov-5.3", "ISO": "Cl. 9.2"},
    },
    "questions": {
        "risk_classification": {"EU": "Art. 6", "NIST": "Map-1", "ISO": "Cl. 8.2"},
        "docs_traceability": {"EU": "Art. 11", "NIST": "Gov-2", "ISO": "Cl. 7.5"},
        "independent_validation": {"EU": "Art. 17", "NIST": "Gov-5", "ISO": "Cl. 9.2"},
        "monitoring_metrics": {"EU": "Art. 15", "NIST": "Msr-2", "ISO": "Cl. 9.1.1"},
        "leadership": {"ISO": "Cl. 5.1"},
        "gov_policies": {"ISO": "Cl. 5.2"},
    }
}

# --- Data classes (unchanged) ---
@dataclass
class AnswerRating:
    question_id: str
    maturity: int  # 0..4
    rationale: str

# --- Pydantic Models for API (unchanged) ---
class QuestionModel(BaseModel):
    id: str
    text: str
    tags: List[str]
    weights: Dict[str, float]

class ControlModel(BaseModel):
    desc: str
    weights: Dict[str, float]
    evidence: bool

class AssessmentRequest(BaseModel):
    questions: List[QuestionModel]
    answers: Dict[str, str]
    controls: Dict[str, ControlModel]

class AssessmentResponse(BaseModel):
    scores: Dict[str, float]
    overall: float
    recommendations: List[str]
    detailed_analysis: Dict[str, Dict[str, List[str]]]
    full_report: Dict[str, Any]

# --- LangGraph State (unchanged) ---
class AssessmentState(TypedDict):
    questions: List[Dict[str, Any]]
    answers_map: Dict[str, str]
    controls: Dict[str, Any]
    policy_documents: str
    per_question_scores: Dict[str, int]
    per_question_rationales: Dict[str, str]
    framework_scores: Dict[str, float]
    overall_score: float
    recommendations: List[str]
    detailed_analysis: Dict[str, Dict[str, List[str]]]
    report: Dict[str, Any]

# --- LangGraph Nodes ---

def load_policy_documents_node(state: AssessmentState) -> AssessmentState:
    """Loads policy documents."""
    policy_docs = """
    **AI Governance Policy - Document #1**
    1.  **Scope and Purpose:** This policy applies to all AI systems developed and deployed by our organization.
    2.  **Accountability:** The AI Governance Officer (AIGO) is responsible for oversight.
    3.  **Risk Management:** All AI projects must undergo a formal risk assessment, classified as per the EU AI Act.
    4.  **Human Oversight:** High-risk systems must include Human-in-the-Loop (HITL) mechanisms with clear escalation paths.
    5.  **Transparency:** Model cards and data sheets are mandatory for all production models.
    """
    state['policy_documents'] = policy_docs
    state['per_question_scores'] = {}
    state['per_question_rationales'] = {}
    return state

def score_answers_node(state: AssessmentState) -> AssessmentState:
    """Scores answers for each question using Vertex AI, logging progress."""
    project = os.getenv("GOOGLE_CLOUD_PROJECT", "bionic-mercury-455722-g1")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    model = os.getenv("MODEL", "gemini-2.5-flash-lite")

    # --- Use track for progress logging to file ---
    total_questions = len(state['questions'])
    if FILE_CONSOLE.file: # Check if file is open before using track
        # Wrap the loop with track, directing output to the file console
        for q in track(state['questions'], description=f"Scoring {total_questions} answers...", console=FILE_CONSOLE):
            qid = q["id"]
            raw = state['answers_map'].get(qid, "").strip()
            parts = [p.strip() for p in raw.replace("\n", " ").split(".") if p.strip()]
            if not parts:
                parts = [""]

            ratings = vertex_rate_answers(model, project, location, q["text"], parts, state['policy_documents'])
            best = max(ratings, key=lambda x: x.maturity)
            state['per_question_scores'][qid] = best.maturity
            state['per_question_rationales'][qid] = best.rationale
    else: # Fallback if file isn't open (shouldn't happen with current setup)
         for q in state['questions']:
            qid = q["id"]
            raw = state['answers_map'].get(qid, "").strip()
            parts = [p.strip() for p in raw.replace("\n", " ").split(".") if p.strip()]
            if not parts:
                parts = [""]
            ratings = vertex_rate_answers(model, project, location, q["text"], parts, state['policy_documents'])
            best = max(ratings, key=lambda x: x.maturity)
            state['per_question_scores'][qid] = best.maturity
            state['per_question_rationales'][qid] = best.rationale

    return state

def aggregate_scores_node(state: AssessmentState) -> AssessmentState:
    """Aggregates the scores for each framework."""
    state['framework_scores'] = aggregate_scores(state['questions'], state['controls'], state['per_question_scores'])
    state['overall_score'] = sum(state['framework_scores'].values()) / len(FRAMEWORKS)
    return state

def generate_analysis_node(state: AssessmentState) -> AssessmentState:
    """Generates detailed analysis and recommendations."""
    state['recommendations'] = recommend_next_steps(state['framework_scores'], state['controls'], state['per_question_scores'])
    state['detailed_analysis'] = generate_detailed_analysis(state['questions'], state['per_question_scores'], state['controls'])
    return state

def compile_report_node(state: AssessmentState) -> AssessmentState:
    """Compiles the final report."""
    state['report'] = {
        "scores": {fw: round(score, 2) for fw, score in state['framework_scores'].items()},
        "overall": round(state['overall_score'], 2),
        "per_question": state['per_question_scores'],
        "rationales": state['per_question_rationales'],
        "controls": state['controls'],
        "recommendations": state['recommendations'],
        "detailed_analysis": state['detailed_analysis']
    }
    return state

# --- Vertex / RAG Scoring (Keeps error fallback, minimal error logging) ---
SYSTEM_SCORING_INSTRUCTIONS = (
    # ... (instructions remain the same) ...
).strip()

def vertex_rate_answers(model_name: str, project: str, location: str,
                        question: str, answers: List[str], policy_documents: str) -> List[AnswerRating]:
    """
    Rates answers using Vertex AI's GenerativeModel.
    Returns default rating on error, logs minimal error info.
    """
    try:
        creds = service_account.Credentials.from_service_account_file("service.json")
        vertexai_init(project=project, location=location, credentials=creds)
        model = GenerativeModel(
            model_name,
            system_instruction=Part.from_text(SYSTEM_SCORING_INSTRUCTIONS)
        )
        user_prompt = {
            "policy_documents": policy_documents,
            "question": question,
            "answers": answers
        }
        generation_config = GenerationConfig(temperature=0, max_output_tokens=512)
        resp = model.generate_content(
            [Part.from_text(json.dumps(user_prompt))],
            generation_config=generation_config
        )
        text = resp.candidates[0].content.parts[0].text
        cleaned_text = text.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_text)
        ratings: List[AnswerRating] = []
        if not isinstance(data, list):
            data = [data] if isinstance(data, dict) else []
        for i, item in enumerate(data):
            if isinstance(item, dict):
                m = int(max(0, min(4, int(item.get("maturity", 0)))))
                rat = str(item.get("rationale", "No rationale provided."))
            else:
                m = 0
                rat = f"Malformed response item from AI: {item}"
            ratings.append(AnswerRating(question_id=f"{question}#{i}", maturity=m, rationale=rat))
        if not ratings:
             return [AnswerRating(question_id=f"{question}#0", maturity=0, rationale="Failed to parse valid rating.")]
        return ratings
    except Exception as e:
        # Log minimal error info
        error_msg = f"ERROR scoring question '{question[:30]}...': {type(e).__name__}"
        file_log(f"[bold red]{error_msg}[/bold red]")
        rprint_orig(f"ERROR: Vertex AI failed during scoring. See {LOG_FILE}.", file=sys.stderr)
        # Fallback on error
        return [AnswerRating(question_id=f"{question}#0", maturity=0, rationale="Failed due to AI model error.")]

# --- Aggregation and recommendations (unchanged) ---
def aggregate_scores(questions: List[Dict[str, Any]], control_matrix: Dict[str, Any],
                     per_question_scores: Dict[str, int]) -> Dict[str, float]:
    totals = {fw: 0.0 for fw in FRAMEWORKS}
    max_totals = {fw: 0.0 for fw in FRAMEWORKS}
    for q in questions:
        qid = q["id"]
        maturity = per_question_scores.get(qid, 0) / 4.0
        for fw in FRAMEWORKS:
            w = q["weights"].get(fw, 0.0)
            totals[fw] += maturity * w
            max_totals[fw] += 1.0 * w
    for key, ctl in control_matrix.items():
        if bool(ctl.get("evidence")):
            for fw in FRAMEWORKS:
                w = float(ctl.get("weights", {}).get(fw, 0.0))
                totals[fw] += 0.2 * w
                max_totals[fw] += 0.2 * w
    scores = {fw: (100.0 * (totals[fw] / max_totals[fw])) if max_totals[fw] > 0 else 0.0 for fw in FRAMEWORKS}
    return scores

def recommend_next_steps(scores: Dict[str, float], controls: Dict[str, Any], per_q: Dict[str, int]) -> List[str]:
    recs: List[str] = []
    def low(fw):
        return scores.get(fw, 0) < 70
    if low("EU"):
        recs.append("Establish EU AI Act risk classification and technical documentation (model/data lineage, decision logs); perform DPIA if applicable.")
    if low("NIST"):
        recs.append("Operationalize NIST AI RMF Govern/Map/Measure/Manage with metrics for bias, robustness, and incident response.")
    if low("ISO"):
        recs.append("Stand up an AI Management System (AIMS) per ISO/IEC 42001 with leadership commitment, policies, audits, and continual improvement.")
    for key, ctl in controls.items():
        if not bool(ctl.get("evidence")):
            recs.append(f"Implement control: {ctl['desc']}")
    return recs[:8]

# --- Detailed Analysis Generation (unchanged) ---
def generate_detailed_analysis(
    questions: List[Dict[str, Any]],
    per_question_scores: Dict[str, int],
    controls: Dict[str, Any]
) -> Dict[str, Dict[str, List[str]]]:
    analysis = {fw: {"contributing": [], "missing": []} for fw in FRAMEWORKS}
    def get_ref_string(item_type: str, item_id: str, framework: str) -> str:
        ref = REGULATION_MAPPING.get(item_type, {}).get(item_id, {}).get(framework)
        return f" (Ref: {framework} {ref})" if ref else ""
    for qid, score in per_question_scores.items():
        if score >= 2:
            question_info = next((q for q in questions if q['id'] == qid), None)
            if question_info:
                for fw in FRAMEWORKS:
                    if question_info['weights'].get(fw, 0) > 0.5:
                        analysis[fw]['contributing'].append(f"Addressed: '{question_info['text']}' (Maturity: {score}/4)")
    for key, ctl in controls.items():
        if ctl.get("evidence"):
            for fw in FRAMEWORKS:
                if ctl.get("weights", {}).get(fw, 0) > 0.5:
                    analysis[fw]['contributing'].append(f"Implemented Control: '{ctl['desc']}'")
    for key, ctl in controls.items():
        if not ctl.get("evidence"):
            for fw in FRAMEWORKS:
                if ctl.get("weights", {}).get(fw, 0) > 0.5:
                    ref_str = get_ref_string("controls", key, fw)
                    analysis[fw]['missing'].append(f"Missing Control: '{ctl['desc']}'{ref_str}")
    for qid, score in per_question_scores.items():
        if score < 2:
            question_info = next((q for q in questions if q['id'] == qid), None)
            if question_info:
                for fw in FRAMEWORKS:
                    if question_info['weights'].get(fw, 0) > 0.7:
                        ref_str = get_ref_string("questions", qid, fw)
                        analysis[fw]['missing'].append(f"Gap: '{question_info['text']}' (Maturity: {score}/4){ref_str}")
    for fw in FRAMEWORKS:
        analysis[fw]['contributing'] = sorted(list(set(analysis[fw]['contributing'])))
        analysis[fw]['missing'] = sorted(list(set(analysis[fw]['missing'])))
    return analysis

# --- FastAPI App Setup ---
app = FastAPI(title="AI Governance Assessor API", version="1.0.0")

# --- Build the LangGraph App ---
workflow = StateGraph(AssessmentState)
workflow.add_node("load_and_init", load_policy_documents_node)
workflow.add_node("score", score_answers_node)
workflow.add_node("aggregate", aggregate_scores_node)
workflow.add_node("analyze", generate_analysis_node)
workflow.add_node("report", compile_report_node)

workflow.set_entry_point("load_and_init")
workflow.add_edge("load_and_init", "score")
workflow.add_edge("score", "aggregate")
workflow.add_edge("aggregate", "analyze")
workflow.add_edge("analyze", "report")
workflow.add_edge("report", END)

langgraph_app = workflow.compile()

@app.post("/assess", response_model=AssessmentResponse)
async def run_assessment_endpoint(request: AssessmentRequest):
    """
    Receives assessment data, runs it through the LangGraph workflow,
    logs start/end/progress, and returns the final report.
    """
    request_id = os.urandom(4).hex() # Simple ID for tracking requests in logs
    file_log(Panel.fit(f"[bold]Assessment Request [{request_id}] Received[/bold]"))
    try:
        initial_state = {
            "questions": [q.model_dump() for q in request.questions],
            "answers_map": request.answers,
            "controls": {k: v.model_dump() for k, v in request.controls.items()},
        }

        # Invoke the assessment workflow (score_answers_node logs progress)
        final_state = langgraph_app.invoke(initial_state)

        response_data = AssessmentResponse(
            scores={fw: round(score, 2) for fw, score in final_state['framework_scores'].items()},
            overall=round(final_state['overall_score'], 2),
            recommendations=final_state['recommendations'],
            detailed_analysis=final_state['detailed_analysis'],
            full_report=final_state['report']
        )

        # Log completion summary with scores to FILE
        scores_str = ", ".join([f"{fw}: {score:.2f}" for fw, score in response_data.scores.items()])
        file_log(Panel.fit(f"[bold cyan]Assessment [{request_id}] Complete. Overall: {response_data.overall:.2f}, Frameworks: ({scores_str})[/bold cyan]"))

        return response_data
    except Exception as e:
        # Log detailed error info to file and raise HTTP exception
        error_info = f"Error during assessment [{request_id}]: {type(e).__name__} - {e}"
        file_log(f"[bold red]{error_info}[/bold red]")
        if FILE_CONSOLE.file: # Check if file exists before printing traceback
             FILE_CONSOLE.print_exception(show_locals=False) # Keep traceback in file
        rprint_orig(f"FATAL ERROR [{request_id}]: Assessment failed. See {LOG_FILE}.", file=sys.stderr) # Minimal terminal error
        raise HTTPException(status_code=500, detail=f"An error occurred during assessment [{request_id}].")

# --- Main Execution ---
if __name__ == "__main__":
    rprint_orig(f"Server starting. Logging assessment progress to {LOG_FILE}...", file=sys.stderr)
    try:
        # Pass log_config=None to prevent Uvicorn's default logging handlers
        # This allows Rich to handle output exclusively if needed, though basic startup/shutdown messages will still appear
        uvicorn.run(app, host="0.0.0.0", port=8001, log_config=None)
    finally:
        if log_file_sink:
            file_log(f"[bold yellow]AI Governance Assessor API Shutting Down.[/bold yellow]")
            log_file_sink.close()