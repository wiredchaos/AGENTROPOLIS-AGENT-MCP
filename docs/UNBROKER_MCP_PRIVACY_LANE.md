# UNBROKER MCP Privacy Lane

UNBROKER is a Hermes skill for autonomous personal-data broker discovery and removal.

Install path:

```bash
hermes update
hermes skills install official/security/unbroker
```

## MCP Role

AGENTROPOLIS-AGENT-MCP treats UNBROKER as a governed privacy tool lane, not an unrestricted crawler.

```text
privacy request
  -> consent check
  -> data minimization check
  -> jurisdiction selection
  -> broker scan authorization
  -> removal action authorization
  -> verification handling
  -> receipt log
  -> re-scan schedule
```

## Required Gates

UNBROKER-style workflows require stricter gates because they may process sensitive personal data.

- Explicit human consent before scanning.
- No silent collection of extra identity attributes.
- Local-first storage preferred.
- Encryption at rest for dossiers when supported.
- Opaque IDs in filenames and logs.
- No raw PII in shared traces.
- Manual review for hard CAPTCHA, government ID, notarized proof, or broker-specific identity challenges.
- Audit receipts for every submitted removal.

## Tool Authority Levels

```text
READ_ONLY_SCAN
  Search broker surfaces and generate findings.

DRAFT_ONLY
  Prepare deletion emails or form payloads without submitting.

ASSISTED_SUBMIT
  Submit only after human confirmation.

AUTO_SUBMIT_LOW_RISK
  Submit to approved broker forms with bounded fields and audit receipts.

VERIFY_AND_RESCAN
  Open verification links, check disappearance, and schedule future scans.
```

## Human Digest

Any item the agent cannot safely complete should be returned as a human digest:

```text
broker
reason
required action
risk level
deadline if applicable
proof needed
```

## Disallowed Without Explicit Approval

- Uploading identity documents.
- Sharing full dossiers with third-party services.
- Sending requests that include unnecessary sensitive attributes.
- Storing webmail passwords.
- Publishing broker findings publicly.
- Running scans for another person without confirmed authority.

## Receipt Shape

```json
{
  "workflow": "unbroker_privacy_lane",
  "state": "SUBMITTED",
  "broker": "example_broker",
  "jurisdiction": "CCPA_CPRA",
  "submitted_at": "ISO-8601",
  "operator_approved": true,
  "pii_redacted": true,
  "next_check_at": "ISO-8601"
}
```
