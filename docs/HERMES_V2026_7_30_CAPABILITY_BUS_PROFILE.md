# Hermes v2026.7.30 Capability Bus Profile

**Runtime:** `NousResearch/hermes-agent@v2026.7.30`  
**Status:** CANARY  
**Authority mode:** DEFAULT DENY

## Purpose

This profile defines how Hermes reaches Agentropolis tools. Hermes is a caller and coordinator. `AGENTROPOLIS-AGENT-MCP` remains the governed capability bus.

## Required request envelope

Every Hermes tool request must carry or resolve:

```json
{
  "runtime": "hermes-agent",
  "runtime_version": "v2026.7.30",
  "agent_id": "required",
  "session_id": "required",
  "mandate_id": "required",
  "capability_id": "required",
  "risk_tier": "required",
  "budget_scope": "required",
  "human_approval": "required-when-policy-demands",
  "receipt_id": "allocated-before-execution"
}
```

## Enforcement

1. MCP discovery exposes descriptions, never implicit permission.
2. Tool availability is filtered by identity, mandate, district, environment, and risk tier.
3. Credentials are injected only after policy approval and never returned to Hermes output.
4. Tool arguments are validated against the approved schema and scope.
5. Consequential actions require preview, approval, or dual control as policy specifies.
6. Retries must preserve idempotency and receipt correlation.
7. Subagents inherit a narrower or equal authority set. They may not widen it.
8. Runtime, gateway, or provider failure must fail closed for authority-bearing actions.

## Canary tests

- MCP list returns approved tools only.
- Denied tool calls produce a denial receipt.
- Approved read operation produces an evidence-linked receipt.
- Approved write operation records exact arguments, policy decision, result, and rollback data.
- Cancelled and timed-out subagents lose delegated leases.
- Gateway restart does not duplicate a write.
- Redaction removes secrets from logs, traces, and final responses.

## Promotion condition

Promotion requires clean evidence for discovery, denial, execution, retry, cancellation, redaction, and rollback across at least one local and one remote Hermes runtime lane.