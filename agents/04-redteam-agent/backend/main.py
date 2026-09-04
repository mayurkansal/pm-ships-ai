from pathlib import Path

import agent
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(title="Red-Team Agent")


class RedTeamRequest(BaseModel):
    prd_text: str


@app.post("/api/red-team")
def red_team(req: RedTeamRequest):
    if not req.prd_text.strip():
        raise HTTPException(400, "prd_text is required")

    try:
        result = agent.red_team(req.prd_text)
    except Exception as e:
        raise HTTPException(500, str(e))

    return result


app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
