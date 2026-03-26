#!/usr/bin/env python3
"""
AI Governance Assessor (API Mode)
-----------------------------------
This variant runs as a FastAPI service. It accepts questions, answers, and a
control matrix via a POST request to the /assess endpoint.

Run as a web server:
    uvicorn governance_agent_v1_debug:app --reload
"""

from __future__ import annotations
import json
import os
import sys
import uvicorn
from dataclasses import dataclass, field
from typing import Dict, List, Any, TypedDict

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from rich import print as rprint
from rich.panel import Panel
from rich.console import Console
from rich.progress import track

try:
    from langgraph.graph import StateGraph, END
    import yaml  # type: ignore
except ImportError:
    rprint("[red]LangGraph or PyYAML not found. Please install them with 'pip install langgraph pyyaml'.[/red]")
    sys.exit(1)

# Vertex AI (Gemini)
USE_VERTEX = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "True").lower() in ("1", "true", "yes")
try:
    if USE_VERTEX:
        from vertexai import init as vertexai_init
        from vertexai.generative_models import GenerativeModel, GenerationConfig, Part
except Exception:
    rprint("[red]Vertex AI SDK not found. Please install google-cloud-aiplatform.[/red]")
    sys.exit(1)


from google.oauth2 import service_account

FRAMEWORKS = ["EU", "NIST", "ISO"]

# --- Regulation Mapping and Data Classes (unchanged) ---
REGULATION_MAPPING = {
    "controls": {"human_oversight_design": {"EU": "Art. 14", "NIST": "Gov-4.2", "ISO": "Cl. 9.3"}, "incident_response": {"EU": "Art. 62", "NIST": "Mng-5", "ISO": "Cl. 10.1"}, "monitoring_bias_drift": {"EU": "Art. 15", "NIST": "Msr-2.4", "ISO": "Cl. 9.1"}, "third_party_validation": {"EU": "Art. 17", "NIST": "Gov-5.3", "ISO": "Cl. 9.2"}},
    "questions": {"risk_classification": {"EU": "Art. 6", "NIST": "Map-1", "ISO": "Cl. 8.2"}, "docs_traceability": {"EU": "Art. 11", "NIST": "Gov-2", "ISO": "Cl. 7.5"}, "independent_validation": {"EU": "Art. 17", "NIST": "Gov-5", "ISO": "Cl. 9.2"}, "monitoring_metrics": {"EU": "Art. 15", "NIST": "Msr-2", "ISO": "Cl. 9.1.1"}, "leadership": {"ISO": "Cl. 5.1"}, "gov_policies": {"ISO": "Cl. 5.2"}}
}

@dataclass
class AnswerRating:
    question_id: str
    maturity: int
    rationale: str

# --- Pydantic Models for API (unchanged) ---
class QuestionModel(BaseModel):
    id: str; text: str; tags: List[str]; weights: Dict[str, float]

class ControlModel(BaseModel):
    desc: str; weights: Dict[str, float]; evidence: bool

class AssessmentRequest(BaseModel):
    questions: List[QuestionModel]; answers: Dict[str, str]; controls: Dict[str, ControlModel]

class AssessmentResponse(BaseModel):
    scores: Dict[str, float]; overall: float; recommendations: List[str]; detailed_analysis: Dict[str, Dict[str, List[str]]]; full_report: Dict[str, Any]

# --- LangGraph State (unchanged) ---
class AssessmentState(TypedDict):
    questions: List[Dict[str, Any]]; answers_map: Dict[str, str]; controls: Dict[str, Any]; policy_documents: str; per_question_scores: Dict[str, int]; per_question_rationales: Dict[str, str]; framework_scores: Dict[str, float]; overall_score: float; recommendations: List[str]; detailed_analysis: Dict[str, Dict[str, List[str]]]; report: Dict[str, Any]

# ------------------------------
# LangGraph Nodes (WITH DEBUG PRINTS)
# ------------------------------

def load_policy_documents_node(state: AssessmentState) -> AssessmentState:
    rprint(Panel.fit("--- Entering Node: [bold]load_policy_documents_node[/bold] ---", style="green"))
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
    rprint("[green]✓ Policy documents loaded and scores initialized.[/green]")
    return state

def score_answers_node(state: AssessmentState) -> AssessmentState:
    rprint(Panel.fit("--- Entering Node: [bold]score_answers_node[/bold] ---", style="green"))
    project = os.getenv("GOOGLE_CLOUD_PROJECT", "bionic-mercury-455722-g1")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    model = os.getenv("MODEL", "gemini-2.5-flash-lite")

    for q in track(state['questions'], description="[cyan]Scoring answers...[/cyan]"):
        qid = q["id"]
        raw_answer = state['answers_map'].get(qid, "").strip()
        
        ratings = vertex_rate_answers(model, project, location, q["text"], raw_answer, state['policy_documents'])
        best_rating = max(ratings, key=lambda x: x.maturity)
        state['per_question_scores'][qid] = best_rating.maturity
        state['per_question_rationales'][qid] = best_rating.rationale
    
    rprint("[bold yellow]>>> Result from scoring node:[/bold yellow]")
    rprint(state['per_question_scores'])
    return state

