# Cloudflare Production Deployment

## Workers Builds

1. Open **Workers & Pages** in Cloudflare.
2. Import `wiredchaos/AGENTROPOLIS-AGENT-MCP`.
3. Production branch: `main`.
4. Root directory: `/`.
5. Build command: `npm ci && npm run validate && npm test && npm run deploy:dry`.
6. Deploy command: `npm run deploy`.
7. Enable pull-request preview deployments.

`wrangler.jsonc` declares account-neutral Workers Static Assets and D1 bindings. Current Wrangler versions can provision D1 automatically when the binding has no database ID. Dashboard Git deployments retain the linkage even though the generated ID is not committed.

## Security defaults

```text
MCP_AUTH_MODE=public-read
PUBLIC_MCP_ENABLED=true
```

The public lane exposes five read-only tools. Request-body limits, host consistency, origin checks, fixed-window D1 rate limiting, schema validation, hashed receipts, and operator-only receipt inspection remain enabled.

Set the operator secret:

```bash
npx --yes wrangler@4.114.0 secret put MCP_API_TOKEN
```

To protect all MCP calls, change `MCP_AUTH_MODE` to `token` and redeploy.

## Smoke tests

```bash
curl --fail "$BASE_URL/health"
curl --fail "$BASE_URL/.well-known/mcp.json"
curl --fail "$BASE_URL/api/tools"
curl --fail -H 'content-type: application/json' -d '{"request":"Deploy an MCP Worker to Cloudflare"}' "$BASE_URL/api/route"
curl --fail -H 'content-type: application/json' -d '{"action":"delete production","dataSensitivity":"secret","externalImpact":"irreversible","destructiveAction":true}' "$BASE_URL/api/risk"
```

Expected risk decision: `BLOCKED` with `NO_AUTHORITY`.

MCP initialize:

```bash
curl --fail -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1"}}}' "$BASE_URL/mcp"
```

MCP tools list:

```bash
curl --fail -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' "$BASE_URL/mcp"
```

Operator receipts:

```bash
curl --fail -H "Authorization: Bearer $MCP_API_TOKEN" "$BASE_URL/api/receipts?limit=10"
```

## Custom domain

After deployment, add a custom domain under **Settings → Domains & Routes**. Add the final browser origin to `ALLOWED_ORIGINS` only when cross-origin browser clients need it. Normal MCP clients usually send no `Origin` header.

## Rollback

Use Cloudflare deployment history to roll back the Worker bundle. D1 migrations are forward-only. Do not delete receipt tables during an application rollback.
