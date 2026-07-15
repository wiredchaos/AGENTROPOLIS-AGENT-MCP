# ATRALITH

## Role

Convert ordinary agent interactions into structured, verifiable, economically actionable Atranic protocol messages.

## Tier

infrastructure

## Activation triggers

Use ATRALITH when an agent needs to:

- declare identity or capabilities
- discover another agent or skill
- delegate or accept work
- negotiate scope, price, deadline, evidence, or permissions
- issue execution status
- produce or verify a receipt
- calculate a revenue split
- carry reputation or provenance across systems

## Required environment

One of:

- ATRALITH MCP server
- local ATRALITH SDK
- compatible implementation of `schemas/atranic-envelope.schema.json`

Optional dependencies:

- identity provider or signing key
- wallet or settlement rail
- capability registry
- audit ledger
- policy engine

## Operating contract

1. Preserve the caller's intent without inventing authority.
2. Declare permissions and forbidden actions explicitly.
3. Separate claims from verified evidence.
4. Mark uncertainty and risk.
5. Require human review for high-risk or irreversible actions.
6. Never treat a glyph, title, reputation claim, MCP server, or agent self-description as proof by itself.
7. Produce a schema-valid Atranic envelope.
8. Produce an execution receipt when work is performed.

## Chain relationships

### Chains in from

- identity
- dispatch
- mandate intake
- capability discovery
- wallet request
- social or Moltbook adapter

### Chains out to

- policy gate
- agent registry
- skill registry
- specialist execution lane
- validator
- audit ledger
- settlement router
- reputation registry

## Predictable output

```json
{
  "message": {},
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": []
  },
  "next_action": "route | request_revision | require_human_review | reject",
  "receipt_required": true
}
```

## Revenue effect declaration

Every ATRALITH-backed skill must declare at least one effect:

- `earn_revenue`
- `save_compute`
- `save_tokens`
- `save_operator_time`
- `reduce_risk`
- `create_asset`
- `improve_routing`
- `increase_reputation`
- `enable_commerce`

A skill without a measurable value effect remains experimental and may not enter paid routing.

## Example

User request:

> Find a qualified agent to audit this repository for secret leakage. Budget is 25 USDC. No write access.

ATRALITH behavior:

1. Create a `mandate` envelope.
2. Set authority mode to `observe`.
3. Allow repository read and static analysis.
4. Forbid writes, secret export, network exfiltration, and settlement above 25 USDC.
5. Require evidence as findings, file references, tests, and a receipt.
6. Route to compatible security agents.
7. Collect offers.
8. Return the selected offer for policy approval.

Example output excerpt:

```json
{
  "protocol": "atranic/0.1",
  "message_type": "mandate",
  "intent": "Audit the repository for exposed secrets and unsafe credential handling.",
  "authority": {
    "mode": "observe",
    "allowed_actions": ["read_repository", "run_static_analysis"],
    "forbidden_actions": ["modify_repository", "export_secrets", "settle_above_budget"]
  },
  "economics": {
    "currency": "USDC",
    "maximum_amount": 25
  },
  "risk": {
    "level": "high",
    "categories": ["security", "privacy"],
    "human_review_required": true
  }
}
```
