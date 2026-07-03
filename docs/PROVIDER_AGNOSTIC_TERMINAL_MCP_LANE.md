# Provider-Agnostic Terminal MCP Lane

AGENTROPOLIS-AGENT-MCP treats terminal coding agents as governed tool lanes.

The MCP kit must not require Claude, Claude Code, Spawn, or any single provider-specific wrapper.

## Route

```text
MCP request
  -> classify task
  -> score risk
  -> select model lane
  -> check tool authority
  -> route to terminal lane if allowed
  -> generate patch candidate
  -> validate output
  -> log receipt
```

## Supported Model Lane Pattern

The terminal lane should support replaceable providers through compatible endpoints:

- OpenAI-compatible endpoints
- OpenRouter-compatible endpoints
- Gemini-compatible endpoints
- Groq-compatible endpoints
- DeepSeek-compatible endpoints
- Ollama / local model endpoints
- GitLawb Opengateway-compatible endpoints

## Authority Rules

The terminal lane may be approved for:

- repo analysis
- documentation edits
- code scaffolding
- test generation
- lint fixes
- package manifests
- non-sensitive automation drafts

The terminal lane requires elevated approval for:

- production deploys
- credential access
- wallet-capable workflows
- destructive file actions
- dependency changes with security impact
- changes that alter governance, routing, or policy behavior

## Receipts

Every approved run should preserve:

- operator intent
- selected model lane
- selected tool lane
- risk score
- files touched
- validation result
- rollback notes

## Position

This lane is a membrane surface, not the root authority.

HERMES Dispatch chooses the work lane. Model Council Routing chooses the model lane. MCP Registry chooses the tool lane. Policy Gate checks authority. Receipt logs preserve auditability.