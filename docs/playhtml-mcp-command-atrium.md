# playhtml MCP Command Atrium

## Purpose

AGENTROPOLIS-AGENT-MCP can use playhtml-style collaborative HTML as a visual command atrium for MCP kits.

The goal is to let builders see tools, agents, routers, guardrails, and execution lanes as spatial objects before connecting them to live systems.

## MCP Visualization Objects

| Object | Meaning |
| --- | --- |
| MCP Tool Card | A callable external tool or service |
| Agent Card | Agent profile or role |
| Router Card | HERMES / dispatch route |
| Policy Gate Card | Risk and permission boundary |
| Wallet Guardrail Card | Wallet-capable action warning |
| Receipt Card | Audit result or execution summary |

## Safety Boundary

The atrium may visualize MCP relationships, but it must not directly execute tools from draggable UI state.

Execution must route through:

```text
Request -> HERMES Dispatch -> Policy Gate -> MCP Registry -> Sandboxed Tool Executor -> Receipt
```

## First Demo

Create a static or lightweight interactive command-atrium page where users can drag:

- MCP tool cards
- agent cards
- policy gate cards
- wallet guardrail cards
- receipt cards

Each object should explain its role in the Agentropolis MCP Agent Kit.

## Canon Line

The MCP Atrium shows the lanes.
The policy layer controls the keys.
