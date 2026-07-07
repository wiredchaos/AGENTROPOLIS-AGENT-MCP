# Superagent Gateway Infrastructure Lane

Superagent Gateway is tracked as an optional model-routing gateway for AGENTROPOLIS agent infrastructure.

It belongs in the gateway layer. It does not replace MCP, Hermes, skills, memory, or governance.

```text
Coding agents
  -> Superagent Gateway
  -> provider adapters
  -> OpenRouter / Anthropic / OpenAI / Ollama / vLLM / Moonshot / Azure AI
```

## Canon Classification

| Field | Value |
| --- | --- |
| Layer | Infrastructure |
| Lane | Model-routing gateway |
| Status | Optional / candidate |
| Authority | No direct tool authority |
| Execution scope | Provider routing only |
| Risk posture | Governed, receipt-logged, environment-variable secrets |

## What It Is

Superagent Gateway is a lightweight local gateway that gives compatible coding agents a single endpoint for model-provider access.

The value is not magic autonomy. The value is routing discipline:

- one local endpoint for multiple coding agents
- provider swapping without rewriting every agent config
- local model access through Ollama or similar lanes
- external provider access through supported adapters
- cleaner separation between agent runtime, model routing, and tool execution

## What It Is Not

Superagent Gateway is not:

- an MCP server
- a replacement for Hermes
- a replacement for AGENTROPOLIS governance
- a memory layer
- a skill registry
- a permission system
- a wallet or execution authority

MCP gives agents tools. Hermes coordinates agent work. Superagent Gateway routes model calls.

## AGENTROPOLIS Placement

```text
AGENTROPOLIS Intelligence Grid
  -> infrastructure
     -> MCP servers
     -> model council routing
     -> gateway layer
        -> Superagent Gateway
        -> LiteLLM or other compatible gateways
        -> OpenRouter provider lane
     -> memory
     -> skills
     -> receipts
```

This keeps agents, providers, tools, and governance separated.

## Suggested Use Cases

### 1. Coding Agent Provider Router

Use Superagent Gateway as a shared model endpoint for:

- Hermes coding lanes
- Claude Code style terminal agents
- Codex CLI style agents
- OpenClaude style local workflows
- DeepCode / DeepSeek-compatible coding agents

### 2. Local + Cloud Hybrid Lane

Route low-risk or private tests to local models while keeping high-context or premium reasoning lanes available through external providers.

### 3. Provider Failover Candidate

Use gateway routing as a pre-execution provider selection layer, but keep validation and receipts outside the gateway.

```text
task classified
  -> risk scored
  -> provider lane selected
  -> gateway call
  -> output validation
  -> receipt logged
```

## Governance Rules

1. The gateway may route model calls, but it may not grant tool authority.
2. Secrets must stay in environment variables or approved secret stores.
3. Provider failover must not bypass model-lane policy.
4. Local model routing does not automatically mean safe execution.
5. All coding-agent outputs still require validation before merge, deploy, publish, or wallet action.

## Integration Pattern

```text
Agent runtime
  -> asks for model completion
  -> gateway resolves provider lane
  -> model returns candidate output
  -> MCP/tool layer checks permissions
  -> validation layer tests result
  -> receipt layer logs final state
```

## Recommended AGENTROPOLIS Status

Adopt as a documented candidate lane.

Do not make it its own repository yet. Keep it inside `AGENTROPOLIS-AGENT-MCP` under infrastructure docs until the pattern is proven across multiple agent runtimes.

## Decision Lock

Superagent Gateway is a gateway layer candidate for model routing.

It is not the brain.
It is not the tool layer.
It is not the permission system.

Clean separation is the win.
