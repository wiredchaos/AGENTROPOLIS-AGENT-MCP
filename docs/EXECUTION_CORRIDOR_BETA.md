# AGENTROPOLIS Execution Corridor Beta

## Status

Beta architecture. Authorization only. Provider invocation remains disabled until the invocation boundary is separately promoted.

## Authority split

```text
District / application intent
  -> HERMES Dispatch
  -> AGENTROPOLIS-AGENT-MCP Execution Governor
  -> authorization receipt
  -> invocation boundary (separate layer)
  -> approved provider/runtime
  -> AGENTROPOLIS-OPS supervision
  -> completion/failure receipt
  -> HERMES-CITY projection
```

### HERMES

Owns orchestration, dispatch, task context, Bot Mode team coordination, and operator-facing workflow state.

HERMES does not self-authorize privileged execution.

### AGENTROPOLIS-AGENT-MCP

Owns the shared execution policy membrane and authorization receipts. It validates scoped capability handles, 54-T evidence, adapter/provider/egress attestations, budget ceilings, and human approvals.

Public MCP tools remain READ_ONLY. The execution corridor is a separate authenticated authority lane and must never be exposed through the anonymous public tool registry.

### AGENTROPOLIS-OPS

Owns runtime supervision, health, retries, circuit breakers, telemetry, incident response, and recovery after authorization.

### HERMES-CITY

Owns public-safe and operator-safe spatial projection of runtime state. It displays authorization, work, failure, recovery, and receipts but is not the sovereign authorization service.

## Beta invariants

- Authority is a runtime constraint, not a prompt.
- The public MCP remains read-only.
- Authorization and invocation are separate phases.
- Authorization receipts always record `invocation_performed: false`.
- Raw API keys, private keys, seed phrases, passwords, bearer tokens, and provider credentials are rejected from execution requests and capability handles.
- Execution requires a sealed capability handle.
- 54-T, provider, adapter, and egress evidence are mandatory by default.
- HIGH risk requires human approval.
- CRITICAL risk requires dual control by default.
- Provider, runtime, capability, and budget allowlists are explicit policy inputs.
- CREATOR, Gaming, Social, GTM, and every district consume the same governor contract instead of implementing sovereign local governors.

## Production beta gates

1. Unit tests for deterministic authorization and fail-closed behavior.
2. Worker dry-run passes.
3. Separate authenticated route added for authorization; public `/mcp` tool list remains read-only.
4. D1 authorization receipt schema added with hashes and no raw sensitive payload persistence.
5. HERMES integration uses capability handles, never raw provider secrets.
6. HERMES-CITY operator projection consumes receipt/state summaries only.
7. OPS receives execution lifecycle telemetry after invocation is introduced.
8. Invocation remains disabled until at least one provider adapter has 54-T + ASBE/BE evidence and an explicit beta allowlist.
9. Rollback disables the execution route without disabling the public read-only MCP.
10. Live provider spending is opt-in and requires an explicit beta budget ceiling.

## Beta sequence

```text
PREVIEW
  -> AUTHORIZATION_ONLY
  -> DRY_RUN_INVOCATION
  -> SINGLE_PROVIDER_CANARY
  -> MULTI_PROVIDER_BETA
  -> PRODUCTION
```

Do not skip directly from authorization-only to multi-provider live execution.
