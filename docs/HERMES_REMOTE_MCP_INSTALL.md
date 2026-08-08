# HERMES Remote MCP Install

This guide replaces the local Python stdio bridge with the deployed Agentropolis Cloudflare Worker.

## Why the screenshot fails

The current HERMES entry starts a local Python script. That script imports `mcp.server`, but the Python interpreter selected by HERMES does not have the `mcp` package installed. The server exits before the MCP handshake.

Do not repair this by scattering Python packages into an unknown interpreter. The repository already exposes a remote Streamable HTTP MCP endpoint at `/mcp`.

## Architecture

```text
GitHub Pages launcher
  -> generates HERMES configuration
  -> checks Worker health and manifest

HERMES Desktop
  -> remote MCP client
  -> POST https://<worker-domain>/mcp

Cloudflare Worker
  -> request guard
  -> read-only tool registry
  -> D1 execution receipt
```

GitHub Pages is the installer and configuration surface. It cannot host the MCP runtime because Pages is static hosting. The Worker remains the live server.

## Step 1: deploy the Worker

Use the Cloudflare Git deployment path in `docs/CLOUDFLARE_DEPLOYMENT.md` or run:

```bash
npm ci
npm run check
npm run deploy
```

Copy the resulting HTTPS Worker base URL.

## Step 2: verify the runtime

```powershell
$BaseUrl = "https://agentropolis-agent-mcp.YOUR-SUBDOMAIN.workers.dev"
Invoke-RestMethod "$BaseUrl/health"
Invoke-RestMethod "$BaseUrl/.well-known/mcp.json"
```

Expected conditions:

- `/health` reports `status: ok`
- the deployment manifest resolves
- `/api/tools` returns the bounded public tool registry

## Step 3: configure HERMES

### Preferred: native remote HTTP

Use `config/hermes-mcp.remote.example.json` and replace the placeholder domain.

```json
{
  "mcpServers": {
    "agentropolis-grid": {
      "url": "https://YOUR-WORKER.example/mcp",
      "transport": "streamable-http"
    }
  }
}
```

### Compatibility fallback: Node bridge

Use this only when the HERMES build accepts command-based stdio servers but not a native remote URL.

```json
{
  "mcpServers": {
    "agentropolis-grid": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://YOUR-WORKER.example/mcp"]
    }
  }
}
```

This lane requires Node and `npx`, but it does not require the local Python `mcp` package.

## Step 4: restart and test

1. Save `mcp.json` in HERMES.
2. Toggle `agentropolis-grid` off and back on, or restart HERMES Desktop.
3. Confirm the server becomes connected.
4. Confirm these tools appear:
   - `route_front_desk`
   - `list_agentropolis_districts`
   - `assess_mcp_request_risk`
   - `get_agentropolis_capability_map`
   - `get_cloudflare_deployment_manifest`
5. Call `list_agentropolis_districts` as the first canary test.

## Step 5: publish the launcher

The workflow `.github/workflows/github-pages.yml` deploys the `github-pages/` directory after it is merged to `main`.

In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The expected public URL is:

```text
https://wiredchaos.github.io/AGENTROPOLIS-AGENT-MCP/
```

## Authority boundary

The public MCP lane is read-only. It may route, inspect, list, map, and assess. It may not sign, pay, publish, delete, mutate permissions, or self-escalate. Discovery is not permission.
