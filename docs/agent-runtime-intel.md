# Agent Runtime Integration Intel

Source signal: OpenClaude v0.22.0, CubeSandbox, Happier, Hermes Browser 0.1.9, local GGUF model lanes, and decentralized/open model discovery screenshots.

## Core lock

AGENTROPOLIS-AGENT-MCP is the orchestration lane. It should not replace Git, Unix commands, shells, worktrees, or model runtimes. It should coordinate them through explicit adapters, receipts, sandboxed execution, and human-readable task reports.

Doctrine: the agent harness automates the Unix way. It does not hide the Unix way.

## Placement map

| Component | Role inside AGENTROPOLIS-AGENT-MCP | Priority |
| --- | --- | --- |
| OpenClaude v0.22.0 | Coding-agent runner with LSP diagnostics, markdown task reports, branch/session grouping, and reliability upgrades | Tier 1 |
| CubeSandbox | Secure concurrent execution layer for agent tool calls and code runs | Tier 1 |
| Happier | Mobile, web, and desktop control surface for Claude Code, Codex, OpenCode, Gemini, Pi, Cursor, and related local coding sessions | Tier 1 |
| Hermes Browser 0.1.9 | Browser context protocol, diagnostics copy, compatibility matrix, runtime events, and companion plugin bridge | Tier 1 |
| Local GGUF model lane | Optional local reasoning/model fallback for Hermes/Neuro agents | Tier 2 |
| Hugging Bay style discovery | Optional decentralized model and dataset discovery index, not a trusted execution source by default | Tier 3 |

## Runtime architecture

```text
Happier
  -> OpenClaude / Claude Code / Codex / OpenCode
    -> AGENTROPOLIS-AGENT-MCP
      -> CubeSandbox
      -> Hermes Browser
      -> MCP servers
      -> local model registry
```

## Implementation notes

1. Keep Git external.
   - Do not make the harness the owner of Git semantics.
   - Let Git handle repositories, branches, worktrees, commits, and diffs.
   - Let the agent generate clear commands and reports.

2. Add runtime receipts.
   - Every agent run should produce a task report.
   - Include repo, branch/session id, commands executed, files changed, diagnostics, and next steps.

3. Add sandbox profiles.
   - `read_only`: inspect repo, docs, issues, logs.
   - `build_test`: install, build, test, lint.
   - `browser_task`: browser automation through Hermes Browser.
   - `danger_zone`: any destructive operation, gated by explicit user approval.

4. Add model registry abstraction.
   - Do not hard-code one frontier model.
   - Support cloud models, local GGUF models, and OpenAI-compatible endpoints.
   - Record license, size, context length, tool-use support, and intended lane.

5. Treat decentralized mirrors carefully.
   - Discovery is allowed.
   - Execution is not automatic.
   - Downloads require provenance checks, license review, hash verification, and sandboxing.

## AGENTROPOLIS fit

This turns AGENTROPOLIS-AGENT-MCP into the control spine for secure, self-hostable agent operations:

- local and cloud model orchestration
- browser context capture through Hermes
- hardware-isolated execution through CubeSandbox-style runtimes
- developer workflow continuity through Happier-style clients
- OpenClaude-style coding sessions with diagnostics and markdown task reports

## Next build tasks

- Add `RuntimeAdapter` interface.
- Add `SandboxAdapter` interface.
- Add `BrowserContextAdapter` interface.
- Add `ModelRegistry` schema.
- Add `TaskReport` markdown schema.
- Add safety policy for decentralized model discovery.
