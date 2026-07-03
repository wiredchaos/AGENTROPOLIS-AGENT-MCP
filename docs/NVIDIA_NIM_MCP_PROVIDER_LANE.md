# NVIDIA NIM MCP Provider Lane

## Purpose

This document adds NVIDIA NIM as a candidate model-provider lane for AGENTROPOLIS-AGENT-MCP routing.

NVIDIA NIM is not treated as a tool authority layer. It is an inference provider candidate that must pass through Model Council Routing, MCP Registry checks, Policy Gate review, validation, and receipt logging.

## Provider pattern

```text
base_url: https://integrate.api.nvidia.com/v1
auth_env: NVAPI_KEY
api_shape: OpenAI-compatible
```

Secrets must stay in environment variables or a governed vault. Do not commit API keys, local `.env` files, credential screenshots, or request logs containing sensitive data.

## MCP routing placement

```text
MCP request
  -> classify task
  -> score risk
  -> select model lane
  -> check tool authority
  -> route to NVIDIA NIM only if allowed
  -> execute candidate response
  -> validate output
  -> log receipt
```

## Candidate model map

| Model | MCP lane | Recommended use |
| --- | --- | --- |
| `minimaxai/minimax-m3` | coding_candidate | Code drafts, scaffolds, test suggestions |
| `qwen/qwen3.5-397b-a17b` | reasoning_candidate | Planning, analysis, council review |
| `moonshotai/kimi-k2.6` | agentic_candidate | Multi-step task chains and workflow planning |
| `zhipuai/glm-5.1` | general_candidate | General chat, summaries, lightweight ops |
| `deepseek/deepseek-v4-flash` | fast_worker_candidate | High-throughput low-risk tasks |

## Default authority

```yaml
provider: nvidia_nim
status: candidate
trust_tier: experimental
allowed_execution_lanes:
  - advisory
  - sandbox
blocked_execution_lanes:
  - wallet_execution
  - autonomous_payment
  - client_tax_work
  - legal_finalization
  - credential_management
requires_receipt: true
requires_validation: true
```

## Anti-Moloch guardrails

1. Do not route sensitive tool calls to a newly added model lane by default.
2. Do not let free-tier economics override risk classification.
3. Do not confuse model access with tool permission.
4. Do not allow provider outages or rate limits to create unsafe fallbacks.
5. Do not skip validation before applying generated patches.

## Implementation target

Add this provider as metadata in the MCP model council registry, then route through existing policy and receipt layers before allowing any task execution.
