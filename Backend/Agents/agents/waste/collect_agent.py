# agents/collect_agent.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# reuse the same sessions dict and QUESTIONS list
from .ask_agent import sessions, QUESTIONS

router = APIRouter()

class CollectIn(BaseModel):
    session_id: str
    answer: str

class CollectOut(BaseModel):
    next_question: str | None
    finished: bool
    summary: dict[str, str] | None

@router.post("/", response_model=CollectOut)
def collect(payload: CollectIn):
    session = sessions.get(payload.session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    idx = session["idx"]
    # record answer
    session["answers"][str(idx+1)] = payload.answer
    idx += 1
    session["idx"] = idx

    # if we've completed all questions
    if idx >= len(QUESTIONS):
        summary = session["answers"]
        sessions.pop(payload.session_id, None)
        return CollectOut(next_question=None, finished=True, summary=summary)

    # otherwise, return next question
    return CollectOut(next_question=QUESTIONS[idx], finished=False, summary=None)
