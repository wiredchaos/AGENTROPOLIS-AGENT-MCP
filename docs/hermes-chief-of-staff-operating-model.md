# Hermes Chief of Staff Operating Model

Status: architecture note
Scope: AGENTROPOLIS MCP and agent connector layer

## Core lock

This repo is the connector layer that helps Hermes act like a chief of staff instead of a standalone assistant.

Hermes becomes useful when it can call tools, read memory, write tasks, and route specialist agents through controlled interfaces.

## MCP role

AGENTROPOLIS AGENT MCP should support:

- tool routing
- API connector standards
- specialist agent boundaries
- approval gates
- memory read and write flows
- GitHub work tracking
- safe status reporting

## Operating doctrine

1. Connect tools only when they serve a defined workstream.
2. Give each connector a narrow job.
3. Keep read actions broader than write actions.
4. Put approval gates in front of public and destructive actions.
5. Log important decisions back into memory.
6. Prefer repeatable playbooks over one off prompts.

## AGENTROPOLIS mapping

| Layer | MCP purpose |
| --- | --- |
| Hermes | Orchestrator |
| MCP servers | Tool access layer |
| GitHub | Work tracking and repo execution |
| Memory docs | Decision persistence |
| Specialist agents | Narrow execution workers |
| Dashboard | Human supervision surface |

## Connector classes

### Builder connectors

- GitHub
- code agents
- deployment targets
- design files
- test reports

### Media connectors

- X
- YouTube
- content archives
- image and video generation tools
- publishing queues

### Knowledge connectors

- canon docs
- memory vaults
- search indexes
- decision logs

### Business connectors

- calendar
- email draft flows
- CRM style records
- proposal docs

## Approval gates

MCP connectors should separate safe actions from gated actions.

Safe by default:

- read status
- search docs
- draft output
- summarize context
- create issue drafts
- prepare pull request notes

Gated by default:

- publish public content
- delete files
- merge destructive changes
- change official business records

## Closed loop pattern

1. Hermes receives brief.
2. MCP reads relevant sources.
3. Hermes splits work by district.
4. Specialist agent executes through narrow connector.
5. MCP records output to GitHub or memory.
6. Hermes requests approval where needed.
7. Final decision is logged.

## Anti drift note

This repo should not become a random tool pile.

Every connector must answer:

- What district does this serve?
- What can it read?
- What can it write?
- What requires approval?
- Where does it log results?

Hermes is the operator.

MCP is the tool nervous system.

NEURO remains the final approval layer.