# AGENTROPOLIS AGENT MCP KIT

The governed remote MCP capability membrane for the **Agentropolis Intelligence Grid**.

This repository deploys as one Cloudflare Worker serving a cyber-noir command surface, a stateless Streamable HTTP MCP endpoint, ten public read-only tools, D1 execution receipts, security events, rate limiting, operator-only receipt APIs, and the Agentropolis 3D Intelligence Observatory.

> Infrastructure becomes the terrain others must build on.

## Architecture

```text
HERMES / MCP client / Agentropolis 3D
  -> Cloudflare request guards
  -> authentication + rate limit
  -> MCP capability membrane
  -> bounded READ_ONLY tool
  -> D1 receipt
  -> structured response
  -> topology / thermodynamics / memory / skill visualization
```

## Agentropolis 3D + Intelligence Observatory

The GitHub Pages surface in `github-pages/3d/` is the integrated liquid-glass 3D city and HERMES docking terminal.

The city includes a selectable **Intelligence Observatory** structure and drawer with four governed views:

- district and infrastructure topology
- thermodynamics, entropy, drift, friction, and stability
- memory evolution, provenance, confidence, and contradictions
- skill development, verification gates, and citizenship readiness

The drawer calls the same deployed `/mcp` endpoint and displays the returned receipt ID. Before a Worker is connected, it renders a clearly labeled canonical preview. It shows **live** only when the response contains D1 receipt-backed observability.

The Observatory never exposes hidden chain-of-thought, private model state, bearer tokens, or raw secrets.

See [`docs/INTELLIGENCE_OBSERVATORY.md`](docs/INTELLIGENCE_OBSERVATORY.md).

## HERMES launcher

The repository includes a GitHub Pages installer surface in `github-pages/`.

It:

- checks the deployed Worker health and MCP manifest
- generates native Streamable HTTP HERMES configuration
- generates a Node-based command bridge fallback
- avoids the fragile local Python `mcp` import path
- preserves the read-only public authority ceiling
- embeds the MCP-backed Observatory inside the 3D city

After merging the launcher workflow and selecting **GitHub Actions** as the repository Pages source, the expected URL is:

```text
https://wiredchaos.github.io/AGENTROPOLIS-AGENT-MCP/
```

The 3D route is:

```text
https://wiredchaos.github.io/AGENTROPOLIS-AGENT-MCP/3d/
```

See [`docs/HERMES_REMOTE_MCP_INSTALL.md`](docs/HERMES_REMOTE_MCP_INSTALL.md).

## MCP tools

### Core capability membrane

- `route_front_desk`
- `list_agentropolis_districts`
- `assess_mcp_request_risk`
- `get_agentropolis_capability_map`
- `get_cloudflare_deployment_manifest`

### Intelligence Observatory

- `get_agentropolis_topology`
- `get_agentropolis_thermodynamics`
- `get_agentropolis_memory_evolution`
- `get_agentropolis_skill_development`
- `get_agentropolis_observatory_snapshot`

All ten public tools are read-only. No wallet signing, payment, publishing, permission mutation, settlement, destructive action, or autonomous self-promotion is registered.

## Endpoints

```text
GET  /                         command surface
GET  /health                   Worker and D1 health
GET  /.well-known/mcp.json     deployment manifest
POST /mcp                      Streamable HTTP MCP
GET  /api/tools                complete public tool registry
GET  /api/districts            district registry
GET  /api/observatory          governed observatory snapshot
POST /api/route                Front Desk routing
POST /api/risk                 risk assessment
GET  /api/receipts             operator-only receipts
GET  /api/receipts/:id         operator-only receipt
```

Observatory examples:

```text
GET /api/observatory?view=all
GET /api/observatory?view=topology
GET /api/observatory?view=thermodynamics
GET /api/observatory?view=memory_evolution
GET /api/observatory?view=skill_development
```

## Validate

```bash
npm ci
npm run validate
npm test
npm run deploy:dry
```

## Deploy

```bash
npm run deploy
```

Wrangler automatically provisions D1 because `wrangler.jsonc` declares the `DB` binding without an account-specific resource ID. The deploy command then applies `migrations/0001_core.sql`.

For Cloudflare Workers Builds, custom domains, secrets, smoke tests, and rollback, see [`docs/CLOUDFLARE_DEPLOYMENT.md`](docs/CLOUDFLARE_DEPLOYMENT.md).

## Operator token

```bash
npx --yes wrangler@4.114.0 secret put MCP_API_TOKEN
```

Operator receipt APIs always require this encrypted Worker secret. Set `MCP_AUTH_MODE` to `token` to protect the full MCP endpoint.

## Security invariants

- Authority is a runtime constraint, not a prompt.
- Public tools remain read-only.
- Raw request bodies and bearer tokens are not stored in receipts.
- Every successful tool call returns a receipt ID and persistence status.
- Browser-originated cross-site requests must pass the origin allowlist.
- High-impact actions require a separate authenticated execution corridor.
- Canonical preview data is never presented as live telemetry.
- Agent progression remains human governed; self-promotion is disabled.
