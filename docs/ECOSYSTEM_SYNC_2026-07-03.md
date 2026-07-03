# Agentropolis Ecosystem Sync — 2026-07-03

This note locks AGENTROPOLIS-AGENT-MCP into the four-repository Agentropolis system as the governed routing membrane.

## Canon hierarchy

```text
wiredchaos/agentropolis
  = private City OS, source of truth, governance, runtime, district law

wiredchaos/HERMES-CITY
  = public civic shell, safe signal layer, public coordination map

wiredchaos/AGENTROPOLIS-CREATOR
  = construction district and foundry for assets, skills, templates, MCP kits, scenes, media, and package candidates

wiredchaos/AGENTROPOLIS-AGENT-MCP
  = governed routing membrane for MCP tools, model council routing, reference-lock intake, validation, and receipts
```

## AGENT-MCP role

AGENTROPOLIS-AGENT-MCP governs tool-facing execution lanes for the ecosystem.

It should handle:

- MCP request intake
- task classification
- risk scoring
- model council routing metadata
- reference-lock intake from CREATOR
- tool authority checks
- policy gate enforcement
- validation before output adoption
- receipt logging
- handoff manifests for District Exchange and Agentropolis review

AGENT-MCP is not the brain. It is the membrane.

## Governed request flow

```text
Request / package / tool action
  -> MCP intake
  -> classify task
  -> score risk
  -> select model lane
  -> check tool authority
  -> enforce policy gate
  -> execute only if allowed
  -> validate output
  -> log receipt
  -> handoff to District Exchange or Agentropolis review
```

## Reference-lock intake

```text
CREATOR package
  -> reference lock
  -> metadata sidecar
  -> schema validation
  -> provenance check
  -> license check
  -> risk classification
  -> tool authority check
  -> receipt
  -> approved handoff only when complete
```

## Boundary rules

AGENT-MCP must not create permanent authority by default.

Tool access should be:

- scoped
- revocable
- logged
- policy-bound
- validated
- receipt-backed
- eligible for kill switch or manual reset controls

## Anti-Moloch rule

No agent receives unbounded tool authority. No wallet-capable action bypasses approval. No package enters city runtime without validation and receipts.

## One-line canon

AGENTROPOLIS-AGENT-MCP is the governed routing membrane between Agentropolis intent, CREATOR packages, model lanes, tools, and receipts.
