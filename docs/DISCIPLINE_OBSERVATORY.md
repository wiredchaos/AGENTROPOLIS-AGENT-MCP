# HERMES Execution Discipline Observatory

Read-only MCP observability surface for the HERMES Execution Discipline and Context
Governor doctrine.

- Canon: `docs/HERMES_EXECUTION_DISCIPLINE_AND_CONTEXT_GOVERNOR.md` (wiredchaos/agentropolis)
- Contracts: `execution-state.schema.json`, `context-budget.schema.json`,
  `verification-receipt.schema.json`, `thermodynamic-metrics.schema.json`,
  `optimization-profile.schema.json` (wiredchaos/agentropolis/contracts)
- Implementation: `src/discipline-observatory.js`, wired into `src/index.js` and
  `src/observatory-index.js`
- Tests: `tests/discipline-observatory.test.mjs`

## Safety posture

Every tool in this surface is **READ_ONLY**:

- `annotations.readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`
- No tool can write, publish, sign, pay, mutate permissions, mutate credentials,
  delete, deploy, or merge.
- Every response carries an `authority: "READ_ONLY"` metadata block.
- All calls flow through the existing MCP membrane: host/origin guard, body limit,
  rate limiting, and the same authentication mode as every other tool.

Explicitly **NO** tool is registered on this server (or added by this surface) for:

- Publishing or broadcasting external content
- Wallet signing or transaction submission
- Payments, transfers, or spend authorization
- Credential creation, mutation, or exposure
- Permission or role mutation
- Destructive filesystem operations
- Unrestricted shell or remote execution
- Production deployment or release promotion
- Merging pull requests
- Recursive self-modification or policy changes

## Truth-boundary rules

The observatory **never fabricates live telemetry**:

1. When live data is absent, responses return explicit `NOT_CONFIGURED` or
   `UNVERIFIED` states with `null` values — never invented numbers, never an
   implied `ONLINE` state.
2. `telemetryState` is `receipt-backed-observability` only when D1 execution
   receipts exist; otherwise it is `canonical-baseline`.
3. Caller-supplied budget overrides produce a labeled
   `CALLER_SUPPLIED_PROJECTION` — a projection, not live telemetry.
4. Unmeasured thermodynamic metrics are reported with `state: "UNKNOWN"` and
   `value: null`; no values are estimated.
5. Receipt validation fails closed: malformed receipts are `INVALID`; incomplete
   evidence returns `INDETERMINATE` with explicit uncertainty; only summary
   fields of a supplied receipt are ever returned — receipt bodies are never
   echoed back.
6. A fixed context-window number is never treated as universal. The effective
   budget is discovered from the runtime or explicitly supplied; otherwise the
   floor is `NOT_CONFIGURED`.

## Tool catalog

| Tool | Purpose | Key inputs |
|---|---|---|
| `get_context_floor_status` | Effective context budget via the canonical formula `runtime - system - tools - active - reserved - safety` with `GREEN`/`AMBER`/`RED`/`CRITICAL` states. | optional numeric overrides for the six budget components |
| `assess_context_pressure` | Context pressure classification and the overflow-protocol response (`freezeDispatch`, `checkpointRequired`, recommendation). | same optional overrides as the context floor |
| `get_execution_plan_status` | Execution-plan state: task class, plan verification, retry budget, canonical flow. | optional `task_id`, `plan_id` |
| `get_task_verification_status` | Verification state and the seven-item task-complete evidence checklist. | optional `task_id`, `plan_id` |
| `get_thermodynamic_metrics` | The ten canonical thermodynamic measurements; unmeasured metrics are `UNKNOWN`. | optional `task_id` |
| `list_approved_optimization_profiles` | Governed optimization profile registry (defaults to `APPROVED` profiles) plus the canonical optimization policy. | `model_family`, `approval_state`, `profile_class` filters |
| `validate_execution_receipt` | Fail-closed validation of a verification receipt against the canonical contract. | `receipt` (object, required) |
| `explain_task_blocker` | Reasoned blocker classification: `BLOCKED`, `AWAITING_APPROVAL`, `FAILED_SAFE`, `NONE_DETECTED`, `UNVERIFIED` — with explicit `uncertainty`. | optional `task_id`, `plan_id`, `evidence` |

All tool names are prefixed in the `tools/list`, `/api/tools`, and
`/.well-known/mcp.json` listings, which now expose 18 tools (5 base + 5
Intelligence Observatory + 8 Execution Discipline Observatory).

## Context health states

Thresholds are fractions of the runtime context limit:

- `GREEN` — effective budget > 50%: sufficient workspace for the approved task graph.
- `AMBER` — ≤ 50%: checkpoint and offload before further dispatch.
- `RED` — ≤ 25%: block execution until context is compacted, expanded, or partitioned.
- `CRITICAL` — ≤ 10% or negative: preserve state and restart from a clean governed checkpoint.

## Wiring

- `src/discipline-observatory.js` exports `DISCIPLINE_TOOLS`,
  `validateDisciplineArguments`, `buildDisciplineSnapshot`, and `isDisciplineTool`.
- `src/index.js` merges `DISCIPLINE_TOOLS` into its `ALL_TOOLS` so the base
  worker's `mcp()` path (host/origin guard, body limit, rate limit, auth) serves
  them, and dispatches them in `executeTool`.
- `src/observatory-index.js` (the deployed entry point) merges them into its
  `ALL_TOOLS`, intercepts their `tools/call` requests through `mcpGate`, validates
  with `validateDisciplineArguments`, and builds snapshots with the same D1
  receipt runtime used by the Intelligence Observatory. They appear in
  `tools/list`, `/api/tools`, and the extended manifest.
