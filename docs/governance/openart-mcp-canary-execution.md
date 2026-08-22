# OpenArt MCP — Bounded Single-Image CANARY Execution Evidence

**Status:** CANARY_EXECUTION = VERIFIED (governance record; NOT a standing write grant)
**Provider:** openart-mcp
**Executed:** 2026-08-22 (single human-authorized invocation)
**Forensically verified:** 2026-08-22 (read-only post-canary verification)
**Verified by:** neuro-hermes-strategist (mission-control)
**Public receipt provenance:** `wiredchaos/tasks/verification/openart-post-canary-forensic-receipt-neuro.md`
(sanitized public copy; raw evidence retained only in private evidence storage).

---

## Purpose

Records the bounded single-image OpenArt CANARY as completed and forensically
verified, WITHOUT granting standing write authority. The write corridor is
VERIFIED for one bounded, human-authorized single job only. The default
invocation gate remains CLOSED; autonomous invocation remains NOT AUTHORIZED.

---

## Execution record (sanitized)

| Field | Value |
|---|---|
| Authorization | HUMAN_SINGLE_INVOCATION (explicit) |
| Invocation count | exactly 1 |
| Model / mode | kling-3-omni / text2image |
| Requested images | 1 (imageCount=1, resultType=single) |
| Returned assets | exactly 1 image |
| Quoted cost | 10 credits |
| Actual charge | 10 credits (quote matched exactly) |
| Execution status | COMPLETED |
| Retry | NONE (0) |
| Fallback model | NONE |
| Provider switch | NONE |
| Second invocation | NONE |
| seriesAmount finding | seriesAmount=4 inert under resultType=single |
| Lane state after canary | GATED |
| LIVE | UNARMED |

## seriesAmount resolution

Schema (kling-3-omni text2image): `seriesAmount` (integer, default 4, 2-9) is
the candidate count used ONLY when `resultType='series'`. Under
`resultType='single'` (the canary's shape) it is inert: exactly one asset was
returned and exactly the quoted 10 credits were charged — no hidden candidates,
no extra outputs, no additional billable generations.

## Forensic cross-check (read-only)

- Creation history (`hasMore=false`) shows exactly ONE creation attributable to
  the canary (kling-3-omni, text2image, canary prompt, 1 resource).
- A separate unrelated `create-pano` creation exists in the account history —
  different tool/model, no canary prompt, created after the canary — NOT
  attributable to this canary.
- Single PENDING → COMPLETED lifecycle; no re-invocation evidence.

## Write corridor disposition

- Bounded single-job CANARY write corridor: **VERIFIED**
- Standing write authority: **NOT_GRANTED**
- Autonomous invocation: **NOT_AUTHORIZED**
- Default invocation gate: **CLOSED** (unchanged)
- Any further generation requires a new explicit human authorization + budget
  envelope.

## 54-T disposition

- One bounded, human-authorized invocation; no additional spend; no hidden
  operation; exact charge matched the quote; lane returned to GATED; LIVE
  UNARMED. 54-T consent, scope, and audit requirements satisfied for this
  single job only.

## Skill Install Assurance findings (preserved)

- No skill installed (MCP provider verification).
- Closed-object (`additionalProperties:false`) input contracts and discoverable
  cost matrix confirmed — PASS for discovery.
- Write/generative tools remain human-authorized + budget-gated.

## AGENT-MCP lifecycle state (resulting)

- Authentication = VERIFIED
- Discovery = VERIFIED (16-tool manifest, hash recorded)
- Read capability = VERIFIED
- Bounded single-job CANARY execution = VERIFIED
- Generative/write capability = CONDITIONAL + GATED
- LIVE = UNARMED
- Runtime/server ID = UNKNOWN (not exposed; not fabricated)
- Autonomous invocation = NOT_AUTHORIZED

Sanitization: no account email, UID, balances, OAuth material, full CDN URLs,
or credentials are recorded here. Provenance links reference sanitized receipts
only.
