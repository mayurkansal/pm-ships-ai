# 04 · Red-Team Agent

**Lifecycle stage:** Spec Review & Pre-Design
**Status:** v0.1

## The problem
A PRD usually gets one read-through before it ships to design and engineering — normally from whoever's closest to it, which means the same blind spots that were there when it was written are still there when it ships.

## What it does
1. You paste in a full PRD — yours, or the output from the [Requirements Agent](../03-requirements-agent).
2. **Three critics attack it in parallel**, each from a genuinely different angle:
   - 🔧 Engineering — feasibility gaps, missing edge cases, untestable acceptance criteria
   - 🎨 Design — missing user flows, unaddressed UI states, accessibility gaps
   - 💼 Exec — weak success metrics, unclear business case, unmeasurable goals
3. A **fourth agent synthesizes** all three into one prioritized list — Must Fix / Worth Addressing / Nice to Have — merging overlapping concerns instead of just stapling three lists together.

This is a different architecture from the Requirements Agent's sequential 2-call chain: this one fans out to 3 agents running at the same time, then merges. Four Claude calls total, three of them concurrent.

## Setup
This agent is fully standalone — you don't need any other agent in this repo set up or running to use it.

1. Get this repo onto your machine (green **Code → Download ZIP** on GitHub, or `git clone https://github.com/mayurkansal/pm-ships-ai`)
2. In your terminal:
```bash
cd pm-ships-ai/agents/04-redteam-agent
pip install -r requirements.txt
cp .env.example .env   # then edit .env and paste in your own Anthropic API key
uvicorn main:app --app-dir backend --port 8003
```
3. Open http://localhost:8003 in your browser

You'll end up with the whole repo on disk, but only this folder needs any setup — the other agent folders can just sit there unused.

## Try it
Paste in any real (or made-up) PRD — the rougher and more optimistic it is, the more interesting the critique. Watch the synthesis step actually merge overlapping concerns rather than just concatenating three separate lists.

## Built by
Built by a PM who hasn't hand-written code in 10-12 years. Part of the [pm-ships-ai](../../) series — **10 Years Rusty**.
