# 01 · Accountability Agent

**Lifecycle stage:** Follow-through / accountability
**Status:** v0.2 (paste-text or file upload, plus a chat-query mode)

## The problem
Every PM has said "didn't we already agree someone would fix that?" three meetings too late. Standard meeting-notes tools extract action items from *one* meeting. They don't remember what you promised *last* time and quietly let it drop.

## What it does
1. You paste in today's meeting notes, or upload a `.txt`/`.md` export (e.g. from Notion or Google Docs).
2. It extracts any new action items (task, owner, due date).
3. It checks them against everything still open from earlier meetings, and tells you what's now resolved.
4. It flags anything still open that's overdue (past its due date) or has gone stale (open 14+ days with no due date) — even if nobody brought it up again today.
5. You can ask it plain-language questions about your tracker ("what's overdue from last month?") and it answers using the same overdue logic the app itself uses — not a separate, possibly-inconsistent guess.

The point isn't extraction. Extraction is commodity. The point is catching the things that quietly fell through the cracks.

## Setup
This agent is fully standalone — you don't need any other agent in this repo set up or running to use it.

1. Get this repo onto your machine (green **Code → Download ZIP** on GitHub, or `git clone https://github.com/mayurkansal/pm-ships-ai`)
2. In your terminal:
```bash
cd pm-ships-ai/agents/01-accountability-agent
pip install -r requirements.txt
cp .env.example .env   # then edit .env and paste in your own Anthropic API key
uvicorn main:app --app-dir backend --port 8000
```
3. Open http://localhost:8000 in your browser

You'll end up with the whole repo on disk, but only this folder needs any setup — the other agent folders can just sit there unused.

## Try it with the sample data
`sample_data/` has three synthetic weekly syncs (2026-08-18, 2026-08-25, 2026-09-01) for a fictional team. Paste them into the app **in order**, one at a time, using the matching date as the meeting label, and watch:
- the onboarding bug (meeting 1) go **overdue and unresolved** for two meetings straight
- the pricing deck task get picked up **as resolved** in meeting 2
- the user-interview task get added in meeting 2, then **resolved** in meeting 3

None of this data is real — it's fictional, for demo purposes only. Your own `data/action_items.json` (created automatically on first real run) is gitignored and never leaves your machine.

## Built by
Built by a PM who hasn't hand-written code in 10-12 years. Part of the [pm-ships-ai](../../) series — **10 Years Rusty**.
