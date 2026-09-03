# pm-ships-ai

**10 Years Rusty** — a series by a PM who hasn't written code in 10-12 years, shipping one small AI agent a week by directing Claude to build, test, and deploy it.

No engineering team. No hand-written code. Just product judgment plus an AI that can build.

Each agent lives in its own folder under `agents/`, mapped to a stage of the product lifecycle:

| # | Stage | Agent | Status |
|---|-------|-------|--------|
| 01 | Follow-through / accountability | [Accountability Agent](agents/01-accountability-agent) | ✅ shipped |
| 02 | Discovery & research | [Discovery Agent](agents/02-discovery-agent) | ✅ shipped |

More stages (requirements, spec review, build enablement, testing, stakeholder alignment, launch, measurement, feedback synthesis, prioritization) are coming — one agent, one story, one week at a time.

## Toolkit
Also in here: a [PM slash-command toolkit](toolkit) — 15 Claude Code commands for PRDs, Jira tickets, Confluence pages, UAT cases, stakeholder updates, and more. Drop any of them into your own `.claude/commands/` folder.

## How to run any agent here
Each agent folder has its own README with setup steps. In general:
1. `cd` into the agent's folder
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and add your own Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
4. Run the backend as described in that folder's README (a small FastAPI server serving both the API and the frontend)

## Visual identity
Every agent uses the same rust/copper "10 Years Rusty" look — a real HTML/CSS/JS frontend (not a generic app-builder template), with a shared `logo.svg` + `styles.css` design system copied into each agent's `frontend/` folder so every build stays independently runnable while looking like part of the same family.

Your API key is yours — nothing here ever reads or sends it anywhere except directly to Anthropic's API from your own machine.
