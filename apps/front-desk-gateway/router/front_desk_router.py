"""AGENTROPOLIS Front Desk district router.

Chain-neutral concierge routing for the Intelligence Grid.
This module does not execute wallet actions or transactions.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

District = Literal[
    "NEURA",
    "CHAOS CODE",
    "CHAOS RANK",
    "789 STUDIOS",
    "FEN",
    "NTRU",
    "CHAOSPHERE",
    "ECHO",
    "NEURO",
    "UNKNOWN",
]

SAFE_WARNING_TERMS = {
    "seed phrase",
    "private key",
    "verify now",
    "urgent",
    "support dm",
    "airdrop claim",
    "connect wallet now",
    "sign this transaction",
}

ROUTE_TERMS: dict[District, tuple[str, ...]] = {
    "NEURA": ("wallet", "tax", "trust", "finance", "client portal", "pay", "invoice", "legal"),
    "CHAOS CODE": ("repo", "github", "mcp", "agent", "runtime", "build", "api", "code"),
    "CHAOS RANK": ("seo", "rank", "distribution", "content intelligence", "publish", "growth"),
    "789 STUDIOS": ("media", "ott", "studio", "story", "production", "show", "broadcast"),
    "FEN": ("vault33", "vrg33589", "589", "xrpl", "xrp cafe", "fen"),
    "NTRU": ("privacy", "verify", "cryptography", "proof", "trust", "signature"),
    "CHAOSPHERE": ("game", "world", "simulation", "arena", "boardforge", "play"),
    "ECHO": ("lore", "canon", "akashic", "archive", "timeline", "story bible"),
    "NEURO": ("architecture", "orchestration", "pm", "project manager", "roadmap", "system map"),
}


@dataclass(frozen=True)
class RouteResult:
    district: District
    reason: str
    safety_flag: bool = False
    safety_note: str | None = None
    next_step: str = "Ask one clarifying question before routing deeper."


def detect_safety_flag(text: str) -> str | None:
    lowered = text.lower()
    for term in SAFE_WARNING_TERMS:
        if term in lowered:
            return term
    return None


def route_front_desk(user_text: str) -> RouteResult:
    """Route a user request to the most likely Agentropolis district.

    The Front Desk must stay chain-neutral and user-first. This router only
    recommends a destination and safety posture. It never executes actions.
    """

    text = user_text.lower().strip()
    safety_term = detect_safety_flag(text)

    best: tuple[District, int] = ("UNKNOWN", 0)
    for district, terms in ROUTE_TERMS.items():
        score = sum(1 for term in terms if term in text)
        if score > best[1]:
            best = (district, score)

    district = best[0]
    if district == "UNKNOWN":
        return RouteResult(
            district="UNKNOWN",
            reason="No strong district signal found.",
            safety_flag=bool(safety_term),
            safety_note=_safety_note(safety_term),
            next_step="Ask what the user is trying to do: build, protect, publish, file, watch, play, or explore.",
        )

    return RouteResult(
        district=district,
        reason=f"Matched user intent to {district} lane.",
        safety_flag=bool(safety_term),
        safety_note=_safety_note(safety_term),
        next_step=f"Explain why {district} fits, then offer one safe next action.",
    )


def _safety_note(term: str | None) -> str | None:
    if not term:
        return None
    return (
        f"Safety slowdown triggered by '{term}'. Never ask for seed phrases or private keys. "
        "Clarify whether the user is being asked for a message signature or a transaction signature."
    )


if __name__ == "__main__":
    samples = [
        "I need help with wallet safety before I sign something",
        "Update the GitHub repo and MCP runtime",
        "I want to publish a show on 789 Studios",
        "I am lost, guide me",
    ]
    for sample in samples:
        print(sample, "=>", route_front_desk(sample))
