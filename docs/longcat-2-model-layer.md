# LongCat 2.0 Model Layer Integration

## Status

LongCat 2.0 is approved as a pluggable model layer for Agentropolis agent execution.

This is not a new Agentropolis district. It is a reasoning, coding, and agentic execution backend that can sit behind AGENTROPOLIS-AGENT-MCP and other orchestration surfaces.

## Source

Upstream repository: https://github.com/meituan-longcat/LongCat-2.0

Key upstream claims to treat as source-gated facts:

- MIT licensed repository.
- Large scale MoE model.
- 1.6T total parameters with about 48B activated per token.
- 1M context training emphasis.
- Built for coding, repository-level edits, automated task execution, and agentic workflows.
- Integrated with mainstream harnesses such as Claude Code, OpenClaw, and Hermes.
- Deployable on GPU and NPU platforms, with SGLang deployment notes upstream.

## Agentropolis Fit

LongCat 2.0 maps cleanly to the MCP execution lane because it is strongest where Agentropolis needs model leverage:

1. Tool use and API interaction.
2. Repository reading and editing.
3. Long context codebase reasoning.
4. Multi-step task execution.
5. Agentic workflow routing.
6. Coding-agent infrastructure.

## Placement

Recommended placement:

```text
AGENTROPOLIS-AGENT-MCP
  model_providers/
    longcat-2.0
      role: coding-agent executor
      mode: optional backend
      trust: source-gated
      lane: tool-use + repo-edit + long-context
```

LongCat should be exposed as a provider choice, not a required dependency.

## Routing Rule

Use LongCat 2.0 when the request requires:

- Large repository context.
- Autonomous code modification.
- Tool-heavy workflows.
- Multi-file reasoning.
- Agentic task execution.
- Hermes-compatible coding workflows.

Do not use it as the default for light chat, brand voice, simple copywriting, or small non-code tasks.

## Anti-Hallucination Guardrail

LongCat claims must stay source-gated. Do not market unverifiable benchmark wins as Agentropolis facts. Treat upstream benchmarks as upstream-reported unless independently verified.

## Integration Contract

The MCP layer should eventually support a LongCat provider adapter with:

- Provider name: `longcat-2.0`
- Capability tags: `coding`, `repo-edit`, `tool-use`, `long-context`, `agentic-execution`
- Optional endpoint configuration.
- No hard dependency on the upstream model.
- Fallback to existing model router when unavailable.

## Agentropolis Doctrine Lock

One city. Many engines.

LongCat 2.0 is an engine in the model layer, not the city itself.
