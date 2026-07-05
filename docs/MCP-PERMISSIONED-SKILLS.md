# MCP Permissioned Skills

## Status

Research mapping. Not production infrastructure.

## Purpose

AGENTROPOLIS-AGENT-MCP is the permission gate for agent-native work rails.

The AgentSkillOS pattern shows that large skill libraries need retrieval and orchestration. AGENTROPOLIS adds permission gating before any workflow can move from plan to action.

## Core Rule

A skill is not usable only because it was retrieved. It becomes usable only after permission checks confirm that the requested action is allowed for the current scope.

## Permission Classes

| Class | Meaning | Default posture |
|---|---|---|
| Read | Inspect public-safe files or docs | Allowed when scoped |
| Draft | Produce proposed artifacts | Allowed when reviewable |
| Write | Modify repo files or records | Requires explicit approval |
| Release | Publish, deploy, or ship | Block by default |
| Finance | Move funds or trigger payments | Block by default |
| Sensitive | Use secrets, credentials, client data, or private canon | Block by default |

## Proposed Flow

```text
Skill request
-> classify action
-> check repository or system scope
-> check permission class
-> check forbidden data classes
-> return allow, deny, or needs review
```

## Required Metadata

Each skill record should include:

- Skill name
- Capability family
- District
- Required inputs
- Permission class
- External systems touched
- Data sensitivity
- Human review requirement
- Output artifact type

## Review Output

MCP should return a review packet that a human can inspect before HERMES runs the approved step.

The packet should include allowed actions, blocked actions, assumptions, risk notes, and the reason for the decision.
