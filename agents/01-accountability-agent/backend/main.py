from datetime import date, datetime, timedelta
from pathlib import Path

import agent
import store
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
DATA_PATH = BASE_DIR / "data" / "action_items.json"
STALE_DAYS = 14

app = FastAPI(title="Accountability Agent")


class AnalyzeRequest(BaseModel):
    meeting_label: str
    meeting_text: str


class AskRequest(BaseModel):
    question: str


def is_overdue(item: dict) -> bool:
    if item["due_date"]:
        try:
            return datetime.strptime(item["due_date"], "%Y-%m-%d").date() < date.today()
        except ValueError:
            pass
    first_seen = datetime.strptime(item["first_seen"], "%Y-%m-%d").date()
    return date.today() - first_seen > timedelta(days=STALE_DAYS)


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    if not req.meeting_text.strip():
        raise HTTPException(400, "meeting_text is required")

    data_store = store.load_store(str(DATA_PATH))
    open_before = store.get_open_items(data_store)

    try:
        result = agent.process_meeting(req.meeting_text, open_before)
    except Exception as e:
        raise HTTPException(500, str(e))

    try:
        meeting_date = datetime.strptime(req.meeting_label, "%Y-%m-%d").date()
    except ValueError:
        meeting_date = date.today()

    added = store.add_items(data_store, result["new_items"], req.meeting_label, str(meeting_date))
    resolved = store.mark_resolved(data_store, result["resolved_item_ids"])
    store.save_store(str(DATA_PATH), data_store)

    return {"added": added, "resolved": resolved}


@app.get("/api/items")
def get_items():
    data_store = store.load_store(str(DATA_PATH))
    open_items = store.get_open_items(data_store)
    overdue = [item for item in open_items if is_overdue(item)]
    return {"open_items": open_items, "overdue_items": overdue}


@app.post("/api/ask")
def ask(req: AskRequest):
    if not req.question.strip():
        raise HTTPException(400, "question is required")

    data_store = store.load_store(str(DATA_PATH))
    items_with_status = [
        {**item, "is_overdue": item["status"] == "open" and is_overdue(item)}
        for item in data_store["items"]
    ]
    try:
        answer = agent.answer_question(req.question, items_with_status)
    except Exception as e:
        raise HTTPException(500, str(e))

    return {"answer": answer}


@app.post("/api/items/{item_id}/done")
def mark_done(item_id: str):
    data_store = store.load_store(str(DATA_PATH))
    store.set_status(data_store, item_id, "done")
    store.save_store(str(DATA_PATH), data_store)
    return {"ok": True}


app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
