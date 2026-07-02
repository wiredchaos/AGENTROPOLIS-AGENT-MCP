# BougieBackdrop Agent MCP Notes

## Purpose

BougieBackdrop Agent is the first Manufacturing District worker for Bad n Bougie Vintage.

It uses governed tools to turn raw Vinted product photos into marketplace-ready image packs and listing copy while preserving buyer trust.

## MCP Boundary

The MCP layer may route tools for:

- background removal
- background generation
- image export
- metadata writing
- folder creation
- marketplace listing draft creation
- provenance logging

The MCP layer must not silently publish, purchase, delete, or modify marketplace listings without explicit user approval.

## Tool Classes

```json
{
  "agent_id": "bougie_backdrop_agent",
  "district": "manufacturing",
  "allowed_tool_classes": [
    "image_background_removal",
    "image_generation",
    "image_export",
    "metadata_write",
    "listing_copy_draft",
    "folder_batch_export"
  ],
  "approval_required_for": [
    "marketplace_publish",
    "price_change",
    "inventory_delete",
    "bulk_listing_update",
    "payment_or_checkout"
  ],
  "blocked_actions": [
    "fake_brand_creation",
    "condition_hiding",
    "tag_alteration",
    "designer_label_fabrication",
    "automatic_marketplace_publish_without_approval"
  ]
}
```

## Required Verification

Every image workflow should log:

- original image reference
- background preset used
- whether the item pixels were preserved
- visible flaws retained
- safe marketplace version created
- export sizes created
- human approval status

## Default Export Set

```text
/item-name/
  original/
  clean-marketplace/
  matte-black-boutique/
  gold-vintage-studio/
  neon-pink-cyan-glow/
  retro-cyber-closet/
  safe-vinted-version/
  listing-copy.md
  provenance.json
```

## Anti-Moloch Policy

Image tools are useful but untrusted.

The verifier must protect the buyer, the seller, and the brand by preventing misleading product representation.
