# Agent Loop Engine

This document locks Loop Library style behavior into the AGENTROPOLIS MCP stack.

The point is not to make another prompt dump.

The point is to turn repeatable agent behaviors into governed loops with clear checks, memory, receipts, and stop conditions.

## Source Inspiration

Loop Library is a practical pattern library for agent prompts with explicit verification and stopping conditions.

AGENTROPOLIS should absorb the concept as an internal behavior layer, not as a separate product dependency.

```text
MCP tools provide capabilities.
Skills provide expertise.
Loops provide repeatable behavior.
Swarms provide coordination.
Receipts provide proof.
Governance decides authority.
```

## Placement

```text
AGENTROPOLIS
  -> HERMES CITY runtime and orchestration
  -> AGENTROPOLIS AGENT MCP capability registry
  -> Agent Loop Engine behavior layer
  -> Ontology and memory layer
  -> UI, districts, and operator console
```

The Agent Loop Engine belongs inside `AGENTROPOLIS-AGENT-MCP` because it governs how MCP tools are used over time.

## Core Loop Shape

Every loop must define:

- `name`
- `purpose`
- `trigger`
- `inputs`
- `allowed_tools`
- `authority_level`
- `memory_scope`
- `verification_checks`
- `stopping_conditions`
- `receipt_shape`
- `escalation_path`

## Standard Execution Pattern

```text
Operator request or scheduled trigger
  -> classify task
  -> select loop
  -> score risk
  -> check tool authority
  -> execute bounded step
  -> verify output
  -> update memory if allowed
  -> log receipt
  -> stop, continue, or escalate
```

No loop should run forever.

No loop should silently upgrade its own authority.

No loop should write, send, buy, delete, transfer, publish, or deploy unless its authority level explicitly permits that action.

## Authority Levels

```text
READ_ONLY
  Inspect, summarize, compare, search, or report.

DRAFT_ONLY
  Prepare artifacts, drafts, patches, or plans without submission.

ASSISTED_ACTION
  Execute only after explicit operator approval.

BOUNDED_AUTOMATION
  Execute inside predefined limits, log receipts, and stop on drift.

HIGH_RISK_MANUAL
  Do not execute. Return a human decision brief.
```

## Required Stop Conditions

Each loop needs at least one finite stopping rule.

Valid stop conditions include:

- objective completed
- validation failed
- permission missing
- cost limit reached
- time limit reached
- iteration limit reached
- conflicting facts detected
- external dependency unavailable
- human approval required
- risk score crossed threshold

## Loop Registry Draft

| Loop | Lane | Default Authority | Purpose |
| --- | --- | --- | --- |
| Repo Guardian Loop | Engineering | DRAFT_ONLY | Inspect repos, find stale docs, propose patches, and log maintenance receipts. |
| Documentation Sweep Loop | Engineering | DRAFT_ONLY | Keep docs aligned across AGENTROPOLIS repos without overwriting canon. |
| Security Audit Loop | Engineering | READ_ONLY | Review exposed secrets, risky permissions, dependency drift, and unsafe defaults. |
| Creator Asset Pipeline Loop | Content | DRAFT_ONLY | Validate character sheets, prop sheets, prompt packs, and continuity manifests. |
| BoardForge Asset Loop | Games | DRAFT_ONLY | Check game asset readiness, naming, metadata, and world handoff requirements. |
| NFT Collection Audit Loop | Operations | READ_ONLY | Review marketplace, trait, collection, and claim data without wallet connection. |
| Wallet Risk Loop | Finance | READ_ONLY | Detect unsafe wallet patterns and return guidance without custody or signatures. |
| Treasury Monitor Loop | Finance | READ_ONLY | Watch balances, flows, risks, and anomalies, then request approval for actions. |
| Terra54 Property Discovery Loop | Operations | READ_ONLY | Search property candidates, score fit, and prepare human review packets. |
| Legal Intake Loop | Operations | DRAFT_ONLY | Collect client facts, missing documents, issue lists, and draft next-step checklists. |
| Tax Document Loop | Operations | DRAFT_ONLY | Organize source docs, detect gaps, and create preparer-ready questions. |
| Creator Content Loop | Content | DRAFT_ONLY | Turn source notes into posts, scripts, prompts, and publishing drafts. |

## Loop Contract Example

```json
{
  "name": "repo_guardian_loop",
  "purpose": "Keep AGENTROPOLIS repositories coherent without making uncontrolled changes.",
  "trigger": "operator_request_or_scheduled_scan",
  "inputs": ["repository", "scope", "risk_limit"],
  "allowed_tools": ["github_search", "github_fetch_file", "github_create_file", "github_update_file"],
  "authority_level": "DRAFT_ONLY",
  "memory_scope": "repo_docs_and_project_canon",
  "verification_checks": [
    "confirm target repository",
    "check for existing similar files",
    "preserve canon locks",
    "summarize changed paths"
  ],
  "stopping_conditions": [
    "patch drafted",
    "conflict detected",
    "missing permission",
    "human approval required"
  ],
  "receipt_shape": {
    "workflow": "repo_guardian_loop",
    "repo": "selected_repository",
    "changed_paths": [],
    "authority_level": "DRAFT_ONLY",
    "validated": true,
    "receipt_logged": true
  },
  "escalation_path": "operator_review"
}
```

## Anti-Moloch Rules

The loop engine exists to keep agents useful without turning them loose.

Hard rules:

- Small bounded steps beat giant vague tasks.
- Receipts beat vibes.
- Explicit stop conditions beat infinite autonomy.
- Human approval beats hidden escalation.
- Read-only adapters beat wallet connections when custody is not required.
- Canon locks beat speed when projects can bleed into each other.

## Implementation Notes

The first implementation should be simple:

1. Store loop definitions as JSON or YAML inside `loops/`.
2. Add a loop loader to MCP registry startup.
3. Attach each loop to allowed MCP tools and authority levels.
4. Require validation checks before any action.
5. Emit a receipt after every loop run.
6. Add a console view later for loop status, last run, risk state, and receipts.

## Non-Goals

This is not a wallet agent.

This is not a blank-check automation layer.

This is not a separate AGENTROPOLIS product.

This is not a replacement for HERMES CITY orchestration.

It is the repeatable behavior layer between operator intent and tool execution.
