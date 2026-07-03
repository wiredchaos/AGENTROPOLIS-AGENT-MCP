# Agentropolis Agent MCP GitHub Update — 2026-07-03

## Repository Role

`wiredchaos/AGENTROPOLIS-AGENT-MCP` is the governed tool-routing and execution membrane for the Agentropolis ecosystem.

It exists to keep agents useful without letting tools become unrestricted authority.

## Current Position

The MCP kit is the boundary layer between intention and execution:

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

This repository should stay focused on routing, permissioning, backend selection, model lane selection, tool membranes, validation, and receipts.

## What This Repo Is Not

This is not the main Agentropolis runtime.
This is not the GTM layer.
This is not the 3D foundry.
This is not a loose collection of AI tools.

It is the governed execution interface.

## Priority Lanes

### Model Council Routing

Provider-aware routing that chooses the correct model lane before execution.

### Hermes Backend Routing Matrix

Backend selection across search providers, extraction tools, model rankings, skill installs, and execution candidates.

### UNBROKER Privacy Lane

A governed security skill lane for broker discovery, deletion requests, verification, receipts, and recurring scans.

### GitLawb Zero MCP Execution Lane

Optional local coding execution lane. Tool candidate only. Not the brain. Not unrestricted authority.

## Relationship to Other Repositories

```text
wiredchaos/agentropolis
  -> private City OS, canon, governance, and production runtime

wiredchaos/HERMES-CITY
  -> public civic shell and safe coordination layer

wiredchaos/AGENTROPOLIS-CREATOR
  -> foundry for skills, workflows, assets, scenes, and packages

wiredchaos/AGENTROPOLIS-GTM
  -> distribution strategy and public offer packaging

wiredchaos/AGENTROPOLIS-AGENT-MCP
  -> guarded model/tool/backend execution membrane
```

## Next Build Priorities

1. Keep every tool lane behind classification, risk scoring, authority checks, validation, and receipts.
2. Add a public-safe MCP architecture diagram.
3. Define standard MCP lane cards for privacy, coding, GTM, research, commerce, and wallet operations.
4. Add testable examples for read-only, simulation, approval-required, and blocked execution paths.
5. Keep private production keys, runtime configs, and wallet controls out of this repo.

## Canon Lock

Agentropolis does not sell dependence on one model, one provider, or one tool.

Agentropolis sells governed routing across models, backends, skills, workflows, and approval gates.
