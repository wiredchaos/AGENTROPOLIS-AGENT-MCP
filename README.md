# AGENTROPOLIS AGENT MCP KIT

Animated static homepage for the Agentropolis MCP Agent Kit.

## Open locally

```bash
open index.html
```

## GitHub Pages

Enable Pages from the repository settings and serve from the `main` branch root.

## What this is

A cinematic command-atrium style homepage for the Agentropolis MCP Agent Kit: MCP registry, cross-chain API map, Hermes router, NemoClaw builder layer, Nemotron research council, wallet execution guardrails, and security-first agent infrastructure.

## Model Council Routing

The MCP kit now includes a provider-aware routing map for selecting the right model lane before tool execution.

See [`docs/MODEL_COUNCIL_ROUTING.md`](docs/MODEL_COUNCIL_ROUTING.md).

Core pattern:

```text
MCP request
  -> classify task
  -> score risk
  -> select model lane
  -> check tool authority
  -> execute
  -> validate output
  -> log receipt
```

## Reference Lock Pipeline

The MCP kit now includes a reference-lock pipeline for reading, validating, routing, and logging AGENTROPOLIS-CREATOR character sheets, prop sheets, environment sheets, shot prompt packs, continuity reports, and handoff manifests.

See [`docs/REFERENCE_LOCK_MCP_PIPELINE.md`](docs/REFERENCE_LOCK_MCP_PIPELINE.md).

Core pattern:

```text
Creator package
  -> MCP intake
  -> schema validation
  -> risk classification
  -> tool authority check
  -> generation or review action
  -> output validation
  -> receipt log
```

## No-Claude MCP Bootstrap

This kit is not bound to Claude, Spawn, or any single provider-specific wrapper.

Use the WSL bootstrap lane for Windows development and keep MCP routing provider-agnostic:

- Bootstrap guide: [`docs/NO_CLAUDE_MCP_BOOTSTRAP.md`](docs/NO_CLAUDE_MCP_BOOTSTRAP.md)
- HERMES Dispatch selects the work lane.
- Model Council Routing selects the model lane.
- MCP Registry selects tool access.
- Policy Gate checks authority.
- Receipt logs preserve auditability.
