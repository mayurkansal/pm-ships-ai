from pathlib import Path

import agent
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(title="Requirements Agent")


class InterviewRequest(BaseModel):
    idea: str
    discovery_brief: str = ""


class QAPair(BaseModel):
    question: str
    answer: str


class DraftRequest(BaseModel):
    idea: str
    discovery_brief: str = ""
    qa: list[QAPair]


@app.post("/api/interview")
def interview(req: InterviewRequest):
    if not req.idea.strip():
        raise HTTPException(400, "idea is required")

    try:
        questions = agent.get_questions(req.idea, req.discovery_brief)
    except Exception as e:
        raise HTTPException(500, str(e))

    return {"questions": questions}


@app.post("/api/draft")
def draft(req: DraftRequest):
    if not req.idea.strip():
        raise HTTPException(400, "idea is required")

    try:
        prd = agent.draft_prd(
            req.idea, req.discovery_brief, [qa.model_dump() for qa in req.qa]
        )
    except Exception as e:
        raise HTTPException(500, str(e))

    return {"prd": prd}


app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
