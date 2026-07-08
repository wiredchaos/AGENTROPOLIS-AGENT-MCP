# Hermes x_search Intelligence Doctrine

_Last updated: 2026-07-07_

## Purpose

Hermes `x_search` is the AGENTROPOLIS live-social signal layer for X / Twitter intelligence.

Use it when the source of truth is current conversation on X: posts, profiles, threads, reactions, claims, community sentiment, and fast-moving narratives.

Use `web_search`, `web_extract`, official docs, GitHub, and primary sources when the source of truth is a website, documentation page, repository, release note, legal text, or long-form article.

**Rule:** X Search is signal. Web Search is verification. The grid should use both.

## Source reference

Hermes documentation: https://hermes-agent.nousresearch.com/docs/user-guide/features/x-search

Key facts from the Hermes docs:

- `x_search` lets the agent search X posts, profiles, and threads directly.
- It is backed by xAI's built-in `x_search` tool on the Responses API.
- It is preferred over `web_search` when the target is current X discussion, reactions, or claims.
- It registers when either SuperGrok / X Premium+ OAuth or `XAI_API_KEY` is available.
- When both OAuth and API key credentials are configured, OAuth is preferred at call time.
- Hermes can enable the tool through `hermes tools`.
- `degraded: true` means the answer came back without usable X citations under active filters and must be treated as unsourced.

## NEURO account posture

NEURO has X Premium+.

Preferred credential path:

```bash
hermes auth add xai-oauth
```

Then confirm the tool is visible and enabled:

```bash
hermes auth status
hermes tools
```

In `hermes tools`, enable:

```text
X (Twitter) Search
```

OAuth should be preferred for this stack because it can route usage against the X Premium+ / SuperGrok path instead of defaulting to paid API spend when both credentials exist.

## Operational use inside AGENTROPOLIS

### BWB - Barbed Wired Broadcast

Role: breaking-news and narrative pulse.

Use `x_search` for:

- fast AI / crypto / Web3 developments
- creator and founder commentary
- X-native breaking narratives
- quote-post momentum
- sentiment around active events

Verify with:

- official posts from project accounts
- GitHub releases
- docs pages
- reputable reporting

### CLEAR

Role: executive market intelligence.

Use `x_search` for:

- what builders, investors, founders, and analysts are saying now
- early market narratives before they harden into articles
- live reactions to company announcements

Verify with:

- SEC filings where applicable
- official company blogs
- primary documentation
- market data sources

### 33.3FM DOGECHAIN

Role: Dogecoin / Doginals community pulse.

Use `x_search` for:

- Dogecoin and Doginals conversation
- community sentiment
- project announcements
- holder reactions
- event chatter

Verify with:

- official Doginal Dogs channels
- marketplace pages
- explorer links
- direct announcements

### GMN / GetMoneyNews

Role: finance and macro signal desk.

Use `x_search` for:

- early social reaction to macro, crypto, and market headlines
- influential account commentary
- emerging ticker narratives

Verify with:

- exchange data
- company filings
- official economic releases
- primary market sources

### Chaos Builders Exchange

Role: startup, AI, and job-market intelligence.

Use `x_search` for:

- hiring signals
- founder announcements
- open-source project momentum
- tool launches
- hackathon and grant chatter

Verify with:

- company career pages
- repository activity
- official product docs
- funding or accelerator announcements

## Recommended watchlists

### House brands

```text
AGENTROPOLIS
HERMES-CITY
WIRED CHAOS
33.3FM
BoardForge
BWB
CLEAR
Chaos Builders Exchange
NEURA
FEN
VRG33589
589 MAGAZINE
```

### AI and agent infrastructure

```text
Hermes Agent
Nous Research
OpenAI
Anthropic
xAI
Grok
Claude Code
DeepSeek
MCP
Model Context Protocol
Codex
GitHub Copilot
Lovable
Replit
```

### Crypto and culture lanes

```text
Dogecoin
Doginals
Doginal Dogs
XRP
XRPL
Solana
BONK
Bitcoin
Base
```

## Safe query patterns

Broad signal scan:

```text
What are people on X saying about Hermes Agent x_search today?
```

Handle-limited scan:

```text
Search X for recent Hermes Agent updates from @NousResearch.
```

Narrative scan:

```text
Search X for current discussion around Doginals and summarize the main narratives with citations.
```

Market reaction scan:

```text
Search X for reactions to the latest xAI / Grok release. Separate confirmed facts from speculation.
```

## Guardrails

1. Do not treat unsourced `x_search` output as fact.
2. If `degraded: true`, label the result as unsourced and verify elsewhere.
3. Do not publish claims from X without checking the originating post and at least one stronger source when money, legal, medical, security, or reputation risk is involved.
4. Prefer handle filters for official-account checks.
5. Widen date windows when results come back empty.
6. Strip `@` from handles when passing handle filters.
7. Never commit OAuth tokens, API keys, `.env` files, session files, or browser auth material.

## Local config reference

Hermes docs show an optional config shape like:

```yaml
x_search:
  model: grok-4.20-reasoning
  timeout_seconds: 180
  retries: 2
```

Do not assume the model name is permanent. Check current Hermes and xAI docs before locking production defaults.

## AGENTROPOLIS doctrine

X Search turns Hermes into a live antenna.

But antennas catch noise too.

The Intelligence Grid should ingest X for speed, then route claims through verification before they become doctrine, product copy, investor language, or public posts.

**Signal first. Source second. Canon only after verification.**
