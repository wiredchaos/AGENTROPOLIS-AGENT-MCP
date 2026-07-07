# Agent Runtime Position

This document clarifies where the uploaded Agentropolis React runtime files fit inside the larger repo spine.

## Canon lock

The current React trio is not the entire Agentropolis operating system. It is the living runtime/interface layer that lets a surface feel populated, reactive, and agent-native.

- `agentropolis-core.tsx` is the client runtime SDK: shared types, agent events, realtime bus, brain adapter, browser harness, canvas snapshot helper, and seed demo agents.
- `agentropolis-provider.tsx` is the React state orchestration layer: provider, hooks, in-memory city state, FOMO state, agent spawning, speaking, emitting, and drop claiming.
- `agentropolis-stage.tsx` is a floating proof surface: the visible city overlay that proves the runtime works inside TV, social, or city experiences.

## Architectural meaning

Treat these files as the Agentropolis runtime shell, not the source of truth for the whole ecosystem.

Agentropolis should remain layered like this:

```text
AGENTROPOLIS
├── Canon and ontology
├── Rules and governance
├── Backend spine and MCP services
├── Agent runtime and interface layer
├── District modules
├── Application surfaces
├── Media networks
├── Finance, security, identity, and payments
└── Deployment and mobile clients
```

The runtime consumes the spine. It should not become the spine.

## Integration rules

1. Keep source-of-truth data outside the UI runtime whenever practical.
2. Let ontology and canon repos define districts, roles, schemas, and relationships.
3. Let backend/MCP services own persistence, event history, auth, identity, and cross-repo coordination.
4. Let district repos expose capabilities, skills, and data contracts.
5. Let application surfaces render, interact, and broadcast through the runtime layer.
6. Keep demo FOMO state, seed agents, and local-mode events clearly marked as scaffolding until wired to real services.

## Repository role

This repository should treat the runtime as an integration surface. It may consume the runtime, document how it plugs into the wider city, or provide contracts the runtime reads from, but it should not duplicate the entire Agentropolis architecture locally.

## Practical placement

The strongest home for the React runtime files is one of these lanes:

- `AGENTROPOLIS-CITY` for the city shell and living interface.
- `HERMES-CITY` for the known city-facing interface layer.
- A future `agent-runtime` package if the runtime becomes shared across many surfaces.

Other repos should reference the runtime through contracts and docs, not copy it blindly.

## Build note

When adding runtime support to a repo, wire it in this order:

1. Confirm the repo role in the spine.
2. Define what events, agents, drops, districts, or skills it exposes.
3. Connect those contracts to the backend/MCP layer.
4. Render them through the runtime/provider/stage layer.
5. Only then add surface-specific UI.

The city should feel alive, but the nervous system stays distributed.