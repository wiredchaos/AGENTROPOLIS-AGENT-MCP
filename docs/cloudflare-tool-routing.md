# Cloudflare Tool Routing Policy

## Scope

This file defines how AGENTROPOLIS-AGENT-MCP routes Cloudflare-backed tools for the Manufacturing District.

## Default Stack

```text
Frontend: Cloudflare Pages
APIs: Cloudflare Workers
Storage: R2
Database: D1
Async jobs: Queues
Multi-step jobs: Workflows
Stateful sessions: Durable Objects
AI routing: AI Gateway
Security: Turnstile + Secrets
```

## BougieBackdrop Tool Classes

```json
{
  "agent_id": "bougie_backdrop_agent",
  "runtime": "cloudflare",
  "district": "manufacturing",
  "allowed_tool_classes": [
    "r2_image_upload",
    "r2_image_export",
    "d1_listing_metadata",
    "workflow_listing_pipeline",
    "queue_batch_image_processing",
    "ai_gateway_vision",
    "ai_gateway_copywriting",
    "turnstile_upload_protection"
  ],
  "approval_required_for": [
    "marketplace_publish",
    "bulk_crosslist",
    "price_change",
    "inventory_delete",
    "payment_action"
  ],
  "blocked_actions": [
    "silent_publish",
    "condition_hiding",
    "fake_branding",
    "fake_authentication_claim",
    "wallet_or_payment_execution"
  ]
}
```

## API Contract Draft

```text
POST /api/listings/intake
POST /api/images/upload
POST /api/workflows/bougiebackdrop/start
GET  /api/listings/:id
POST /api/listings/:id/approve
GET  /api/listings/:id/export
```

## Required Logs

Every workflow writes provenance events to D1:

- listing created
- original photo uploaded
- AI vision run
- listing copy drafted
- background variant generated
- TrustVerifier result
- human approval
- export created

## TrustVerifier Gate

Before an output moves to export:

1. Original photo exists in R2.
2. Safe Vinted version exists.
3. No product truth rules failed.
4. User approved selected image pack.
5. Listing copy includes disclosure notes when defects are visible.

## Anti-Moloch Guardrail

Cloudflare tooling is fast enough to scale mistakes.

Every write action must be observable, reversible when possible, and approved before external marketplace impact.
