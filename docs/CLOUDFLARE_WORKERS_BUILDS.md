# Cloudflare Workers Builds Git Integration

## Role in AGENTROPOLIS AGENT MCP KIT

AGENTROPOLIS-AGENT-MCP is the MCP kit surface for routing, tool authority, validation, and receipt logging. Cloudflare Workers Builds should treat this repository as the deployment lane for the MCP homepage, API map, registry surface, and worker-compatible kit previews.

```text
wiredchaos/AGENTROPOLIS-AGENT-MCP
  -> GitHub MCP source
  -> Cloudflare Workers Builds
  -> MCP Worker / Pages deployment
  -> Agent tool interface surface
```

## Deployment Rule

Use GitHub as the source of truth. MCP-facing changes need a traceable commit path because tool execution surfaces require authority, validation, and audit discipline.

## Recommended Branch Map

| Branch | Cloudflare Target | Purpose |
| --- | --- | --- |
| `main` | Production MCP surface | Stable MCP kit deployment |
| `develop` | Staging MCP surface | Integration testing |
| `feature/*` | Preview | Pull request previews for routing and UI changes |

## Git Integration Setup

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Select the AGENTROPOLIS-AGENT-MCP Worker or Pages project.
4. Open **Settings** > **Builds**.
5. Under **Git Repository**, select **Manage**.
6. Connect GitHub and authorize access to `wiredchaos/AGENTROPOLIS-AGENT-MCP`.
7. Set production branch to `main`.
8. Enable pull request previews when available.

## MCP Deployment Pattern

```text
MCP change
  -> branch
  -> pull request
  -> Cloudflare preview
  -> routing / authority / validation review
  -> merge to main
  -> production deployment
  -> receipt log
```

## Guardrails

- Do not store API keys, private tokens, wallet secrets, or tool credentials in repository files.
- Use Cloudflare secrets for runtime configuration.
- Keep model routing, tool authority, and validation docs aligned with the deployed surface.
- Any execution-capable endpoint must remain behind policy gates, allowlists, spend caps, approval lanes, and audit logging.

## Canon Line

The MCP kit is not the brain. It is the governed tool interface layer behind Agentropolis authority.