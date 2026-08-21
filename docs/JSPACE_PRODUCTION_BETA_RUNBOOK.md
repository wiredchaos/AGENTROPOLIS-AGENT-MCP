# JSpace Production Beta Runbook

## Purpose
This runbook defines the release gates for JSpace Neural Fabric record-level memory projection. JSpace is a derived spatial surface over the Intelligence Grid. WikiVault remains canonical evidence authority; Obsidian remains durable human-readable memory; gBRAIN remains rebuildable derived cognition.

## Release classes
- SOURCE_GREEN: validation, unit tests, secret scan, Wrangler dry-run green.
- UI_BETA_GREEN: GitHub Pages deployment green and browser remains read-only.
- PROD_OPS_GREEN: rollback pointer, revision history, freshness detection, and receipts are present and regression-tested.
- WORKER_BETA_GREEN: Cloudflare Worker deployed, D1 migrations applied, health/manifest/projection endpoints verified.
- DATA_BETA_GREEN: first validated WikiVault bundle synced through the operator-only projection corridor and read back with matching revision.
- PRODUCTION_BETA_GREEN: all above plus rollback drill, stale-projection detection, abuse tests, and receipt verification.

## Mandatory gates
1. No SECURITY_ONLY Memory Object may appear in the public projection.
2. JSpace may only persist DERIVED_READ_ONLY_PROJECTION snapshots.
3. No JSpace path may promote canon, mutate WikiVault, or write directly to gBRAIN.
4. Browser UI may issue GET only to JSpace runtime endpoints.
5. Operator sync requires sealed bearer capability and emits a receipt.
6. Projection revisions are content-addressed and immutable; active pointer may move only to a validated revision.
7. A failed projection sync must leave the prior active revision intact.
8. ETag/304 behavior must avoid unnecessary payload transfer.
9. Visual salience/Torque is never displayed as epistemic truth.
10. Challenged/conflicted records remain visibly distinguishable from verified records.
11. Stale projection state must be explicit and never silently presented as fresh telemetry.
12. Rollback may change only the active derived-cache pointer; it must not edit or delete snapshots.

## Beta test matrix
### Contract
- valid projection accepted
- duplicate node IDs rejected
- unknown edge endpoints rejected
- node/edge ceilings enforced
- confidence and Torque outside 0..1 rejected
- secret-like fields rejected
- SECURITY_ONLY nodes removed and resulting orphan edges removed

### Authority
- anonymous projection sync denied
- invalid operator token denied
- public projection GET allowed
- public response advertises read-only authority
- sync receipt uses ALLOW_DERIVED_CACHE_WRITE only
- history and activate endpoints require operator authorization
- activate receipt uses ALLOW_DERIVED_CACHE_POINTER_WRITE only

### Resilience
- no projection returns NO_PROJECTION_AVAILABLE, not fabricated data
- D1 read failure degrades without canon mutation
- malformed JSON rejected
- failed sync never swaps active revision
- identical projection produces deterministic revision hash
- stale browser ETag receives fresh payload only when revision changes
- projection older than JSPACE_PROJECTION_MAX_AGE_SECONDS reports STALE_DERIVED_PROJECTION
- invalid or missing projection timestamps fail closed to STALE_UNKNOWN_AGE

### Observability
- every projection read receives execution receipt when D1 is available
- every projection sync receives execution receipt
- every rollback pointer activation receives execution receipt
- revision, source, sourceRevision, node/edge counts and timestamps are observable without exposing raw secrets
- operator history lists bounded revision metadata but not raw snapshot payloads

### Rollback
Rollback is pointer-based and is now implemented through the operator-only `POST /api/jspace/projection/activate` endpoint. The operator supplies a previously validated revision returned by `GET /api/jspace/projection/history`. Activation changes only `jspace_projection_state.active_revision`; it never rewrites WikiVault, Obsidian, gBRAIN, or a stored projection snapshot. The action emits an `ALLOW_DERIVED_CACHE_POINTER_WRITE` receipt. Never delete the failed snapshot during incident response.

Rollback drill:
1. Record the current active revision from the projection response.
2. Sync a known-good test revision and verify read-back.
3. Use projection history to locate the prior validated revision.
4. Activate the prior revision through the operator endpoint.
5. GET the public projection and verify the ETag/revision match the rollback target.
6. Confirm the rollback receipt persisted and no canonical memory mutation occurred.

## Go / no-go
GO requires SOURCE_GREEN + UI_BETA_GREEN + PROD_OPS_GREEN + WORKER_BETA_GREEN + DATA_BETA_GREEN and zero unresolved critical authority/security findings.

NO-GO if Cloudflare credentials are absent, migrations are not verified, production endpoint reports INVALID_VIEW for projection, receipts fail unexpectedly, SECURITY_ONLY leakage occurs, browser mutation capability appears, or stale data is presented as live.

## Current external gate
The Cloudflare Production Deploy workflow requires sealed GitHub production-environment secrets CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID. Credentials must never be copied into source, issues, prompts, logs, or memory records.
