# Morph Integration for AGENTROPOLIS Agent MCP

Morph is added as an external AI provider and MCP/plugin target for AGENTROPOLIS agent workflows.

## Purpose

Use Morph for low-friction coding-agent execution without making Morph the core architecture.

Morph should be treated as a provider lane, not a dependency lock.

## Supported lanes

- MCP / plugin setup for agent tools
- OpenAI-compatible API access
- Coding-agent acceleration
- Search and code-edit workflows
- Preview testing for deployed app URLs when production previews exist

## Environment

Never commit real API keys.

```bash
MORPH_API_KEY=replace_with_local_secret
MORPH_BASE_URL=https://api.morphllm.com/v1
```

## Routing policy

Use Morph when the task is:

- code search
- code edit merge
- lightweight coding-agent tasks
- preview testing
- low-cost model validation

Avoid Morph as the only provider for:

- critical production decisions
- legal, tax, medical, or financial outputs
- irreversible deployment actions
- tasks needing cross-provider verification

## Provider stance

AGENTROPOLIS remains provider-agnostic.

Morph joins the provider pool beside OpenAI, Anthropic, Gemini, Groq, Cerebras, Kimchi, DeepSeek, Ollama, LM Studio, and other local or cloud models.

## Anti-Moloch guardrail

Do not let free credits turn into architecture capture.

- benchmark first
- route by task
- fallback always
- log provider choice
- protect secrets
- keep local exit paths