def aggregate_scores_node(state: AssessmentState) -> AssessmentState:
    rprint(Panel.fit("--- Entering Node: [bold]aggregate_scores_node[/bold] ---", style="green"))
    state['framework_scores'] = aggregate_scores(state['questions'], state['controls'], state['per_question_scores'])
    state['overall_score'] = sum(state['framework_scores'].values()) / len(FRAMEWORKS) if FRAMEWORKS else 0.0
    
    rprint("[bold yellow]>>> Result from aggregation node:[/bold yellow]")
    rprint(f"Framework Scores: {state['framework_scores']}")
    rprint(f"Overall Score: {state['overall_score']:.2f}")
    return state

def generate_analysis_node(state: AssessmentState) -> AssessmentState:
    rprint(Panel.fit("--- Entering Node: [bold]generate_analysis_node[/bold] ---", style="green"))
    state['recommendations'] = recommend_next_steps(state['framework_scores'], state['controls'])
    state['detailed_analysis'] = generate_detailed_analysis(state['questions'], state['per_question_scores'], state['controls'])
    rprint("[green]✓ Analysis and recommendations generated.[/green]")
    return state

def compile_report_node(state: AssessmentState) -> AssessmentState:
    rprint(Panel.fit("--- Entering Node: [bold]compile_report_node[/bold] ---", style="green"))
    state['report'] = {
        "scores": {fw: round(score, 2) for fw, score in state['framework_scores'].items()}, 
        "overall": round(state['overall_score'], 2), 
        "per_question": state['per_question_scores'], 
        "rationales": state['per_question_rationales'], 
        "controls": state['controls'],
        "recommendations": state['recommendations'],
        "detailed_analysis": state['detailed_analysis']
    }
    rprint("[green]✓ Final report compiled.[/green]")
    return state

# ------------------------------
# Vertex / RAG Scoring (WITH DEBUG PRINTS)
# ------------------------------
SYSTEM_SCORING_INSTRUCTIONS = (
    """
You are an AI governance auditor. Your task is to assess an organization's AI governance maturity based ONLY on the provided policy documents.
Rate the answer on a scale of 0-4: 0=No evidence, 1=Emerging, 2=Defined, 3=Measured, 4=Optimized.
Strictly return a JSON list of objects: [{"maturity": int, "rationale": str}]
The rationale must be concise (<= 60 words) and reference the policy document.
    """
).strip()

def vertex_rate_answers(model_name: str, project: str, location: str,
                        question: str, answer: str, policy_documents: str) -> List[AnswerRating]:
    try:
        creds = service_account.Credentials.from_service_account_file("service.json")
        vertexai_init(project=project, location=location, credentials=creds)
        model = GenerativeModel(model_name, system_instruction=[SYSTEM_SCORING_INSTRUCTIONS])
        
        user_prompt = {"policy_documents": policy_documents, "question": question, "answer": answer}
        
        rprint(Panel(json.dumps(user_prompt, indent=2), title=f"[cyan]Sending to Gemini for question: '{question[:50]}...'[/cyan]", border_style="cyan"))

        resp = model.generate_content([json.dumps(user_prompt)], generation_config=GenerationConfig(temperature=0, max_output_tokens=512))
        
        raw_text = resp.candidates[0].content.parts[0].text
        rprint(Panel(raw_text, title="[magenta]Raw Text Response from Gemini[/magenta]", border_style="magenta"))

        cleaned_text = raw_text.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_text)

        ratings = [AnswerRating(question_id=f"{question}#0", maturity=int(item.get("maturity", 0)), rationale=str(item.get("rationale", ""))) for item in (data if isinstance(data, list) else [data])]
        return ratings if ratings else [AnswerRating(question_id=f"{question}#0", maturity=0, rationale="AI returned no parsable ratings.")]

    except Exception as e:
        rprint(Panel(f"An exception occurred: {e}", title=f"[bold red]CRITICAL ERROR in vertex_rate_answers for question '{question[:30]}...'[/bold red]", border_style="red"))
        return [AnswerRating(question_id=f"{question}#0", maturity=0, rationale="An exception occurred during AI model processing.")]

# ------------------------------
# Aggregation, Recommendations, Analysis (unchanged logic)
# ------------------------------
def aggregate_scores(questions: List[Dict[str, Any]], control_matrix: Dict[str, Any], per_question_scores: Dict[str, int]) -> Dict[str, float]:
    totals = {fw: 0.0 for fw in FRAMEWORKS}; max_totals = {fw: 0.0 for fw in FRAMEWORKS}
    for q in questions:
        qid = q["id"]; maturity = per_question_scores.get(qid, 0) / 4.0
        for fw in FRAMEWORKS:
            w = q["weights"].get(fw, 0.0); totals[fw] += maturity * w; max_totals[fw] += 1.0 * w
    for key, ctl in control_matrix.items():
        if bool(ctl.get("evidence")): # Simplified from original, assumes evidence=True means implemented
            for fw in FRAMEWORKS:
                w = float(ctl.get("weights", {}).get(fw, 0.0)); totals[fw] += 0.2 * w; max_totals[fw] += 0.2 * w
    return {fw: (100.0 * (totals[fw] / max_totals[fw])) if max_totals[fw] > 0 else 0.0 for fw in FRAMEWORKS}

