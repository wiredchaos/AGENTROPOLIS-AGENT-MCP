# Hermes 20 Workflows MCP Routing Map

This document translates the Hermes 20 workflow pattern set into MCP-facing routing rules for Agentropolis.

The MCP kit is not the city brain. It is the tool lane control surface.

```text
Workflow request
  -> classify intent
  -> identify district owner
  -> select model lane
  -> check MCP tool authority
  -> enforce risk gate
  -> execute or draft
  -> validate output
  -> log receipt
```

## MCP Routing Principle

A Hermes workflow becomes production-grade only when the MCP layer can answer:

- What tools may this workflow touch?
- Is the action read-only, draft-only, alert-only, approval-required, or elevated execution?
- Which district owns the domain?
- Which model lane is appropriate?
- What receipt must be written after execution?

## Workflow Routing Matrix

| # | Workflow | MCP authority lane | Tool posture | Receipt requirement |
| --- | --- | --- | --- | --- |
| 1 | Murder Board | Research / files / browser | Read-only | Source map, contradiction log, citation pack |
| 2 | Competitor Autopsy | Browser / GitHub / docs / screenshots | Read-only | Evidence bundle, page diffs, opportunity brief |
| 3 | Price Prophet | Browser / price trackers / commerce APIs | Alert-only or approval-required | Price history, recommendation, source proof |
| 4 | Meeting Prep Autopilot | Calendar / email / browser / contacts | Draft-only | Briefing card, sources, follow-up draft |
| 5 | Daily Opponent | Research / files / reasoning council | Read-only | Assumption attack report |
| 6 | 3AM Watchdog | Browser / repo / form / status monitors | Alert-only | Change diff, reason code, timestamp |
| 7 | Content Decay Detector | Analytics / CMS / browser / SEO tools | Draft-only | Decay diagnosis, update queue, remediation plan |
| 8 | Competitor Alert System | Browser / screenshots / changelog / job boards | Alert-only | Screenshot, diff, significance explanation |
| 9 | Deal Radar | Commerce APIs / deal sites / trackers | Alert-only | Historical-low proof, buy/wait recommendation |
| 10 | Article Factory | Browser / files / CMS / media tools | Draft-only unless approved | Source pack, outline, draft, metadata, staging log |
| 11 | Write Like Me Ghostwriter | Files / writing samples / editor | Draft-only | Voice fingerprint, draft, mask-slip flags |
| 12 | Zillow Sniper | Property sites / maps / public records | Alert-only or approval-required | Listing packet, rule match, dealbreaker check |
| 13 | Smart Home Conductor | Home automation APIs | Approval-required | Automation plan, test result, rollback note |
| 14 | Resume Assassin | Files / job board / editor | Draft-only | Before/after score, revised bullets, truth check |
| 15 | Negotiation Prep Kit | Browser / files / market data | Draft-only | Comps, leverage map, response script |
| 16 | Side Project Forensic | GitHub / files / browser | Read-only or draft-only | Repo scorecard, repair path, resurrection rank |
| 17 | Release Manager | Terminal / GitHub / package registry | Elevated execution | Test log, changelog, release artifact, rollback path |
| 18 | RSS Bouncer | RSS / browser / GitHub / newsletters | Alert-only | Relevance score, reason, source link |
| 19 | Blender Scene Monkey | Terminal / Blender / file export | Approval-required | Script, render path, asset manifest |
| 20 | Knowledge Archaeologist | Memory / files / conversations | Read-only | Context recovery packet with source receipts |

## Risk Gates

### Read-only
Allowed to inspect and summarize. No writes. No external actions.

### Draft-only
Allowed to generate drafts, plans, and staging artifacts. Human approval required before publishing, sending, or applying.

### Alert-only
Allowed to monitor on schedule and notify when a meaningful condition is met. No direct execution.

### Approval-required
Allowed to prepare and simulate actions. Execution requires explicit operator approval.

### Elevated execution
Requires strict controls:

```text
human approval
  -> tool allowlist
  -> credential lease
  -> spend or impact cap
  -> cooldown / kill switch
  -> audit receipt
  -> rollback note
```

## Model Council Handoff

Use the existing Model Council routing lane before tool execution:

```text
classify task
  -> score risk
  -> select model lane
  -> validate tool authority
  -> execute
  -> verify
  -> receipt
```

Suggested lanes:

| Lane | Best for |
| --- | --- |
| Research | Murder Board, Competitor Autopsy, Price Prophet, RSS Bouncer |
| Builder | Release Manager, Blender Scene Monkey, Smart Home Conductor |
| Writer | Article Factory, Write Like Me, Resume Assassin |
| Council | Daily Opponent, Negotiation Prep, high-risk decisions |
| Fast Worker | Watchdogs, alerts, recurring checks, lightweight classification |

## MCP Package Requirement

Each workflow that becomes a package should ship with:

```text
SKILL.md
manifest.json
inputs.schema.json
outputs.schema.json
tool-allowlist.json
risk-policy.md
examples/
evals/
receipts/
```

The MCP kit does not make the agent powerful by default.

It makes power inspectable, bounded, and revocable.
