# Deployment Readiness — AGENTROPOLIS AGENT MCP

Status: **integration bridge readiness guide**

AGENTROPOLIS-AGENT-MCP is the bridge layer that lets outside agents, tools, and services connect into the Agentropolis ecosystem through controlled MCP interfaces.

## Role In The Ecosystem

| Repo | Role |
|---|---|
| `schoolofbase` | Education and onboarding district |
| `HERMES-CITY` | Mini-city command runtime |
| `agentropolis` | Full city coordination layer |
| `AGENTROPOLIS-AGENT-MCP` | MCP bridge for external agents and tools |

## Deployment Objective

The MCP layer should answer:

> Can an authorized agent discover tools, request work, execute safely, and leave an auditable trail?

## Minimum MCP Requirements

- [ ] `README.md` explains server purpose and supported tools.
- [ ] Install command documented.
- [ ] Local run command documented.
- [ ] Environment variables documented.
- [ ] Tool list documented.
- [ ] Tool permissions documented.
- [ ] Example agent request/response documented.
- [ ] Error format documented.
- [ ] Logging and audit behavior documented.
- [ ] No secrets committed.

## Required Safety Gates

Before public or live deployment:

- [ ] No wallet-spending tool enabled without policy checks.
- [ ] No filesystem write access without scoped paths.
- [ ] No shell execution unless sandboxed and explicitly allowed.
- [ ] No unauthenticated destructive actions.
- [ ] Tool calls return structured errors.
- [ ] Agent identity is captured in logs.
- [ ] Rate limits or abuse controls are planned.

## Deployment Modes

### Local Dev

Use for tool testing and agent integration.

```sh
# install dependencies
# run MCP server locally
# connect from Claude, Cursor, Codex, Hermes, or compatible MCP client
```

### Private Operator

Use for Agentropolis internal workflows.

- restrict access,
- log every tool call,
- expose only safe tools,
- test with HERMES CITY first.

### Public Developer Preview

Use only after docs, auth, permissions, and rate limits are clear.

## Suggested Tool Categories

| Tool Category | Purpose | Risk |
|---|---|---|
| Registry tools | Read district/agent metadata | Low |
| Education tools | Query School of Base curriculum | Low |
| Telemetry tools | Read city status | Medium |
| Build tools | Generate code/config/docs | Medium |
| Wallet/payment tools | Execute economic actions | High |
| Shell/filesystem tools | Modify local/runtime state | High |

## Integration Path

1. Start with read-only tools.
2. Add registry and curriculum queries.
3. Add command-center telemetry.
4. Add build/document generation tools.
5. Add wallet/payment execution only after policy simulation and kill switch.

## Canonical Positioning

**MCP is not the city. MCP is the controlled gate where agents request access to the city's tools.**

Agentropolis coordinates. HERMES CITY operates. School of Base trains. MCP connects.
