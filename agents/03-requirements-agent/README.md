# 03 · Requirements Agent

**Lifecycle stage:** Definition & Requirements
**Status:** v0.1

## The problem
Most "AI PRD generator" demos take a rough idea and confidently spit out a full spec in one shot — filling every gap with a plausible-sounding guess. That's not requirements definition, that's improv with extra steps.

## What it does
This one is two agents, not one:
1. **Interviewer** — reads your rough idea (and an optional pasted Discovery Brief for real market context) and asks 3-5 sharp clarifying questions — the ones that would actually change what gets built.
2. **Drafter** — takes your answers and writes a full structured PRD, using your answers as ground truth rather than inventing around gaps.
3. Every section of the PRD is tagged **[READY]** or **[NEEDS INPUT]** — so a thin section can't quietly pass as a solid one.

This is the first multi-agent build in the series: two distinct Claude calls with two distinct jobs, chained together, rather than one prompt doing everything.

## Setup
This agent is fully standalone — you don't need any other agent in this repo set up or running to use it. The optional "Discovery Brief" field is just a plain text box; it works with anything pasted in, or nothing at all.

1. Get this repo onto your machine (green **Code → Download ZIP** on GitHub, or `git clone https://github.com/mayurkansal/pm-ships-ai`)
2. In your terminal:
```bash
cd pm-ships-ai/agents/03-requirements-agent
pip install -r requirements.txt
cp .env.example .env   # then edit .env and paste in your own Anthropic API key
uvicorn main:app --app-dir backend --port 8002
```
3. Open http://localhost:8002 in your browser

You'll end up with the whole repo on disk, but only this folder needs any setup — the other agent folders can just sit there unused.

## Try it
Give it something like:
> "Let admins bulk-approve pending expense reports instead of approving them one at a time"

Answer the questions it asks — try leaving one vague or blank on purpose, and watch that section come back tagged [NEEDS INPUT] instead of a confident guess.

If you've already run the [Discovery Agent](../02-discovery-agent), paste its output into the "Discovery Brief" field — the Interviewer will ask sharper, more specific questions with that context.

## Built by
Built by a PM who hasn't hand-written code in 10-12 years. Part of the [pm-ships-ai](../../) series — **10 Years Rusty**.
