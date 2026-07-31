# Nous Tool Gateway Capability Lane

This document classifies the Nous Tool Gateway as an optional managed capability corridor inside the AGENTROPOLIS MCP infrastructure layer.

## Canon Classification

| Field | Value |
| --- | --- |
| Layer | Infrastructure |
| Lane | External capability gateway |
| Status | Optional / governed |
| Authority | No independent authority |
| Execution scope | Approved provider and tool calls |
| Owner | AGENTROPOLIS-AGENT-MCP under Mission Control policy |
| Risk posture | Scoped credentials, bounded budgets, validation, receipts |

## Core Pattern

```text
Human Mission Control
  -> mandate
  -> CHAOS RANK / HERMES routing
  -> MCP Registry
  -> AEGIS Policy Gate
  -> Nous Tool Gateway adapter
  -> approved provider
  -> validation
  -> receipt
```

The adapter exposes capabilities. It does not decide whether an action is authorized.

## Capability Classes

- browser automation and page interaction
- web crawling, extraction, and ingestion
- media generation and multimodal inference
- live web search
- document and file processing
- bounded code execution
- database and API access
- custom MCP-style integrations

Named providers are replaceable backend implementations. Skills and policy contracts must not depend on a single vendor.

## Adapter Contract

Every provider adapter should declare:

```json
{
  "provider_id": "provider_slug",
  "capabilities": ["search"],
  "authority_ceiling": "READ_ONLY",
  "credential_scope": "provider_specific",
  "budget_limit_required": true,
  "destination_allowlist_required": true,
  "supports_dry_run": false,
  "supports_idempotency": false,
  "validation_required": true,
  "receipt_required": true
}
```

Missing declarations should fail closed.

## Authority Matrix

| Level | Permitted behavior |
| --- | --- |
| `READ_ONLY` | retrieve, inspect, crawl, search, summarize |
| `DRAFT_ONLY` | generate an artifact without submission |
| `ASSISTED_ACTION` | execute after explicit operator approval |
| `BOUNDED_AUTOMATION` | execute within approved budget, rate, domain, and destination limits |
| `HIGH_RISK_MANUAL` | stop and return a human digest |

Wallet actions, payments, destructive file operations, credential changes, public publishing, production deploys, and irreversible mutations must never inherit approval merely because the gateway can technically perform them.

## Routing Policy

```text
request
  -> classify task
  -> score risk
  -> select capability
  -> select provider
  -> verify provider health and quota
  -> verify authority ceiling
  -> verify credential scope
  -> verify budget and destination
  -> execute or stop
  -> validate
  -> log receipt
```

Never route model output directly into tool execution.

## Fallback Order

```text
managed Nous Tool Gateway
  -> BYOK direct provider adapter
  -> BYOH or self-hosted adapter
  -> local tool
  -> queued human review
```

Fallback may preserve availability. It may not silently widen authority or weaken controls.

## Security Controls

- provider-specific credentials
- no shared root credential across unrelated agents
- secrets stored outside Git-tracked files
- explicit budget caps
- rate limits and concurrency limits
- domain, repository, account, and destination allowlists
- read-only defaults
- dry-run where supported
- idempotency keys where supported
- output and side-effect validation
- emergency provider and gateway disable switches
- receipts for request, policy decision, provider, action, validation, and result

## Environment Placeholders

```text
NOUS_TOOL_GATEWAY_ENABLED=false
NOUS_TOOL_GATEWAY_BASE_URL=managed_outside_repo
NOUS_TOOL_GATEWAY_API_KEY=managed_outside_repo
NOUS_TOOL_GATEWAY_DEFAULT_AUTHORITY=READ_ONLY
NOUS_TOOL_GATEWAY_BUDGET_USD=0
NOUS_TOOL_GATEWAY_ALLOWED_PROVIDERS=
NOUS_TOOL_GATEWAY_ALLOWED_DOMAINS=
NOUS_TOOL_GATEWAY_RECEIPTS=required
```

## Receipt Extension

```json
{
  "workflow": "external_capability_gateway",
  "gateway": "nous_tool_gateway",
  "provider": "selected_by_policy",
  "capability": "selected_by_policy",
  "authority_level": "READ_ONLY",
  "credential_scope_verified": true,
  "budget_verified": true,
  "destination_verified": true,
  "provider_health_verified": true,
  "validated": true,
  "receipt_logged": true
}
```

## Decision Lock

The Nous Tool Gateway is an adapter corridor in the MCP capability bus.

It does not replace:

- Human Mission Control
- CHAOS RANK or HERMES routing
- MCP Registry
- AEGIS policy gates
- validation
- receipt production
- local or self-hosted capability lanes

Convenience does not equal authority.
