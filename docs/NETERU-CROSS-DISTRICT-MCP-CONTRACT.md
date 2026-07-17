# NETERU Cross-District MCP Contract

## Purpose

This contract governs tool calls and data movement between the NETERU application, Gaming District, Entertainment District, Creator Foundry, NTRU GTM and AGENTROPOLIS-GTM.

## Canonical caller

```text
property: neteru-apinaya
application: neteru.xyz
repository: wiredchaos/ntru
```

## Capability groups

### Canon read

- `neteru.get_scene`
- `neteru.get_character`
- `neteru.get_volume`
- `neteru.get_continuity_context`

### Gaming

- `gaming.register_game_session`
- `gaming.emit_gameplay_event`
- `gaming.issue_achievement`
- `gaming.request_replay_package`

### Entertainment

- `entertainment.create_production_job`
- `entertainment.register_episode`
- `entertainment.register_publication`
- `entertainment.publish_ntrutv_package`

### Creator

- `creator.compile_neteru_package`
- `creator.generate_storyboard`
- `creator.generate_graphic_novel_pages`
- `creator.build_ebook_package`
- `creator.render_episode_assets`

### GTM

- `ntru_gtm.generate_campaign_package`
- `agentropolis_gtm.submit_campaign`
- `agentropolis_gtm.schedule_distribution`
- `agentropolis_gtm.record_performance`

## Authority rules

1. Canon reads are read-only by default.
2. Canon mutation requires a named human approver and a canon-change mandate.
3. Gameplay events may update game state but may not publish player identity without explicit consent.
4. NTRU GTM may generate drafts but may not distribute directly outside approved NETERU-owned surfaces.
5. AGENTROPOLIS-GTM may distribute only approved campaign packages.
6. Mature media cannot route to 789 Studios.
7. Every write must include `mandateId`, `actorId`, `idempotencyKey` and `correlationId`.
8. Every completed write returns a receipt.

## Shared request envelope

```json
{
  "version": "1.0",
  "propertyId": "neteru-apinaya",
  "capability": "creator.compile_neteru_package",
  "mandateId": "uuid",
  "actorId": "subject-id",
  "correlationId": "uuid",
  "idempotencyKey": "stable-key",
  "source": "neteru.xyz",
  "payload": {},
  "consent": {},
  "requestedAt": "2026-07-16T00:00:00Z"
}
```

## Response envelope

```json
{
  "accepted": true,
  "status": "queued",
  "jobId": "uuid",
  "receiptId": "uuid",
  "policyDecision": "allow",
  "validation": []
}
```

## Routing map

```text
neteru.xyz
  -> AGENTROPOLIS-AGENT-MCP
  -> authority and policy check
  -> Gaming | Entertainment | Creator | NTRU GTM | AGENTROPOLIS-GTM
  -> validation
  -> receipt
  -> Mission Control audit ledger
```