def recommend_next_steps(scores: Dict[str, float], controls: Dict[str, Any]) -> List[str]:
    recs = []
    if scores.get("EU", 0) < 70: recs.append("Focus on EU AI Act compliance: establish risk classification and enhance technical documentation.")
    if scores.get("NIST", 0) < 70: recs.append("Operationalize the NIST AI RMF: define metrics for bias, robustness, and incident response.")
    if scores.get("ISO", 0) < 70: recs.append("Implement an AI Management System (AIMS) per ISO/IEC 42001 with clear governance.")
    for key, ctl in controls.items():
        if not bool(ctl.get("evidence")): recs.append(f"Implement missing control: {ctl['desc']}")
    return recs[:8]

def generate_detailed_analysis(questions: List[Dict[str, Any]], per_question_scores: Dict[str, int], controls: Dict[str, Any]) -> Dict[str, Dict[str, List[str]]]:
    analysis = {fw: {"contributing": [], "missing": []} for fw in FRAMEWORKS}
    for qid, score in per_question_scores.items():
        q_info = next((q for q in questions if q['id'] == qid), None)
        if q_info:
            for fw in FRAMEWORKS:
                if q_info['weights'].get(fw, 0) > 0.5:
                    if score >= 2: analysis[fw]['contributing'].append(f"Addressed: '{q_info['text']}' (Maturity: {score}/4)")
                    else: analysis[fw]['missing'].append(f"Gap: '{q_info['text']}' (Maturity: {score}/4)")
    for key, ctl in controls.items():
        for fw in FRAMEWORKS:
            if ctl.get("weights", {}).get(fw, 0) > 0.5:
                if ctl.get("evidence"): analysis[fw]['contributing'].append(f"Implemented: '{ctl['desc']}'")
                else: analysis[fw]['missing'].append(f"Missing Control: '{ctl['desc']}'")
    for fw in FRAMEWORKS:
        analysis[fw]['contributing'] = sorted(list(set(analysis[fw]['contributing'])))
        analysis[fw]['missing'] = sorted(list(set(analysis[fw]['missing'])))
    return analysis

# ------------------------------
# FastAPI App (WITH DEBUG PRINTS)
# ------------------------------
app = FastAPI(title="AI Governance Assessor API", version="1.1.0-debug")
console = Console()

# --- Build the LangGraph App ---
workflow = StateGraph(AssessmentState)
workflow.add_node("load_and_init", load_policy_documents_node)
workflow.add_node("score", score_answers_node)
workflow.add_node("aggregate", aggregate_scores_node)
workflow.add_node("analyze", generate_analysis_node)
workflow.add_node("report", compile_report_node)
workflow.set_entry_point("load_and_init")
workflow.add_edge("load_and_init", "score"); workflow.add_edge("score", "aggregate"); workflow.add_edge("aggregate", "analyze"); workflow.add_edge("analyze", "report"); workflow.add_edge("report", END)
langgraph_app = workflow.compile()

@app.post("/assess", response_model=AssessmentResponse)
async def run_assessment_endpoint(request: AssessmentRequest):
    try:
        rprint(Panel.fit("[bold]Received new assessment request via API[/bold]", style="blue"))
        rprint(Panel(json.dumps(request.model_dump(), indent=2), title="[blue]Incoming Request Payload[/blue]", border_style="blue"))
        
        initial_state = {
            "questions": [q.model_dump() for q in request.questions],
            "answers_map": request.answers,
            "controls": {k: v.model_dump() for k, v in request.controls.items()},
        }
        
        final_state = langgraph_app.invoke(initial_state)

        response_data = AssessmentResponse(
            scores={fw: round(score, 2) for fw, score in final_state['framework_scores'].items()},
            overall=round(final_state['overall_score'], 2),
            recommendations=final_state['recommendations'],
            detailed_analysis=final_state['detailed_analysis'],
            full_report=final_state['report']
        )
        
        rprint(Panel(json.dumps(response_data.model_dump(), indent=2), title="[bold cyan]Final API Response[/bold cyan]", border_style="cyan"))
        
        return response_data
    except Exception as e:
        rprint(f"[bold red]An error occurred in the endpoint: {e}[/bold red]")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")

if __name__ == "__main__":
    rprint("[bold green]Starting AI Governance Assessor API (Debug Mode)...[/bold green]")
    uvicorn.run("governance_agent_v1_debug:app", host="0.0.0.0", port=8001, reload=True)
