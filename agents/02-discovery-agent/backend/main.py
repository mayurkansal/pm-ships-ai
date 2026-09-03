from pathlib import Path

import agent
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(title="Discovery Agent")


class ResearchRequest(BaseModel):
    topic: str


@app.post("/api/research")
def research(req: ResearchRequest):
    if not req.topic.strip():
        raise HTTPException(400, "topic is required")

    try:
        result = agent.research(req.topic)
    except Exception as e:
        raise HTTPException(500, str(e))

    return result


app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
