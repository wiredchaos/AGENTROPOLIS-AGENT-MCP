# Hermes Serious Agent Stack

AGENTROPOLIS-AGENT-MCP role: the Execution Membrane.

This repo should control how agents touch tools, APIs, workspace surfaces, model routes, and approval gates.

## Purpose

Turn external action into structured, reviewable, logged, and bounded operations.

## Seven lanes mapped to MCP

1. Brainstorming: require a plan before multi-step execution.
2. Soul Grader: verify agent identity and authority before tool use.
3. Project Memory: read repo context before acting.
4. Agent Memory Wiki: use curated operator notes for continuity.
5. Safe Tool Wrapper: define read, draft, update, archive, publish, and execute classes.
6. Diagram Maker: document tool flows and approval boundaries.
7. Skill Factory: convert repeated MCP workflows into reusable procedures.

## MCP boundary

MCP should not be a cinematic shell only. It should become the policy membrane between Agentropolis agents and real tool surfaces.

## Required behavior

- classify action risk
- prefer read-only by default
- require approval for irreversible operations
- return receipts after meaningful actions
- keep logs small, structured, and searchable
- separate private runtime from public docs

## Backlog

- docs/tool-policy.md
- docs/action-risk-classes.md
- docs/approval-gates.md
- docs/receipts.md
- diagrams/mcp-tool-flow.md

Do not give agents chaos. Give them rails.
