# PM Slash-Command Toolkit

15 Claude Code slash commands built for day-to-day product management work — PRDs, Jira tickets, Confluence pages, UAT test cases, stakeholder updates, competitive briefs, VOC analysis, meeting notes, newsletters, release announcements, presentations, and folder cleanup.

Each `.md` file in [`commands/`](commands) is a Claude Code custom command, prefixed `pm-` so they're easy to spot as a set and won't collide with any custom commands you already have.

The same 15 are also available as [Claude Skills](skills) — same content, packaged so Claude can auto-trigger them instead of requiring an explicit `/command`.

## Setup (2 minutes)

**Prerequisite:** [Claude Code](https://docs.claude.com/en/docs/claude-code) installed and working.

1. Download this repo (green **Code → Download ZIP** button on GitHub, or `git clone https://github.com/mayurkansal/pm-ships-ai`)
2. Pick commands, skills, or both:
   - **Commands** (explicit — you type `/pm-prd`): copy the `.md` files you want from `toolkit/commands/` into `~/.claude/commands/` on your computer (create that folder if it doesn't exist)
   - **Skills** (automatic — Claude notices on its own): copy the folders you want from `toolkit/skills/` into `~/.claude/skills/` (create that folder if it doesn't exist)
3. Start a new Claude Code session (any project, any folder) — the `~/.claude/` location makes them available everywhere, not just one project

That's it — no API key, no config, no install script. Only copy in the ones you'll actually use; you don't need all 15.

## What's here

| Command | What it does |
|---|---|
| `/pm-prd` | PRD writing standard — structure, tone, and what to flag |
| `/pm-prd-writer` | Full PRD generator from a rough feature brief |
| `/pm-jira-create` | Generates Epics/Stories/Bugs/Tasks ready to paste into Jira |
| `/pm-jira-ticket-writer` | Plain-English feature/bug description → formatted Jira ticket |
| `/pm-confluence` | Create, edit, search, and template Confluence pages |
| `/pm-uat-cases` | Structured, testable UAT test cases from a feature description |
| `/pm-meeting-notes` | Raw meeting notes/transcript → structured summary with owners and due dates |
| `/pm-stakeholder-update` | Bullet points → polished status update (Slack + email/doc versions) |
| `/pm-competitive-brief` | Competitor name/URL → structured competitive brief |
| `/pm-user-research-synthesiser` | Interview/survey data → themed insight report |
| `/pm-voc-analyser` | Raw customer feedback → sentiment, themes, and priority matrix |
| `/pm-newsletter-creator` | Quarterly content → email-client-safe HTML newsletter |
| `/pm-release-announcement` | Release details → structured Slack release announcement |
| `/pm-presentation-creator` | Notes, a topic, or a PPTX → a polished, self-contained HTML slide deck |
| `/pm-folder-cleaner` | Scans a folder and proposes a clean re-organization (dry-run first, never deletes) |

## Why this exists

Most PM tooling advice stops at "use ChatGPT for your PRDs." These are the actual command definitions — the accumulated judgment calls (what to ask before drafting, what to flag rather than guess, exact output structure) that make the difference between a generic AI draft and something stakeholder-ready. Built and refined through real day-to-day use, then genericized for anyone to adapt.

Part of the [pm-ships-ai](../) series — **10 Years Rusty**.
