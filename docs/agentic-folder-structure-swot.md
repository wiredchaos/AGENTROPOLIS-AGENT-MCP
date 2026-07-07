# Agentic Folder Structure SWOT

## Positioning

Agentic structures turn natural language into intelligent architecture, governance, and execution.

This repository pattern is not just a folder tree. It is a command structure for AI-native workspaces where humans, agents, tools, policies, skills, and documentation need to operate together without collapsing into chaos.

## Core Thesis

Traditional repositories organize software by application layers. Agentic repositories organize work by behavior, authority, policy, and execution.

In this model, prompts stop being loose requests and become operating instructions. The folder structure becomes the governance surface that tells agents what they can do, where they can act, how they should verify work, and what rules must not be violated.

## SWOT Analysis

| Category | Analysis |
| --- | --- |
| Strengths | Clear separation of agents, skills, tools, governance, docs, compliance, scripts, and target outputs. This creates a durable operating surface for multi-agent work. |
| Strengths | Governance-first layout makes the repo easier for coding agents to navigate because policies and execution lanes are explicit instead of buried in prose. |
| Strengths | Supports multiple agent runtimes and workflows, including Claude, Codex, Hermes, GitHub, MCP servers, and future local or VPS-based agents. |
| Strengths | Strong documentation anchors reduce context loss and make the architecture easier to hand off across sessions. |
| Weaknesses | New contributors may expect a conventional app structure such as src, components, services, and tests. Agentic folder logic requires onboarding. |
| Weaknesses | Similar domains can blur together if naming is not enforced, especially agents, skills, tools, spokes, and scripts. |
| Weaknesses | Numeric or shorthand folders can become unclear unless every folder has a README or index file. |
| Weaknesses | Governance docs can drift unless automated checks validate that agents follow the current rules. |
| Opportunities | Establish AGENTROPOLIS as a reference standard for AI-native repository architecture. |
| Opportunities | Auto-generate architecture maps, agent scopes, onboarding pages, and governance checklists from the folder tree. |
| Opportunities | Add policy agents that review pull requests for naming, folder placement, security, and canon consistency. |
| Opportunities | Convert folder metadata into an MCP-readable registry so agents can discover capabilities and limits safely. |
| Threats | Fast-moving AI tooling may pressure the structure to change often, creating fragmentation. |
| Threats | Without strict naming and documentation, contributors may add duplicate or conflicting instructions. |
| Threats | If every agent gets its own disconnected rules, the system may become overfit, brittle, or inconsistent. |
| Threats | Public repo visibility can expose operational patterns if secrets, private governance, or sensitive automation notes are misplaced. |

## Recommended Canonical Domains

```text
/
  .agents/          Agent roles, task scopes, runtime contracts
  .claude/          Claude-specific instructions and settings
  .codex/           Codex-specific instructions and settings
  .github/          GitHub workflows, issue templates, PR checks
  compliance/       Safety, licensing, privacy, and risk policies
  docs/             Human-readable architecture and onboarding
  governance/       Canon rules, decision records, review gates
  skills/           Reusable agent capabilities and procedures
  tools/            Scripts, MCP bridges, utilities, validators
  scripts/          Local automation and maintenance commands
  spokes/           Domain-specific spokes connected to the core hub
  target/           Generated or build output, not source authority
```

## Naming Rules

1. Every top-level folder should answer one question: what authority lives here?
2. Every agent-facing folder should include a README or index explaining scope, allowed actions, and prohibited actions.
3. Runtime-specific folders should not contain universal policy unless they explicitly mirror governance.
4. Governance should be treated as source authority, not commentary.
5. Generated output should never become canon unless promoted through a documented review path.

## Agentic Architecture Score

Current pattern: 9.5 out of 10.

The structure is already operating like an AI-native command surface. The next maturity jump is validation: folder rules should be machine-checkable so every coding agent, research agent, and governance agent can obey the same architecture without guessing.

## AGENTROPOLIS Lock

AGENTROPOLIS should treat this structure as an operating system pattern, not a one-off project layout.

The goal is simple: natural language enters the system, but architecture, governance, and execution come out organized.
