# Hermes Remote Control Room + Backend Context Engineering

## Doctrine Lock

Topology over dashboards. Contracts over screenshots. Structured state over agent guesswork. Local reasoning before frontier escalation. Run the agent where the work lives. Use Desktop as the command bridge.

## Remote Control Room

Hermes Agent Desktop should act as the operator interface for a persistent remote Hermes Agent.

```text
User Laptop
  -> Hermes Desktop
  -> Tailscale Private Network
  -> Remote Gateway
  -> Hermes Agent VPS
  -> Persistent Sessions / Memory / Skills / MCP Servers
```

Rules:

- Agent does not live on the laptop by default.
- Laptop is a controller, not the source of truth.
- Sessions persist after the laptop closes.
- Memory, skills, files, MCP servers, and long-running jobs stay on the remote agent host.
- Remote gateway must not be exposed to the open internet.
- Tailscale or equivalent private mesh networking is required.
- OAuth authentication through Nous Portal is required for remote access when available.
- Same-Wi-Fi mode may support local username/password access for home-lab operation.

## Desktop Control Room Capabilities

- Persistent sessions
- Isolated session contexts for cost control
- Concurrent sessions
- Profiles for environment/personality/tool presets
- Sub-agents for delegated work
- File browser and live preview
- Built-in terminal
- Voice dictation and conversations
- Model switching from status bar
- MCP server management
- Remote gateway management
- VPS health status
- Token/cost visibility
- Session memory controls
- Skill activation controls

Useful commands:

```bash
hermes prompt-size
hermes sessions optimize
hermes desktop --skip-build
```

## Backend Context Engineering

Never make agents browse dashboards when topology can be provided.

Every client backend needs an Agent Context Snapshot:

```json
{
  "system_name": "",
  "system_type": "",
  "environment": "",
  "auth": {},
  "database": {},
  "storage": {},
  "queues": {},
  "workers": {},
  "edge_functions": {},
  "deployment": {},
  "observability": {},
  "permissions": {},
  "model_gateway": {},
  "integrations": {},
  "micro_vms": {},
  "known_constraints": {},
  "common_errors": {},
  "recommended_next_actions": {}
}
```

The layer must provide a one-call environment snapshot, auth config, database schema, storage buckets, permission policies, deployment topology, edge functions, model gateways, micro VM status, integrations, missing states, diagnostics, and remediation steps.

## Structured Error Standard

All CLI and backend operations return structured JSON, meaningful exit codes, exact failure reason, likely cause, and safe next action.

```json
{
  "success": false,
  "exit_code": "DB_SCHEMA_MISSING",
  "failure_reason": "users table missing",
  "likely_cause": "migration not executed",
  "safe_next_action": "run migration 2026_01_users.sql"
}
```

## Cost-Cut Pattern

| Problem | Fix |
|---|---|
| Agent queries too many APIs | One topology snapshot |
| APIs over-return data | Narrow agent-specific schema |
| Errors are vague | Structured JSON and exit codes |
| Agent guesses | Backend returns diagnosis hints |
| Same client context repeats | Client SLM stores it |
| Skills overload context | Activate skills only by task |

## Skill Activation Doctrine

Read topology, identify task, activate only relevant skills, execute, then unload unused context.

## Escalation Ladder

| Tier | Layer | Use |
|---|---|---|
| 0 | Static topology snapshot | Cheap state awareness |
| 1 | Client SLM | Repeated client-specific tasks |
| 2 | Specialized domain agent | Domain execution |
| 3 | Frontier model | Novel architecture, complex reasoning, uncertainty, high-risk decisions |

## Security

Never expose Hermes gateway to the open internet. Require private network access, OAuth or strong credentials, scoped session permissions, audit logs, approval gates for destructive actions, emergency shutdown, session revoke, and MCP server allowlists.
