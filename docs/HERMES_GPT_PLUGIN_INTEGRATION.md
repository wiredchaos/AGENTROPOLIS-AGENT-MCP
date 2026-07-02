# HERMES x GPT Plugins for Agent MCP

## Purpose

This document maps GPT Plugins / Connectors into the AGENTROPOLIS MCP layer.

The MCP layer should not blindly expose every plugin to every agent. It should act as the controlled tool bridge between HERMES, Agentropolis, and outside systems.

## MCP Rule

```text
Agent request -> MCP permission check -> plugin adapter -> audit log -> response
```

## Plugin Adapter Pattern

Each plugin should be wrapped as an adapter with:

- name
- provider
- category
- read actions
- write actions
- risk level
- approval policy
- audit requirements
- failure fallback

## Recommended Adapters

| Adapter | Plugin | Use |
| --- | --- | --- |
| github.adapter | GitHub | repo reads, issues, PRs, docs |
| cloudflare.adapter | Cloudflare | edge deploys, workers, routes, AI Gateway |
| airtable.adapter | Airtable | registry, structured memory, status tables |
| clickup.adapter | ClickUp | task creation and sprint visibility |
| datadog.adapter | Datadog | logs, errors, health checks |
| bigquery.adapter | BigQuery | analytics and usage metrics |
| box.adapter | Box | long-term docs and evidence files |
| calendar.adapter | Calendar / Calendly | scheduling and appointments |

## Risk Levels

```ts
export type PluginRisk = "low" | "medium" | "high" | "critical";
```

Low: read or draft actions.

Medium: create issues, create tasks, update registry records.

High: infrastructure changes, deploy previews, config changes.

Critical: production deploys, deletion, money movement, credential changes.

## Guardrail Contract

```ts
export interface ToolRequest {
  agentId: string;
  role: string;
  pluginId: string;
  action: string;
  payload: unknown;
  riskLevel: PluginRisk;
  reason: string;
}

export interface ToolDecision {
  allowed: boolean;
  approvalRequired: boolean;
  reason: string;
  redactions?: string[];
}
```

## Policy Router Logic

1. Identify requesting agent.
2. Identify requested plugin.
3. Identify action category.
4. Match against allowed role permissions.
5. Block unknown tools.
6. Escalate high and critical risk actions.
7. Log every decision.

## Default Agent Permissions

| Agent | Allowed | Blocked |
| --- | --- | --- |
| Planner | GitHub read, ClickUp write, Airtable read/write | deploy, finance |
| Developer | GitHub write, Cloudflare preview | production deploy, billing |
| DevOps | Cloudflare, Datadog, GitHub read | treasury actions |
| Security | Datadog, GitHub read, Cloudflare read | creator tools |
| Librarian | Airtable, Box | deploy, finance |
| Treasury | finance read | transfer, trade, withdraw unless approved |

## MCP Endpoints to Build

```text
GET /plugins
GET /plugins/:id
GET /agents/:id/permissions
POST /tool-request
POST /approval/:requestId/approve
POST /approval/:requestId/reject
GET /audit
GET /health/plugins
```

## HERMES Plugin Console App

The front-end app should let operators:

- see enabled plugins
- assign plugins to agents
- inspect risk level
- approve or reject actions
- review audit logs
- run safe test calls
- disable a plugin immediately

## Anti-Moloch Defaults

- deny by default
- least privilege
- no self-permission escalation
- no hidden destructive actions
- no financial execution without explicit approval
- every plugin call gets timestamped
- every failure becomes an observable incident

## Implementation Priority

1. Static JSON plugin registry
2. Role-based allowlist
3. Audit event writer
4. Approval queue
5. GitHub adapter
6. Airtable adapter
7. Cloudflare adapter
8. Datadog health adapter

## Status

Canonical MCP-side integration guide for GPT Plugins / Connectors.
