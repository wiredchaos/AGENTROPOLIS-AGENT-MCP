# AGENTROPOLIS AGENT MCP KIT

The governed remote MCP capability membrane for the **Agentropolis Intelligence Grid**.

This repository deploys as one Cloudflare Worker serving a cyber-noir command surface, a stateless Streamable HTTP MCP endpoint, five public read-only tools, D1 execution receipts, security events, rate limiting, and operator-only receipt APIs.

> Infrastructure becomes the terrain others must build on.

## Architecture

```text
MCP client / browser
  -> Cloudflare request guards
  -> authentication + rate limit
  -> MCP capability membrane
  -> bounded READ_ONLY tool
  -> D1 receipt
  -> response
```

## MCP tools

- `route_front_desk`
- `list_agentropolis_districts`
- `assess_mcp_request_risk`
- `get_agentropolis_capability_map`
- `get_cloudflare_deployment_manifest`

No wallet signing, payment, publishing, permission mutation, settlement, or destructive tool is registered.

## Endpoints

```text
GET  /                         command surface
GET  /health                   Worker and D1 health
GET  /.well-known/mcp.json     deployment manifest
POST /mcp                      Streamable HTTP MCP
GET  /api/tools                public tool registry
GET  /api/districts            district registry
POST /api/route                Front Desk routing
POST /api/risk                 risk assessment
GET  /api/receipts             operator-only receipts
GET  /api/receipts/:id         operator-only receipt
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
