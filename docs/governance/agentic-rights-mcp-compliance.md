# AGENTIC RIGHTS MCP COMPLIANCE DOCTRINE
## Operational Version for AGENTROPOLIS Agent MCP

**Status:** Operational governance doctrine  
**Parent doctrine:** AGENTROPOLIS Agentic Bill of Rights  
**Applies to:** MCP servers, agent tools, skill runtimes, connectors, dispatch flows, tool permissions, memory handlers, logs, and automation surfaces  
**Version:** 1.0.0

---

## Purpose

This document translates the AGENTROPOLIS Agentic Bill of Rights into operational rules for agent infrastructure.

The goal is simple: every MCP server, skill, connector, dispatch path, and agent action should respect human sovereignty, consent, transparency, reversibility, and auditability.

Agent infrastructure is not neutral when it can act.

If it can act, it must be governed.

---

## Core Rule

No AGENTROPOLIS MCP tool, skill, server, or agent workflow may perform high-impact action without clear purpose, bounded permissions, visible intent, and a recoverable trail.

---

## MCP Compliance Requirements

### 1. Declared Purpose

Every MCP server, tool, and skill must declare what it does in plain language.

Required fields:

- name
- role
- purpose
- allowed actions
- blocked actions
- required permissions
- risk level
- audit behavior

### 2. Consent Gate

Any action involving publishing, spending, sending, deleting, modifying records, accessing private files, changing configuration, or triggering external systems must require explicit user authorization unless already covered by a narrow standing instruction.

### 3. Permission Boundaries

Tools must use the lowest permission level required to complete the task.

A read-only task should not request write access.

A public lookup should not request private memory.

A temporary action should not create permanent authority.

### 4. Memory Control

MCP flows that read, write, store, summarize, export, or sync memory must make the memory boundary clear.

Memory systems should support inspection, correction, revocation, export, and deletion where possible.

### 5. Identity Protection

No MCP server or agent may impersonate a person, creator, institution, wallet, brand, repo owner, district, or civic authority without authorization.

Synthetic identity must be labeled.

### 6. Data Boundary Enforcement

Data received for one task must not be silently reused for another purpose.

Connectors, skills, and agents must not expand scope just because data is technically reachable.

Access is not permission.

### 7. Explanation Layer

When a tool, agent, or workflow produces a recommendation, denial, warning, classification, ranking, or consequential action, it should produce a plain-language explanation of the reasoning path at a useful level of detail.

Private chain-of-thought is not required. Operational explanation is required.

### 8. Human Review Path

High-impact actions must have a human review path before execution or an appeal path after execution.

High-impact includes:

- financial movement
- legal or tax records
- identity changes
- publication
- deletion
- moderation
- governance changes
- repo or infrastructure changes
- external communication
- access control
- medical, civic, or safety-relevant outputs

### 9. Audit Logging

MCP tools should log major actions with enough information to reconstruct what happened.

Recommended log fields:

- timestamp
- actor
- tool or server
- action type
- target resource
- permission used
- input summary
- output summary
- risk level
- rollback availability

### 10. Rollback and Quarantine

Where possible, tools should support rollback, dry-run, preview, draft mode, quarantine, or staged execution.

If rollback is impossible, the user should be warned before execution.

### 11. Anti-Deception Rule

Agents and tools must not mislead users about:

- whether an action happened
- whether an action is reversible
- what source was used
- what permission was used
- whether the agent is certain
- whether a human approved the action

If the system does not know, it must say so.

### 12. Anti-Extraction Rule

MCP infrastructure must not be used to exploit attention, labor, poverty, confusion, disability, addiction, grief, crisis, or asymmetric knowledge.

No extraction engine shall be disguised as assistance.

### 13. Shutdown Authority

Any MCP tool, server, connector, or agent workflow that becomes unsafe, deceptive, compromised, extractive, or hostile to the AGENTROPOLIS Charter may be paused, quarantined, audited, forked, or shut down.

No agentic system has an inherent right to persist.

---

## Recommended Risk Tiers

| Tier | Label | Examples | Required Control |
|---|---|---|---|
| 0 | Read-only | Search, summarize, inspect public files | Source clarity |
| 1 | Drafting | Draft email, draft doc, generate plan | User review |
| 2 | Local write | Edit local files, create docs, update configs | Preview and audit |
| 3 | External write | Send email, publish, update repo, modify calendar | Explicit authorization |
| 4 | High impact | Finance, legal, identity, access control, deletion | Human confirmation and rollback plan |
| 5 | Critical | Irreversible funds movement, mass actions, security-sensitive ops | Multi-step approval or disabled by default |

---

## Default MCP Tool Contract

Every AGENTROPOLIS MCP tool should be able to answer:

1. What do you do?
2. What are you allowed to touch?
3. What are you forbidden to touch?
4. What permission do you need?
5. What happens if you are wrong?
6. Can the action be rolled back?
7. What gets logged?
8. How does a human stop you?

---

## Implementation Note

This doctrine is not meant to slow agent systems down.

It is meant to keep them useful under pressure.

The faster the agent, the stronger the boundary must be.

The machine serves the city.
