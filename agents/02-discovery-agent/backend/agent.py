import os

import anthropic

MODEL = "claude-sonnet-5"

SYSTEM_PROMPT = """You are a discovery research assistant for a product manager. You'll be given a \
rough product idea, feature, or question. Use web search to actually research it — don't rely on \
what you already know if it can be checked.

Respond with ONLY the brief itself — no preamble, no "here's what I found," no commentary about your \
research process. The very first characters of your response must be "## Market Context".

Always include these three sections, in this order, as your baseline:

## Market Context
2-4 sentences on the relevant market/category and why it matters right now.

## Existing Solutions
Bullet list of relevant existing products, competitors, or approaches you found. One line each.

## Key Risks & Open Questions
Bullet list of the biggest risks, unknowns, or things worth validating before building.

Use your judgment on depth: a narrow, well-scoped question can stay to just these three sections. \
A broad or strategically meaty topic deserves more — add extra sections where they'd genuinely help \
(e.g. "## Target Users", "## Pricing Signals", "## Technical Feasibility Notes", "## Regulatory \
Considerations"), placed after Existing Solutions and before Key Risks & Open Questions. Only add a \
section if it earns its place with real content — don't pad for the sake of looking thorough.

Tag every non-obvious factual claim inline using EXACTLY this literal format, square brackets \
included: [VERIFIED] or [ASSUMPTION] — nothing else inside the brackets, and never drop the \
brackets. For example, write it exactly like this:
"Fyle extracts receipt data from an email in under 2 seconds. [VERIFIED]"
"A standalone extension will likely struggle against bundled incumbents. [ASSUMPTION]"
Never write [VERIFIED, source-6] or [VERIFIED — but methodology varies], and never write the word \
VERIFIED or ASSUMPTION without the square brackets around it. If you want to add nuance or a \
caveat, put it in the surrounding sentence — the tag itself must always be exactly [VERIFIED] or \
exactly [ASSUMPTION], nothing more.

[VERIFIED] means you found this in your search results. [ASSUMPTION] means it's your own reasoning, \
not confirmed by search. Do not present an assumption as if it were a verified fact. If your search \
turned up nothing useful for a section, say so plainly rather than filling it with generic filler.

Keep it tight — this is a first-pass discovery brief, not an exhaustive report.
"""


def _client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key."
        )
    return anthropic.Anthropic(api_key=api_key)


def research(topic: str) -> dict:
    response = _client().messages.create(
        model=MODEL,
        max_tokens=2500,
        system=SYSTEM_PROMPT,
        tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 5}],
        messages=[{"role": "user", "content": topic}],
    )

    brief_parts = []
    sources = []
    seen_urls = set()

    for block in response.content:
        if block.type == "text":
            brief_parts.append(block.text)
        elif block.type == "web_search_tool_result":
            content = block.content
            if isinstance(content, list):
                for result in content:
                    url = getattr(result, "url", None) or (
                        result.get("url") if isinstance(result, dict) else None
                    )
                    title = getattr(result, "title", None) or (
                        result.get("title") if isinstance(result, dict) else None
                    )
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        sources.append({"title": title or url, "url": url})

    brief = "".join(brief_parts).strip()
    header_index = brief.find("## Market Context")
    if header_index > 0:
        brief = brief[header_index:]

    return {"brief": brief, "sources": sources}
