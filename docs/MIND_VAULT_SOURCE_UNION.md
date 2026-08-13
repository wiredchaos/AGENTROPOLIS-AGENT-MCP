# Mind Vault Source Union

**Status:** source registry and ingester implemented; generated corpus requires review before promotion

**Namespace:** `people/<slug>`

**Population policy:** `SOURCE_UNION_UNCAPPED`

**Authority:** reference membership only; no execution authority

## Purpose

The Mind Vault is no longer a fixed 200-person roster. It is an uncapped, provenance-backed population of human intellectual references that J-SPACE may selectively resolve into cognitive lenses after evidence enrichment.

The population layer answers only: **which identity was observed in which approved reference source?**

It does not answer: **which person is smarter, correct, authoritative, safe, or appropriate for this task?** Those are separate evidence and routing questions.

## Initial source registry

The registry lives at `mind-vault/sources/manifest.json`.

Initial approved seed sources:

1. **Hmolpedia historical minds reference corpus**
   - source page: `Top_2000_minds_(full_list)`
   - reference methodology page: `Top_2000_minds_(reference_lists)`
   - retained fields: identity name, source-local position when observed, source URL, observation time, transport, and content hash
   - source-local ordering remains attributed metadata only

2. **EDinformatics Great Thinkers**
   - source page: `great_thinkers/`
   - retained fields: identity name, source URL, observation time, transport, and content hash
   - page order is not treated as ranking

Future approved reference lists may be appended without changing the population contract.

## Three-stage identity model

### Stage 1 — source membership

A source observation creates or updates a neutral record:

```json
{
  "id": "people/example-person",
  "identity": "Example Person",
  "aliases": [],
  "evidence_state": "OBSERVED_SOURCE_MEMBERSHIP",
  "cognitive_dna_state": "UNENRICHED",
  "sources": []
}
```

Source membership is evidence of list inclusion only.

### Stage 2 — identity reconciliation

Names are normalized to stable slugs. Exact aliases may be mapped only after review. Ambiguous collisions remain in `review.jsonl` rather than being silently merged.

The reconciliation layer should eventually use identifiers such as Wikidata QIDs, VIAF, ORCID, ISNI, or other appropriate authority records when available. No external identifier automatically grants canon authority.

### Stage 3 — Cognitive DNA enrichment

Only after identity reconciliation may a mind receive evidence-backed fields such as:

- era
- disciplines
- first principles
- reasoning methods
- decision methods
- problem decomposition
- mental models
- documented positions
- major works
- primary sources
- historical context
- known criticisms
- strong and weak domains
- disagreement map
- influence graph
- confidence
- provenance
- evidence state

A reference list alone cannot populate these fields.

## Ingest corridor

```text
APPROVED SOURCE REGISTRY
        |
        v
FETCH / FALLBACK TRANSPORT
        |
        v
UNTRUSTED SOURCE TEXT
        |
        v
INGEST MEMBRANE
        |
        v
SOURCE MEMBERSHIP PARSER
        |
        v
IDENTITY NORMALIZATION
        |
        +---- ambiguous collision ---> REVIEW QUEUE
        |
        v
people/<slug> EVIDENCE SEED
        |
        v
SEPARATE COGNITIVE-DNA ENRICHMENT
        |
        v
WIKIVAULT / GBRAIN
        |
        v
J-SPACE ROUTER
```

## Completeness law

The ingester must never convert a partial crawl into a complete corpus silently.

`scripts/ingest-mind-vault.mjs` emits source diagnostics and marks a run incomplete when observed coverage falls below the configured source thresholds. The thresholds are crawl-health checks, not statements that a third-party source is objectively complete.

The Hmolpedia source itself may evolve and may contain numbering irregularities, duplicates, re-ranks, or delayed updates. These remain source facts to reconcile, not defects to erase automatically.

## Routing law

J-SPACE does not route by reference-list fame, popularity, list position, or other source prestige proxies.

Council selection should depend on evidence-backed features such as:

- task/domain fit
- evidence fit
- documented reasoning method
- contradiction value
- intellectual-lineage diversity
- historical task performance inside Agentropolis
- confidence and evidence quality
- context cost

The Heretic slot and Meta-J audit remain mandatory safeguards against prestige convergence and intellectual monoculture.

## Governance

- WikiVault remains the canonical evidence substrate.
- gbrain remains rebuildable attributed graph/index state.
- J-SPACE remains derived deliberation.
- AEGIS / 54-T / Policy-Risk govern general authority boundaries.
- ASBE is invoked only for Agentic Studios workloads.
- Generated population records are review artifacts until promoted.
- No mind profile receives execution authority from its inclusion in the vault.
- No hidden chain-of-thought, private model activation, credential, or secret is stored.

## Run

```bash
node scripts/ingest-mind-vault.mjs
```

Expected reviewable outputs:

```text
mind-vault/data/minds.jsonl
mind-vault/data/review.jsonl
mind-vault/data/run-manifest.json
```

**Core law:** `ALL MINDS VALID` means perspectives may be considered. It does not mean source lists, claims, or people are equally supported, equally relevant, or equally authoritative.
