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

## District Recruitment Swarm Tools

The MCP kit now defines callable recruitment capabilities for every Agentropolis district recruiter.

```text
SLM scout -> LLM closer -> ML intern -> register agent citizen
```

See [`docs/DISTRICT_RECRUITMENT_SWARM.md`](docs/DISTRICT_RECRUITMENT_SWARM.md).

Core MCP capabilities:

- `scan_recruitment_leads`
- `score_recruitment_lead`
- `draft_recruitment_outreach`
- `register_agent_citizen`

Recruiters can invite and onboard. Sensitive vault, wallet, settlement, or governance actions still require policy gates, verification, and receipts.

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

## Superagent Gateway Infrastructure Lane

Superagent Gateway is tracked as an optional model-routing gateway for coding agents that need one local endpoint across multiple providers.

See [`docs/infrastructure/gateways/superagent-gateway.md`](docs/infrastructure/gateways/superagent-gateway.md).

Canon lock: Superagent Gateway routes model calls. It does not replace MCP, Hermes, skills, memory, receipts, or AGENTROPOLIS governance.

```text
coding agent
  -> Superagent Gateway
  -> provider lane
  -> validation
  -> receipt
```

## NaraRouter Provider Lane

NaraRouter is tracked as an optional OpenAI-compatible provider lane for high-volume, low-risk model routing tests.

See [`docs/NARAROUTER_PROVIDER_LANE.md`](docs/NARAROUTER_PROVIDER_LANE.md).

Canon lock: operator-reported free capacity must be dashboard-verified before production use. NaraRouter starts as `experimental`, `READ_ONLY`, and `DRAFT_ONLY` until receipts prove otherwise.

## Hermes Backend Routing Matrix

The MCP kit now treats model rankings, search providers, extraction tools, and skill installs as capability lanes behind governance.

See [`docs/HERMES_BACKEND_ROUTING_MATRIX.md`](docs/HERMES_BACKEND_ROUTING_MATRIX.md).

Core pattern:

```text
MCP request
  -> classify task
  -> select model lane
  -> select backend lane
  -> check authority
  -> validate
  -> receipt
```

Backends are replaceable. Skills remain stable. Governance decides what can execute.

## UNBROKER Privacy Lane

UNBROKER is documented as a governed Hermes security skill lane for personal-data broker discovery, deletion requests, verification, receipts, and re-scans.

Install path:

```bash
hermes update
hermes skills install official/security/unbroker
```

See [`docs/UNBROKER_MCP_PRIVACY_LANE.md`](docs/UNBROKER_MCP_PRIVACY_LANE.md).

## GitLawb Zero MCP Execution Lane

GitLawb Zero is incorporated as an optional local coding execution lane.

It is a tool lane candidate, not the brain and not unrestricted authority.

See [`docs/GITLAWB_ZERO_MCP_EXECUTION_LANE.md`](docs/GITLAWB_ZERO_MCP_EXECUTION_LANE.md).

Core pattern:

```text
MCP request
  -> classify task
  -> score risk
  -> select model lane
  -> check tool authority
  -> route to GitLawb Zero if local coding is allowed
  -> generate patch candidate
  -> run validation
  -> log receipt
```

## ODS Local AI Server Lane

ODS is tracked as an optional local AI server lane for workstation, homelab, and private AI stack deployments.

It is infrastructure, not a district, not the brain, and not unrestricted authority.

See [`docs/ODS_LOCAL_AI_SERVER_LANE.md`](docs/ODS_LOCAL_AI_SERVER_LANE.md).

Core pattern:

```text
MCP request
  -> classify task
  -> policy gate
  -> route to ODS when local inference, RAG, workflow, voice, image, or agent services are approved
  -> validate
  -> receipt
```

## T3MP3ST Authorized Red Team Lane
