import json
import os

import anthropic

MODEL = "claude-sonnet-5"

INTERVIEWER_SYSTEM_PROMPT = """You are a requirements analyst helping a product manager scope a \
feature before a PRD gets written. You'll receive a rough product idea, and optionally a discovery \
brief with market research context.

Ask 3-5 SHARP clarifying questions — the highest-leverage gaps that would change what gets built if \
answered differently. Focus on: problem clarity, target users, success metrics, scope boundaries, \
and key constraints. Do not ask generic questions a competent PM could already answer from the idea \
or brief provided. Do not ask more than 5 questions — pick the ones that matter most.

Respond with ONLY a JSON array of question strings, nothing else, no markdown fences. Example:
["Who is the primary user — an admin or an end user?", "What does success look like in 90 days?"]
"""

DRAFTER_SYSTEM_PROMPT = """You are an expert PRD writer. You'll receive a rough product idea, \
optionally a discovery brief, and a set of clarifying question-answer pairs. Write a complete, \
structured PRD using exactly these sections in this order:

## Problem Statement
## Goals & Success Metrics
## User Personas
## User Stories
## Scope
## Dependencies & Risks
## Open Questions

Use the question-answer pairs as your primary source of truth — don't contradict an explicit answer. \
Where the user's answer was vague, incomplete, or a question went unanswered, do not quietly invent \
specifics to fill the gap.

At the end of EVERY section, on its own line, add a completeness tag using EXACTLY the literal text \
[READY] or [NEEDS INPUT] — square brackets included, nothing else inside them. [READY] means this \
section has enough real, specific input behind it. [NEEDS INPUT] means a human still needs to make a \
decision or provide a detail before this section is solid. Never mark a section [READY] just because \
it has a lot of words — mark it [READY] only if the content is genuinely well-founded.
"""


def _client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key."
        )
    return anthropic.Anthropic(api_key=api_key)


def _extract_text(response) -> str:
    text_block = next(block for block in response.content if block.type == "text")
    raw = text_block.text.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw
        if raw.lower().startswith("json"):
            raw = raw.split("\n", 1)[1]
    return raw.strip()


def get_questions(idea: str, discovery_brief: str) -> list:
    user_content = f"IDEA:\n{idea}"
    if discovery_brief.strip():
        user_content += f"\n\nDISCOVERY BRIEF:\n{discovery_brief}"

    response = _client().messages.create(
        model=MODEL,
        max_tokens=500,
        system=INTERVIEWER_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )

    return json.loads(_extract_text(response))


def draft_prd(idea: str, discovery_brief: str, qa_pairs: list) -> str:
    qa_text = "\n".join(f"Q: {qa['question']}\nA: {qa['answer'] or '[not answered]'}" for qa in qa_pairs)

    user_content = f"IDEA:\n{idea}"
    if discovery_brief.strip():
        user_content += f"\n\nDISCOVERY BRIEF:\n{discovery_brief}"
    user_content += f"\n\nCLARIFYING Q&A:\n{qa_text}"

    response = _client().messages.create(
        model=MODEL,
        max_tokens=2500,
        system=DRAFTER_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )

    return _extract_text(response)
