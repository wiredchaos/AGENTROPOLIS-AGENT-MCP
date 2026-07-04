# AGENTROPOLIS Second Brain MCP Doctrine

Status: active infrastructure doctrine

## Core lock

AGENTROPOLIS does not use AKIRA CODEX for infrastructure memory.

AKIRA CODEX remains WIRED CHAOS lore only.

AGENTROPOLIS uses the AGENTROPOLIS ONTOLOGY and AGENTROPOLIS KNOWLEDGE GRAPH for infrastructure memory.

## Purpose

This doctrine adapts the second-brain workflow pattern into AGENTROPOLIS as a persistent agent operating system.

The goal is not just to remember conversations. The goal is to convert conversations, repositories, builds, prompts, workflows, and outcomes into a living ontology that agents can read from and write back to.

## MCP role

This repository owns the bridge between agents, tools, repos, logs, and the AGENTROPOLIS Ontology.

It should support conversation ingestion, repo ingestion, build-session ingestion, tool-result capture, memory extraction, ontology mapping, approval gates, scheduled agent runs, and audit logs.

## Pipeline

```text
Source data
  -> MCP connector
  -> Memory extractor
  -> Ontology mapper
  -> Operator approval
  -> Write-back
  -> Agent execution
  -> Execution log
```

## Write-back contract

Agents do not only answer. They write useful results back into the ontology when the result creates reusable knowledge.

Examples:

- A new project decision becomes a Decision entity.
- A repeated instruction becomes a Rule entity.
- A build pattern becomes a Workflow entity.
- A useful prompt becomes a Prompt entity.
- A repository change becomes a Repo Memory entity.

## Approval rule

Before any autonomous workflow updates execution behavior, the operator approves the discovered connections.

Recommended gate:

```text
Show discovered connections -> operator approves -> agents wire them into the ontology -> one test run -> review -> scheduled automation
```

## Agent lanes

Recommended AGENTROPOLIS lanes:

- Memory Agent
- Research Agent
- Builder Agent
- Creator Agent
- Distribution Agent
- Security Agent
- Voice Agent
- Ontology Agent
