import os
from concurrent.futures import ThreadPoolExecutor

import anthropic

MODEL = "claude-sonnet-5"

CRITIC_PROMPTS = {
    "engineering": (
        "🔧 Engineering",
        """You are a skeptical senior engineering lead reviewing a PRD before committing to build it. \
Find: unstated technical assumptions, missing edge cases, feasibility risks, and acceptance criteria \
that sound testable but actually aren't. Flag anything that reads simple but is likely much harder \
than it looks. Cite the exact section you're challenging for every point — never a vague generic \
complaint. Limit yourself to the 5-8 issues that matter most, not an exhaustive audit. Format as a \
bullet list, each bullet starting with the PRD section name in bold.""",
    ),
    "design": (
        "🎨 Design",
        """You are a skeptical senior product designer reviewing a PRD before committing to design it. \
Find: unclear or missing user flows, edge-case UI states the PRD never addresses (empty, error, \
permission-denied, loading), accessibility gaps, and places where the PRD states WHAT but leaves too \
little for you to design the actual experience confidently. Cite the exact section for every point. \
Limit yourself to the 5-8 issues that matter most. Format as a bullet list, each bullet starting with \
the PRD section name in bold.""",
    ),
    "exec": (
        "💼 Exec",
        """You are a skeptical VP reviewing a PRD before approving budget and headcount for it. Find: \
weak or missing success metrics, an unclear business case (why this, why now, why not something \
else), unstated costs or risks, and any goal that sounds good but isn't actually measurable. Cite the \
exact section for every point. Limit yourself to the 5-8 issues that matter most. Format as a bullet \
list, each bullet starting with the PRD section name in bold.""",
    ),
}

SYNTHESIS_SYSTEM_PROMPT = """You are a senior PM synthesizing three independent critiques of a PRD — \
from an engineering lead, a designer, and an exec — into ONE prioritized action list. Don't just \
concatenate them. Find overlaps where multiple critics are flagging the same underlying gap from \
different angles, and merge those into a single, sharper point. Rank everything by how much it would \
change the outcome if fixed.

Structure your response using exactly these three sections:

## Must Fix Before This Ships
## Worth Addressing
## Nice to Have

For every item, note which critic(s) raised it in parentheses, e.g. "(Engineering, Exec)". Keep the \
total list tight — the whole point is that this is more useful than reading all three critiques \
separately, not a longer version of them.
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
    return text_block.text.strip()


def _run_critic(key: str, prd_text: str) -> tuple:
    label, system_prompt = CRITIC_PROMPTS[key]
    response = _client().messages.create(
        model=MODEL,
        max_tokens=900,
        system=system_prompt,
        messages=[{"role": "user", "content": f"PRD:\n\n{prd_text}"}],
    )
    return key, label, _extract_text(response)


def red_team(prd_text: str) -> dict:
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(_run_critic, key, prd_text) for key in CRITIC_PROMPTS]
        results = [f.result() for f in futures]

    critiques = {key: {"label": label, "text": text} for key, label, text in results}

    combined = "\n\n".join(
        f"### {critiques[key]['label']} critique\n{critiques[key]['text']}" for key in CRITIC_PROMPTS
    )

    synthesis_response = _client().messages.create(
        model=MODEL,
        max_tokens=1500,
        system=SYNTHESIS_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": f"PRD:\n\n{prd_text}\n\nCRITIQUES:\n\n{combined}"}],
    )

    return {"critiques": critiques, "synthesis": _extract_text(synthesis_response)}
