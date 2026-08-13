# Mind Vault Reference Registry

**Status:** source registry implemented

**Population policy:** source-union, no fixed ceiling

**Authority:** reference discovery only

## Purpose

The Mind Vault may draw candidate research targets from multiple approved public reference sources without treating any source as canon or authority.

The registry is intentionally separate from durable mind profiles. A source may identify a candidate for later research, but it does not automatically create a Cognitive DNA record, grant routing weight, or grant execution authority.

## Initial sources

The machine-readable registry lives at `mind-vault/sources/manifest.json` and currently includes the two public reference URLs supplied by the operator.

Each registered source retains:

- source identifier
- source URL
- source type
- allowed ingest fields
- trust policy

The allowed ingest fields are limited to source identity/name and source URL. Source-specific profile, ordering, demographic, score, or other evaluative fields are outside this registry.

## Expansion law

The registry has no numeric ceiling. Additional approved reference sources may be appended without changing the Mind Vault contract.

```text
APPROVED REFERENCE SOURCE
        |
        v
UNTRUSTED EVIDENCE
        |
        v
WIKIVAULT / INGEST MEMBRANE
        |
        v
CANDIDATE RESEARCH TARGET
        |
        v
SEPARATE EVIDENCE ENRICHMENT
        |
        v
HUMAN REVIEW
        |
        v
MIND PROFILE
        |
        v
GBRAIN / J-SPACE RETRIEVAL
```

## Governance

1. Reference membership is not canon.
2. Reference membership is not Cognitive DNA.
3. Durable profiles require separate evidence and review.
4. Ambiguous identity resolution stays in review.
5. J-SPACE remains read-only and cannot elevate its own authority.
6. General authority enforcement belongs to AEGIS / 54-T / Policy-Risk.
7. ASBE applies only to Agentic Studios workloads.
8. No secrets, hidden chain-of-thought, or private model state enter the registry.

**Core law:** a source tells Agentropolis where to look, not what to believe.
