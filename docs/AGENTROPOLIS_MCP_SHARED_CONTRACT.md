# Agentropolis MCP Shared Client Contract

One governed capability membrane. All browser clients and the HERMES Agent
resolve the same contract from the deployed Cloudflare Worker.

## Canonical schema

`config/agentropolis-mcp.contract.json` in this repository is the canonical
public contract. It is deliberately small and duplicated per client when
needed; there is no fragile cross-repository runtime dependency.

| Field | Meaning |
| --- | --- |
| `schema_version` | Contract schema version (`1.0.0`). |
| `service` | `agentropolis-agent-mcp`. |
| `base_url` | Deployed HTTPS Worker base URL. Operator-supplied; never committed. |
| `health_url` / `manifest_url` / `mcp_url` | Derived at runtime as `base_url + path`. |
| `health_path` / `manifest_path` / `endpoint_path` | `/health`, `/.well-known/mcp.json`, `/mcp`. |
| `transport` | `streamable-http`. |
| `authority` | `public-read` — the default public ceiling. |
| `write_default` | `deny` — write authority is not granted by this contract. |
| `human_approval_required` | `true` — consequential actions require human approval. |
| `clients` | `hermes-agent`, `hermes-city`, `agentropolis-mission-control`, `agentropolis-mcp-3d`. |

## Configuration priority (HERMES CITY)

1. Explicit deployment configuration (operator-deployed `mcp-config.json`).
2. Public browser-safe config file (`mcp-config.json`, committed with empty
   `baseUrl`).
3. Query-string bootstrap for testing (`?mcp=https://...`).
4. Local browser configuration fallback (`localStorage`, never credentials).
5. `NOT CONFIGURED` state.

## Configuration (Mission Control)

`VITE_AGENTROPOLIS_MCP_URL` is the build-time environment variable. It is
browser-visible and must contain only the public Worker base URL.

## Truth boundary

A client reports `ONLINE` only after both `/health` and
`/.well-known/mcp.json` respond successfully and the manifest parses. A
configured URL alone is never proof of connection. The deployed Worker
hostname is never fabricated: it is supplied by the operator with evidence.
