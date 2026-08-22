# OpenArt MCP — Governance Verification Evidence

**Status:** Recorded (verification metadata for governance; NOT an eligibility grant)
**Provider:** openart-mcp
**Verified by:** neuro-hermes-strategist (mission-control)
**Recorded:** 2026-08-20
**Evidence source:** sanctioned discovery / introspection only (no generation invoked)
**Public receipt provenance:** `wiredchaos/tasks/verification/openart-mcp-verification-receipt.md`
(sanitized public copy; sensitive account values retained only in private evidence
storage — never reproduced in a public repository).

---

## Purpose

This document records the verified discovery evidence for the OpenArt MCP provider
so it can be promoted into governance repositories WITHOUT granting eligibility.
Verification of *discovery/read* surfaces is distinct from authorization for
*write/generative* surfaces. This record keeps that separation explicit and
enforceable: the readiness registry surfaces this evidence as metadata and does
NOT flip the provider to eligible.

---

## Recorded verification state

| Surface | State | Evidence |
|---|---|---|
| Authentication | VERIFIED | OAuth 2.1 PKCE (code_challenge_method=S256), scope=full_access |
| Discovery / tool manifest | VERIFIED | 16 tools enumerated; manifest SHA-256 recorded below |
| Read capability | VERIFIED | 11 read-only tools exercised during introspection |
| Machine-readable schema | VERIFIED | draft-07 closed-object (`additionalProperties:false`) schemas per model/mode |
| Manifest hash | recorded | `dc2a73275cd0c59acf477eb5228ec34a2178580cce8b98cb8ca369239e3d44e5` (sorted 16-tool names) |
| Runtime / server ID | UNKNOWN | server does not expose one; NOT fabricated |
| Write / generative readiness | CONDITIONAL | gated pending human authorization + budget envelope |
| Provider invocation | GATED | no generative/workspace/upload write invoked |

---

## Tool inventory classification (16 tools)

| Class | Count | Tools |
|---|---|---|
| READ_ONLY | 11 | account_get, project_list, model_list, model_cost, model_form_get, creation_get, creation_show, creation_wait, creation_list, upload_list, upload_metadata_get |
| GENERATIVE_WRITE | 2 | generate_image, generate_video |
| WORKSPACE_WRITE | 1 | project_create |
| UPLOAD_WRITE | 2 | upload_sign, upload_pick |
| DESTRUCTIVE | 0 | — |
| UNKNOWN | 0 | — |

Manifest SHA-256 (sorted 16-tool names):
`dc2a73275cd0c59acf477eb5228ec34a2178580cce8b98cb8ca369239e3d44e5`

---

## Zero-credit-spend & no-generation findings

- Credits spent during verification: **0**. Account balance unchanged.
- Generations invoked during verification: **none**. Only read-only introspection
  tools were called (account_get, model_list, project_list, upload_list,
  creation_list, model_form_get, model_cost).
- No OpenArt tool was invoked for this governance promotion.

---

## 54-T disposition

- READ-ONLY + INTROSPECTION permitted.
- Generative / workspace / upload write tools remain **DENIED until explicit
  human authorization + budget gate**, per AGENTROPOLIS 54-T enforcement.
- No credits spent; no CANARY/LIVE arming.

---

## Skill Install Assurance disposition

- No skill installed (MCP provider verification, not a skill import).
- OpenArt tools expose closed-object (`additionalProperties:false`) input
  contracts and a discoverable cost matrix — favourable for safe integration.
- **PASS for discovery**; GENERATIVE/WORKSPACE/UPLOAD write tools remain gated.

---

## AGENT-MCP readiness disposition

- Read-only tools (11): **VERIFIED** — ready for discovery / monitoring.
- Write / generative tools (generate_image, generate_video, project_create,
  upload_sign, upload_pick): **CONDITIONAL** — ready only under human approval
  + credit budget envelope.
- Provider invocation: **GATED**. Not CANARY/LIVE armed. No generation invoked.
- OpenArt remains **CONDITIONAL for write/generative capabilities**.

---

## Provenance

- Discovered via `hermes mcp add openart --url https://mcp.openart.ai/mcp --auth oauth`
  (2026-08-20). 16 tools discovered, all enabled.
- Config persisted at `hermes profiles/neuro/config.yaml` (openart block).
- Introspection calls used only read-only tools.
- Sanitized public receipt: `wiredchaos/tasks/verification/openart-mcp-verification-receipt.md`.
  Sensitive raw evidence (account email / UID / exact balance / OAuth material)
  is retained ONLY in private evidence storage and is NOT reproduced here.
