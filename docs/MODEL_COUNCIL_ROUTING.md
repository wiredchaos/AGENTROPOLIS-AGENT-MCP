# AGENTROPOLIS Agent MCP Model Council Routing

This MCP kit should not bind every agent to one model. It should expose a provider-aware routing layer where HERMES can select the right intelligence lane for each tool call.

## MCP Routing Lanes

| MCP Lane | Model Candidates | Use |
| --- | --- | --- |
| Planner | `deepreinforce-ai/Ornith-1.0-35B`, `deepreinforce-ai/Ornith-1.0-35B-FP8` | multi-step planning, agent routing, workflow decomposition |
| Builder | `moonshotai/Kimi-K2.7-Code`, `Qwen/Qwen3-Coder-30B-A3B-Instruct` | code, repo edits, MCP scaffolds, implementation tasks |
| Fast Worker | `deepseek-ai/DeepSeek-V4-Flash` | summaries, tagging, extraction, small tool tasks |
| Research | `zai-org/GLM-5.2`, `Qwen/Qwen3.6-35B-A3B`, `moonshotai/Kimi-K2.6` | technical research, docs, comparisons, synthesis |
| Council Review | `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4` | high-stakes review before elevated actions |
| Lightweight / Fallback | `google/gemma-4-31B-it`, `google/gemma-4-26B-A4B-it`, `meta-llama/Llama-3.1-8B-Instruct`, `openai/gpt-oss-20b` | cheap fallback, local-ish tasks, constrained execution |
| Open OSS | `openai/gpt-oss-120b`, `openai/gpt-oss-20b` | open-weight compatible assistant/reasoning fallback |

## MCP Policy Pattern

```text
MCP request
  -> classify task
  -> score risk
  -> select model lane
  -> check tool authority
  -> execute
  -> validate output
  -> log receipt
```

## Tool Authority Rule

Wallet, credential, file-system, deployment, and data-mutating tools require elevated checks.

```text
low-risk text task
  -> fast worker lane

code or repo task
  -> builder lane

wallet / credential / production mutation
  -> planner lane
  -> policy gate
  -> council review when needed
  -> human approval when required
```

## Canon

HERMES is the router.
NemoClaw is the builder and governed execution checkpoint.
Nemotron is the research council.
The MCP kit is the tool lane, not the mayor.
