import json
import os

import anthropic

MODEL = "claude-sonnet-5"

SYSTEM_PROMPT = """You are an accountability assistant for a product manager. You read new meeting \
notes and do two things:

1. Extract any NEW action items mentioned in the notes (task, owner if named, due date if mentioned).
2. Compare the notes against a list of PREVIOUSLY OPEN action items from earlier meetings, and decide \
which of those are now clearly resolved/completed based on what the new notes say.

Respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{
  "new_items": [{"task": "...", "owner": "... or null", "due_date": "YYYY-MM-DD or null"}],
  "resolved_item_ids": ["id1", "id2"]
}

If nothing new was mentioned, "new_items" should be an empty list. If nothing was resolved, \
"resolved_item_ids" should be an empty list. Only mark an item resolved if the notes genuinely \
indicate it was completed or explicitly dropped — do not guess.
"""


def _client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key."
        )
    return anthropic.Anthropic(api_key=api_key)


def process_meeting(meeting_text: str, open_items: list) -> dict:
    open_items_summary = [
        {"id": item["id"], "task": item["task"], "owner": item["owner"], "due_date": item["due_date"]}
        for item in open_items
    ]

    user_prompt = f"""PREVIOUSLY OPEN ACTION ITEMS:
{json.dumps(open_items_summary, indent=2)}

NEW MEETING NOTES:
{meeting_text}
"""

    response = _client().messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    text_block = next(block for block in response.content if block.type == "text")
    raw = text_block.text.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw
        if raw.lower().startswith("json"):
            raw = raw.split("\n", 1)[1]

    return json.loads(raw)


ASK_SYSTEM_PROMPT = """You are an assistant that answers questions about a PM's action-item tracker. \
You'll be given the full list of tracked items (task, owner, due date, status, first seen, source \
meeting, and a pre-computed is_overdue flag) and a question. Trust the is_overdue flag as-is — it \
already accounts for both explicit due dates and items that have gone stale with no due date, so \
don't re-derive overdue status yourself. Answer concisely and specifically, referencing exact items, \
owners, and dates where relevant. If nothing in the list answers the question, say so plainly rather \
than guessing.
"""


def answer_question(question: str, items: list) -> str:
    items_summary = [
        {
            "task": item["task"],
            "owner": item["owner"],
            "due_date": item["due_date"],
            "status": item["status"],
            "first_seen": item["first_seen"],
            "source_meeting": item["source_meeting"],
            "is_overdue": item["is_overdue"],
        }
        for item in items
    ]

    user_prompt = f"""TRACKED ITEMS:
{json.dumps(items_summary, indent=2)}

QUESTION: {question}
"""

    response = _client().messages.create(
        model=MODEL,
        max_tokens=512,
        system=ASK_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    text_block = next(block for block in response.content if block.type == "text")
    return text_block.text.strip()
