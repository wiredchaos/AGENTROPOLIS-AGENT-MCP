# Hermes /steer MCP Control

`/steer` applies to the Agentropolis MCP Agent Kit as a live control primitive for active tool-routed work.

## Command Difference

```text
/interrupt
= stop the current work and start a new turn

/queue
= wait until the current work finishes

/steer
= keep working and inject new context into the current flow
```

## MCP Meaning

MCP workflows need more than start and stop controls.

`/steer` lets an operator guide an active tool lane while preserving current context, partial progress, and task state.

## MCP Pattern

```text
MCP request
  -> classify task
  -> score risk
  -> select model lane
  -> check tool authority
  -> execute active lane
  -> /steer injects new context
  -> re-check risk if scope changes
  -> validate output
  -> log receipt
```

## Example

```text
Build an MCP adapter spec with auth, schema validation, tests, and docs.

/steer Add rate limiting and denial receipts too.
```

Expected behavior:

```text
The active task continues.
The new requirement is folded into the next useful iteration.
Risk and authority are re-checked if the instruction changes scope.
```

## Authority Boundary

`/steer` should not bypass:

- HERMES Dispatch
- Model Council Routing
- MCP Registry authorization
- Policy Gate
- operator approval
- audit receipts

Core rule:

```text
Steer the active lane.
Do not bypass authority.
```
