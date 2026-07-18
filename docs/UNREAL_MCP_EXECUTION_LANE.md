# Unreal MCP Governed Execution Lane

## Role

`AGENTROPOLIS-AGENT-MCP` owns the capability registration, authority check, execution envelope, validation contract and receipt format for Unreal MCP.

Unreal MCP is an adapter behind the membrane. It is not the policy authority, model router, city OS, district or source of publishing permission.

Canonical city contract:

`wiredchaos/agentropolis/docs/UNREAL_MCP_CITY_INTEGRATION.md`

## Default state

```text
adapter: unreal-engine
status: DISABLED_BY_DEFAULT
network: LOOPBACK_ONLY
endpoint: http://127.0.0.1:8000/mcp
mutation: DENIED until explicitly approved
receipt_required: true
```

## Registration sequence

```text
Mission Control mandate
  -> classify task
  -> score risk
  -> select model lane
  -> discover live Unreal toolsets
  -> compare capabilities with policy
  -> issue bounded execution packet
  -> execute one editor operation
  -> validate result
  -> record receipt
```

The live tool schema is authoritative. Agents must use the Unreal discovery walk:

```text
list_toolsets
  -> describe_toolset
  -> call_tool
```

Do not guess tool names or arguments from memory.

## Capability policy

| Capability | Default | Minimum authority |
| --- | --- | --- |
| Inspect projects, maps, actors and assets | deny | approved project + READ |
| Capture editor screenshots | deny | approved project + READ |
| Create temporary preview actors | deny | isolated project + DRAFT |
| Modify actors, Blueprints or materials | deny | bounded roots + MODIFY + review |
| Run PIE or automation tests | deny | SIMULATE + test scope |
| Save packages | deny | explicit package roots + MODIFY |
| Render cinematics | deny | RENDER + output destination |
| Export assets or builds | deny | EXPORT + rights + human approval |

Connectivity never grants capability authority.

## Serialized call rule

Never issue overlapping Unreal MCP operations. The editor executes calls on the game thread.

```text
inspect
  -> one call
  -> read result
  -> verify
  -> save when approved
  -> receipt
  -> next call
```

A server-side programmatic script may batch homogeneous work only when the approved tool schema supports it and the entire batch remains inside one bounded operation.

## Execution packet

```json
{
  "request_id": "uuid",
  "mandate_id": "uuid",
  "adapter": "unreal-engine",
  "project": "approved-project-id",
  "map": "/Game/Maps/ApprovedMap",
  "operation_class": "READ | DRAFT | MODIFY | SIMULATE | RENDER | EXPORT",
  "toolset": "fully-qualified-live-toolset",
  "tool": "short-live-tool-name",
  "allowed_asset_roots": [],
  "allowed_write_roots": [],
  "denied_capabilities": [],
  "risk_tier": "LOW | MEDIUM | HIGH | CRITICAL",
  "approval_state": "DRAFT_ONLY | REVIEW_REQUIRED | APPROVED",
  "rights_record": "reference-or-null",
  "validation_plan": [],
  "receipt_required": true
}
```

Reject the request when a material field is missing. Do not invent project identity, rights, write roots, destructive authority, output destinations or approval state.

## Kill conditions

Halt execution when:

- the project, map or package root differs from the approved packet
- the live toolset exposes capabilities beyond the registered policy
- a requested write escapes its allowed root
- an operation is destructive without explicit authority
- rights are missing or prohibited
- the server is reachable beyond loopback
- the tool returns ambiguous or inconsistent state
- structural or visual verification fails
- receipt generation fails
- a higher-priority mandate revokes authority

No model or agent may self-authorize around a kill condition.

## Verification

Every mutation must be checked in two ways:

1. **Structural verification** — re-read changed actors, properties, packages, Blueprints, materials or sequences.
2. **Visual verification** — capture and review a screenshot or render when composition or appearance changed.

A protocol-level success response is not proof that the requested state exists.

## Receipt

```json
{
  "receipt_id": "uuid",
  "request_id": "uuid",
  "mandate_id": "uuid",
  "adapter": "unreal-engine",
  "tool_version": "recorded-version",
  "live_toolset": "qualified-name",
  "tool": "short-name",
  "project": "approved-project-id",
  "operations": [],
  "changed_packages": [],
  "validation_results": [],
  "evidence": [],
  "warnings": [],
  "approval_state": "PENDING | APPROVED | REJECTED",
  "started_at": "iso-8601",
  "completed_at": "iso-8601"
}
```

Receipts prove what happened. They do not retroactively create authority.

## Installation reference

```bash
hermes skills install official/creative/unreal-mcp
hermes mcp install unreal-engine
```

The Unreal Editor, Unreal MCP plugin and AllToolsets plugin must be running before Hermes starts its session. Installation is registration only. Production mutation remains disabled until policy, environment and approval checks pass.

## Canon lock

```text
Backends are replaceable.
Tool schemas are discovered live.
Skills remain bounded.
Authority is checked before execution.
Every material action leaves a receipt.
```
