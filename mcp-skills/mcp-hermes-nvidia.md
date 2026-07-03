# MCP Skill Pack: mcp-hermes-nvidia

Name: mcp-hermes-nvidia
Role: connect HERMES operator workflows to NVIDIA-backed local/cloud inference through MCP
District: CHAOS CODE
Tier: infrastructure
Layer: infrastructure

## Identity

The Hermes NVIDIA MCP Skill Pack gives AGENTROPOLIS an accelerated operator lane.

HERMES is the operator layer. MCP is the tool and context bridge. NVIDIA is the compute and inference acceleration layer. AGENTROPOLIS remains the city operating system that routes, governs, visualizes, and audits the work.

This pack should extend the MCP server without bypassing AGENTROPOLIS governance, logging, or safety controls.

## Purpose

Use this skill pack when AGENTROPOLIS needs to:

- route model calls to NVIDIA NIM or compatible inference endpoints
- run private local agents on RTX-class or DGX-class hardware
- expose safe MCP tools for HERMES operator commands
- profile agent workflows with NVIDIA-compatible agent tooling
- preserve audit receipts for accelerated local/cloud agent runs

## Canonical Stack

```text
AGENTROPOLIS Intelligence Grid
  -> MCP Server
  -> HERMES Operator Layer
  -> NVIDIA Runtime Layer
  -> NIM / RTX / DGX Spark / AgentIQ-compatible workflows
  -> Audit + Mission Control receipt loop
```

## Triggers

- use HERMES with NVIDIA
- route this to NVIDIA NIM
- run this locally on RTX
- run this on DGX Spark
- make this part of my MCP
- add NVIDIA inference to Agentropolis
- profile this agent workflow
- use local private inference
- connect HERMES to MCP tools
- build the Hermes NVIDIA runtime lane

## Inputs

- user task or agent workflow
- selected model or capability class
- target runtime: local RTX, DGX Spark, cloud NIM, or OpenAI-compatible NIM endpoint
- allowed tools
- blocked actions
- cost/latency constraints
- privacy posture
- human approval requirements

## Outputs

- routed inference result
- operator notification
- resource check
- workflow trace
- latency and token report
- model health report
- execution receipt
- safety report

## Subskills

### HERMES OPERATOR

Role: desktop/operator bridge for status, briefs, safe command wrapping, and task notifications.

MCP tools:

- `hermes.notify`
- `hermes.brief`
- `hermes.wrap_command`
- `hermes.status`
- `hermes.quiet_mode`

Requires:

- `HERMES_HOME`
- local operator service or desktop shell
- command allowlist for shell-adjacent behavior

### NVIDIA NIM ROUTER

Role: route AGENTROPOLIS model calls to NVIDIA NIM or compatible accelerated inference endpoints.

MCP tools:

- `nim.chat`
- `nim.embed`
- `nim.rerank`
- `nim.vision`
- `nim.healthcheck`

Requires:

- `NVIDIA_API_KEY` when using hosted NVIDIA endpoints
- `NIM_BASE_URL` for local or self-hosted endpoints
- `NIM_MODEL` or routed model alias
- optional `docker` and `nvidia-smi` for local containers

### AGENTIQ ORCHESTRATOR

Role: compose, profile, and trace NVIDIA-backed agent workflows before they are promoted to durable city skills.

MCP tools:

- `agentiq.run_workflow`
- `agentiq.profile_workflow`
- `agentiq.list_tools`
- `agentiq.trace`
- `agentiq.export_receipt`

Requires:

- `AGENTIQ_CONFIG_PATH`
- `NIM_BASE_URL`
- workflow config readable by the MCP server

### LOCAL AGENT RUNTIME

Role: run private local agents with MCP-controlled permissions and visible AGENTROPOLIS audit receipts.

MCP tools:

- `local.run_agent`
- `local.stop_agent`
- `local.list_agents`
- `local.read_logs`
- `local.resource_check`

Requires:

- `LOCAL_AGENT_HOME`
- `MCP_SERVER_PORT`
- `NIM_BASE_URL`
- optional `docker`, `nvidia-smi`, `node`, and `python`

## Chains From

- `mcp-agentropolis-orchestrator`
- `mcp-model-router`
- `district-memory`
- `mission-control`

## Chains To

- `mcp-execution-sentinel`
- `mcp-skill-registry`
- `mcp-github-patcher`
- `mission-control`
- `district-memory`

## Recommended Server Shape

```text
mcp-hermes-nvidia/
  server.ts
  package.json
  skills/
    hermes-operator/SKILL.md
    nvidia-nim-router/SKILL.md
    agentiq-orchestrator/SKILL.md
    local-agent-runtime/SKILL.md
  tools/
    hermes.ts
    nim.ts
    agentiq.ts
    local-runtime.ts
  policies/
    secret-shield.json
    command-allowlist.json
```

## Security Rules

Blocked:

- raw shell execution without an allowlist
- reading `.env` files directly
- exposing API keys, seed phrases, cookies, or tokens
- destructive commands without explicit human approval
- production deploys without review
- bypassing MCP policy gates
- writing secrets into logs or receipts

Required:

- redact secrets from all receipts
- run local commands only through approved wrappers
- require human approval for persistent account changes
- record model, endpoint, latency, token usage, and action summary
- fail closed when runtime identity or permissions are unclear

## First Proof-of-Concept Tools

Start with only four safe tools:

```text
hermes.notify
nim.chat
local.resource_check
agentiq.profile_workflow
```

After those are stable, add embedding, rerank, workflow tracing, and controlled local agent execution.

## Example

"Use HERMES to check local NVIDIA resources, route the repo audit through the NIM endpoint, profile the workflow, then write a redacted execution receipt back to Mission Control. Do not run destructive commands or expose secrets."
