import json
import os
import uuid


def load_store(path: str) -> dict:
    if not os.path.exists(path):
        return {"items": []}
    with open(path, "r") as f:
        return json.load(f)


def save_store(path: str, store: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(store, f, indent=2, default=str)


def get_open_items(store: dict) -> list:
    return [item for item in store["items"] if item["status"] == "open"]


def add_items(store: dict, new_items: list, meeting_label: str, meeting_date: str) -> list:
    added = []
    for item in new_items:
        record = {
            "id": str(uuid.uuid4())[:8],
            "task": item["task"],
            "owner": item.get("owner") or "Unassigned",
            "due_date": item.get("due_date"),
            "status": "open",
            "first_seen": meeting_date,
            "source_meeting": meeting_label,
        }
        store["items"].append(record)
        added.append(record)
    return added


def mark_resolved(store: dict, item_ids: list) -> list:
    resolved = []
    for item in store["items"]:
        if item["id"] in item_ids and item["status"] == "open":
            item["status"] = "done"
            resolved.append(item)
    return resolved


def set_status(store: dict, item_id: str, status: str) -> None:
    for item in store["items"]:
        if item["id"] == item_id:
            item["status"] = status
