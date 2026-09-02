# PM Slash-Command Toolkit

15 Claude Code slash commands built for day-to-day product management work — PRDs, Jira tickets, Confluence pages, UAT test cases, stakeholder updates, competitive briefs, VOC analysis, meeting notes, newsletters, release announcements, presentations, and folder cleanup.

Each `.md` file in [`commands/`](commands) is a Claude Code custom command. Drop any of them into your own `.claude/commands/` folder and the corresponding `/command-name` becomes available in Claude Code.

## What's here

| Command | What it does |
|---|---|
| `/prd` | PRD writing standard — structure, tone, and what to flag |
| `/prd-writer` | Full PRD generator from a rough feature brief |
| `/jira-create` | Generates Epics/Stories/Bugs/Tasks ready to paste into Jira |
| `/jira-ticket-writer` | Plain-English feature/bug description → formatted Jira ticket |
| `/confluence` | Create, edit, search, and template Confluence pages |
| `/uat-cases` | Structured, testable UAT test cases from a feature description |
| `/meeting-notes` | Raw meeting notes/transcript → structured summary with owners and due dates |
| `/stakeholder-update` | Bullet points → polished status update (Slack + email/doc versions) |
| `/competitive-brief` | Competitor name/URL → structured competitive brief |
| `/user-research-synthesiser` | Interview/survey data → themed insight report |
| `/voc-analyser` | Raw customer feedback → sentiment, themes, and priority matrix |
| `/newsletter-creator` | Quarterly content → email-client-safe HTML newsletter |
| `/release-announcement` | Release details → structured Slack release announcement |
| `/presentation-creator` | Notes, a topic, or a PPTX → a polished, self-contained HTML slide deck |
| `/folder-cleaner` | Scans a folder and proposes a clean re-organization (dry-run first, never deletes) |

## Why this exists

Most PM tooling advice stops at "use ChatGPT for your PRDs." These are the actual command definitions — the accumulated judgment calls (what to ask before drafting, what to flag rather than guess, exact output structure) that make the difference between a generic AI draft and something stakeholder-ready. Built and refined through real day-to-day use, then genericized for anyone to adapt.

Part of the [pm-ships-ai](../) series — **10 Years Rusty**.
