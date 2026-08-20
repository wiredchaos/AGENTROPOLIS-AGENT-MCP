# JSpace Production Beta Runbook

## Purpose
This runbook defines the release gates for JSpace Neural Fabric record-level memory projection. JSpace is a derived spatial surface over the Intelligence Grid. WikiVault remains canonical evidence authority; Obsidian remains durable human-readable memory; gBRAIN remains rebuildable derived cognition.

## Release classes
- SOURCE_GREEN: validation, unit tests, secret scan, Wrangler dry-run green.
- UI_BETA_GREEN: GitHub Pages deployment green and browser remains read-only.
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

### Resilience
- no projection returns NO_PROJECTION_AVAILABLE, not fabricated data
- D1 read failure degrades without canon mutation
- malformed JSON rejected
- failed sync never swaps active revision
- identical projection produces deterministic revision hash
- stale browser ETag receives fresh payload only when revision changes

### Observability
- every projection read receives execution receipt when D1 is available
- every projection sync receives execution receipt
- revision, source, sourceRevision, node/edge counts and timestamps are observable without exposing raw secrets

### Rollback
Rollback is pointer-based. Preserve prior snapshots. To roll back, select a previously validated projection revision through the future operator rollback action; until that action is implemented, rollback is performed by re-syncing the prior validated source export. Never delete the failed snapshot during incident response.

## Go / no-go
GO requires SOURCE_GREEN + UI_BETA_GREEN + WORKER_BETA_GREEN + DATA_BETA_GREEN and zero unresolved critical authority/security findings.

NO-GO if Cloudflare credentials are absent, migrations are not verified, production endpoint reports INVALID_VIEW for projection, receipts fail unexpectedly, SECURITY_ONLY leakage occurs, or browser mutation capability appears.

## Current external gate
The Cloudflare Production Deploy workflow requires sealed GitHub production-environment secrets CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID. Credentials must never be copied into source, issues, prompts, logs, or memory records.
