# Master Canvas MCP Adapter Note

**Source:** `wassermanproductions/master-canvas`  
**Status:** External upstream tool.  
**MCP role:** Candidate source format for future visual-planning import adapters.

## Purpose

This note records where Master Canvas fits with AGENTROPOLIS-AGENT-MCP.

Master Canvas should be treated as a possible upstream planning source. AGENTROPOLIS-AGENT-MCP can later expose adapter tools that convert Master Canvas exports into normalized Agentropolis task packets.

## Adapter principle

Do not build a broad integration first.

Build a narrow MCP bridge only after the export format is inspected and stable enough to map safely.

## Candidate MCP tools

Future tools may include:

| Tool | Role |
| --- | --- |
| `master_canvas_import` | Read a Master Canvas export bundle. |
| `master_canvas_validate` | Check required scene, shot, prompt, and asset fields. |
| `master_canvas_to_missions` | Convert scenes into Agentropolis mission cards. |
| `master_canvas_to_hermes_packet` | Produce a reviewable Hermes execution packet. |
| `master_canvas_asset_manifest` | Extract visual references and asset notes. |

## Required guardrails

- Never execute imported plans automatically.
- Always emit a reviewable summary before dispatch.
- Preserve source project metadata.
- Keep adapter output deterministic.
- Do not mutate upstream Master Canvas files unless explicitly requested.
- Treat missing fields as warnings, not silent assumptions.

## Possible output packet

```json
{
  "source": "master-canvas",
  "project": "Example Project",
  "scenes": [],
  "missions": [],
  "assets": [],
  "warnings": [],
  "ready_for_hermes_review": true
}
```

## Canon lock

Master Canvas is a planning-source candidate.

AGENTROPOLIS-AGENT-MCP should only provide adapters, validators, and normalized handoff packets unless the project later decides to create a deeper integration.
