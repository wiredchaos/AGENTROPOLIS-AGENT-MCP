# Hermes Backend Routing Matrix

This document maps model rankings, search providers, extraction providers, and Hermes skills into a governed MCP routing pattern.

The point is not to hard-code one winner.

The point is to route by capability, risk, cost, latency, and approval level.

## Core Routing Pattern

```text
MCP request
  -> classify task
  -> score risk
  -> select model lane
  -> select backend lane
  -> check tool authority
  -> execute
  -> validate output
  -> log receipt
```

## Capability Lanes

### Model Lane

Used for reasoning, coding, planning, multimodal interpretation, extraction, summarization, or guardrail review.

Routing criteria:

- task class
- context length
- reasoning depth
- coding need
- multimodal need
- safety need
- local vs cloud requirement
- cost cap
- fallback availability

### Experimental Volume Provider Lane

Possible providers:

- NaraRouter
- OpenRouter free-tier routes
- Kimchi free-credit routes
- other dashboard-verified OpenAI-compatible gateways

NaraRouter is tracked as an optional OpenAI-compatible provider lane with operator-reported high daily free-token capacity.

See [`docs/NARAROUTER_PROVIDER_LANE.md`](NARAROUTER_PROVIDER_LANE.md).

Rules:

- dashboard-verify quota before use
- keep credentials outside the repo
- use only for low-risk, non-sensitive workloads until evaluated
- log receipt for model, quota, latency, quality, and failure notes

### Search Lane

Possible providers:

- Brave Search
- SearXNG
- DDGS
- Tavily
- Exa
- xAI / Grok when approved

### Extraction Lane

Possible providers:

- Firecrawl
- Tavily
- Exa
- Parallel

### Privacy Skill Lane

UNBROKER is an official Hermes security skill for data-broker removal workflows.

Install path:

```bash
hermes update
hermes skills install official/security/unbroker
```

## Authority Levels

```text
READ_ONLY
  Query, inspect, summarize, or compare.

DRAFT_ONLY
  Prepare output but do not submit.

ASSISTED_ACTION
  Execute after explicit operator approval.

BOUNDED_AUTOMATION
  Execute within pre-approved limits and log receipts.

HIGH_RISK_MANUAL
  Stop and return a human digest.
```

## Routing Rule

Never route directly from model output to tool execution.

Always pass through:

```text
Model Council -> MCP Registry -> Policy Gate -> Validation -> Receipt Log
```

## Backend Volatility Rule

Backends are replaceable.

If one provider fails, throttles, changes pricing, changes free quotas, loses quality, or changes terms, MCP should be able to select another lane without changing the skill contract.

## Receipt Shape

```json
{
  "workflow": "backend_routing_matrix",
  "task_class": "search_extract_or_skill",
  "model_lane": "selected_by_policy",
  "backend_lane": "selected_by_policy",
  "authority_level": "READ_ONLY",
  "validated": true,
  "receipt_logged": true
}
```

## NaraRouter Receipt Extension

```json
{
  "provider": "nararouter",
  "base_url": "router.bynara.id/v1",
  "quota_verified_in_dashboard": false,
  "approved_lanes": ["READ_ONLY", "DRAFT_ONLY"],
  "sensitive_data_allowed": false,
  "production_mutation_allowed": false
}
```