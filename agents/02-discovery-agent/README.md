# 02 · Discovery Agent

**Lifecycle stage:** Discovery & Research
**Status:** v0.1

## The problem
Most "AI research assistant" demos ask you to paste in research you already did. That's not discovery — that's formatting. Real discovery means going and finding things out before you've committed to an opinion.

## What it does
1. You give it a rough product idea, feature, or question.
2. It actually searches the web live — this isn't reasoning from training data, it's real-time research.
3. It hands back a first-pass discovery brief: market context, existing solutions/competitors, and the risks worth checking before you build.
4. Every non-obvious claim is tagged **[VERIFIED]** (found in search) or **[ASSUMPTION]** (its own reasoning) — it never quietly presents a guess as a fact.

This is the first agent in the series that's genuinely agentic in the technical sense — it doesn't just reason over what you give it, it takes an action (search) and decides what to do with the results.

## Setup
```bash
cd agents/02-discovery-agent
pip install -r requirements.txt
cp .env.example .env   # then edit .env and paste in your own Anthropic API key
uvicorn main:app --app-dir backend --port 8001
```
Then open http://localhost:8001 in your browser.

## Try it
Ask it something like:
> "Should we build a referral program for a mid-market B2B SaaS product?"

or

> "What's the competitive landscape for AI meeting-notes tools right now?"

Watch for the [VERIFIED] / [ASSUMPTION] tags — that split is the actual point of this agent, not the search itself.

## Built by
Built by a PM who hasn't hand-written code in 10-12 years. Part of the [pm-ships-ai](../../) series — **10 Years Rusty**.
