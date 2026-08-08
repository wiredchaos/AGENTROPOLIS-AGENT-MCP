# J-SPACE ∞ — WikiVault Cognitive Commons

**Status:** Feature branch implementation
**Layer:** Agentropolis Layer 1 / Intelligence Grid infrastructure
**Authority:** READ_ONLY public MCP surface

## Purpose

J-SPACE ∞ is the model-agnostic deliberation layer that sits above the AGENTROPOLIS knowledge substrate. It does not replace WikiVault, Obsidian, llm-wiki, gbrain, HERMES, or the Intelligence Observatory. It composes them.

The design goal is to answer a harder question than retrieval: **which evidence, minds, specialist agents, conflicting frameworks, and historical analogies deserve scarce cognitive bandwidth for this problem right now?**

## Canonical stack

```text
SOURCE ADAPTERS
  GitHub / local files / uploads / browser evidence / ledgers / databases
        |
        v
INGEST MEMBRANE
  quarantine / secrets / prompt injection / MIME / namespace policy
        |
        v
WIKIVAULT — CANONICAL EVIDENCE SUBSTRATE
  evidence.jsonl
  canon.jsonl
  entities + relationships
  conflicts + review queue
  provenance + hashes
  checkpoints + receipts
        |
        +-------------------------+
        |                         |
        v                         v
OBSIDIAN NODE VAULT           PORTABLE EXPORTS
human-editable memory         RAG / graph / HERMES / MCP
        |                         |
        v                         |
LLM-WIKI RETRIEVAL <-------------+
        |
        v
GBRAIN ONTOLOGY
holders / claims / relationships / confidence / evidence links
        |
        v
J-SPACE ∞ COGNITIVE COMMONS
  router
  Mind Vault
  specialist lenses
  attention market
  cognitive assembly
  collision engine
  Heretic slot
  Meta-J audit
        |
        v
SYNTHESIS
        |
        v
ASBE / AEGIS POLICY GATE
        |
        v
HUMAN APPROVAL WHEN REQUIRED
        |
        v
SEPARATE EXECUTION CORRIDOR
        |
        v
RECEIPT + OUTCOME FEEDBACK
```

## Storage law

WikiVault remains the canonical machine-readable evidence substrate. Obsidian is the human-editable interface. llm-wiki is retrieval. gbrain is structured attributed knowledge. J-SPACE is a **derived deliberation surface**.

A J-SPACE synthesis cannot silently become canon. Any proposed write-back must remain a reviewable artifact until it passes the appropriate authority gate.

## WikiVault bridge

J-SPACE consumes WikiVault records with their authority intact. Deliberation packets should preserve, when available:

- namespace
- record ID
- source type and source
- Git ref / commit
- file path and line range
- observed timestamp
- content hash and file hash
- canon status
- evidence state
- confidence
- conflict/review references
- retrieval scope

Supported evidence states remain distinct: `PLANNED`, `IMPLEMENTED`, `DEPLOYED`, `OBSERVED`, `VERIFIED`, and `UNVERIFIED`.

Retrieval scopes remain distinct: `DEFAULT`, `ARCHIVE`, `REVIEW`, and `SECURITY_ONLY`. `SECURITY_ONLY` evidence must not enter ordinary councils unless an authorized security workflow explicitly requests it.

## Obsidian + llm-wiki

Obsidian is the human-editable node vault. It is appropriate for canon locks, doctrine, character sheets, architecture decisions, operating notes, and reviewed memory. It is not automatic evidence that a feature is deployed.

The llm-wiki layer indexes the vault and related project knowledge for search and retrieval. Cross-node sharing should preserve source identity and namespace boundaries rather than flattening every node into one global text heap.

## gbrain

gbrain provides the ontology beneath deliberation. Holder paths may include:

```text
brain
self
world
people/<slug>
agents/<slug>
projects/<slug>
districts/<slug>
```

Supported claim kinds include:

```text
fact
take
doctrine
decision
bet
hunch
relationship
evidence
confidence
```

The graph should make disagreement first-class. Competing claims are related, attributed, and preserved rather than collapsed into a single averaged statement.

## Mind Vault — 200+ source-backed minds

The historical 200-mind roster is a separately versioned dataset and must be rehydrated from the original source rather than reconstructed from memory.

Each mind profile is a reasoning lens, not an impersonation. Required fields include:

```yaml
identity:
era:
disciplines: []
first_principles: []
reasoning_methods: []
decision_methods: []
problem_decomposition: []
mental_models: []
documented_positions: []
major_works: []
primary_sources: []
historical_context:
known_criticisms: []
strong_domains: []
weak_domains: []
disagreement_map: []
influenced_by: []
influenced: []
confidence:
provenance: []
evidence_state:
```

### Prohibited Mind Vault behavior

- fabricated quotations
- invented positions
- identity impersonation
- authority based only on fame
- presenting inferred reasoning as documented belief
- pretending the roster has been recovered when it has not

## Attention market

The router selects a small council rather than loading the whole vault. Candidate lenses compete on dimensions such as:

```text
domain fit
evidence fit
contradiction value
novelty
historical task performance
confidence
context cost
```

Fame and popularity are not scoring dimensions.

## Cognitive assembly

A council is a temporary problem-specific assembly. Typical slots include first principles, systems, empirical/base-rate analysis, operations, governance, history, risk, cross-domain reasoning, economics, technical feasibility, and human factors.

The exact human or agent lens occupying a slot must be resolved against the versioned Mind Vault, specialist agents, gbrain graph, and permitted evidence at runtime.

## Heretic slot

When enabled, the final council slot is reserved for the strongest relevant counter-position. Its job is to surface contradictory evidence, minority models, hidden assumptions, failure cases, and independent intellectual lineages.

The Heretic is not contrarian theater. Its output must be evidence-aware and attributable.

## Meta-J

Meta-J audits the assembly rather than adding another ordinary opinion. It checks:

- selection bias
- lineage redundancy
- missing evidence
- unresolved conflicts
- confidence inflation
- consensus collapse
- ignored falsifiers
- authority creep
- whether multiple apparent experts are merely repeating the same source lineage or base model

## MCP tools

The feature branch adds four public read-only tools:

- `get_jspace_manifest`
- `get_wikivault_jspace_bridge`
- `assemble_cognitive_council`
- `get_mind_vault_contract`

Direct API views are available at:

```text
GET /api/jspace?view=manifest
GET /api/jspace?view=wikivault
GET /api/jspace?view=mind-vault
```

Council assembly is MCP-only because it accepts a bounded problem statement and optional domain hints.

## Security and authority invariants

1. Public J-SPACE tools are READ_ONLY.
2. J-SPACE cannot grant itself or another agent additional authority.
3. No raw secrets, credentials, bearer tokens, or private keys enter deliberation records.
4. Hidden chain-of-thought and private model activations are not exposed.
5. WikiVault `SECURITY_ONLY` records stay isolated from ordinary retrieval.
6. Canon conflicts are surfaced, not silently resolved.
7. Every successful public J-SPACE tool call receives a D1 execution receipt when persistence is available.
8. Execution remains a separate authenticated corridor governed by existing Agentropolis policy.

## Current implementation state

| Component | State |
|---|---|
| WikiVault architecture + MCP contract | specified |
| WikiVault portable evidence/graph/RAG demo | validated in demo |
| Obsidian node-vault doctrine | present; deployment must be verified per node |
| llm-wiki doctrine | present; index deployment must be verified per node |
| gbrain ontology doctrine | present; graph deployment must be verified per node |
| 200+ Mind Vault schema | implemented |
| exact historical 200-mind roster | rehydration required |
| J-SPACE MCP tool definitions | implemented on feature branch |
| council assembly planner | implemented on feature branch |
| live Mind Vault resolution | next implementation stage |
| outcome-weighted routing | next implementation stage |

## Next build stage

1. Locate and import the exact historical 200-mind roster with source provenance.
2. Create a versioned `mind-vault/` dataset using `people/<slug>` IDs.
3. Build a WikiVault export adapter that emits J-SPACE deliberation packets.
4. Connect the deployed gbrain namespace and llm-wiki index after verification.
5. Add evidence-aware lens resolution and diversity scoring.
6. Record council selection, predictions, synthesis, decision, and observed outcomes.
7. Learn task-specific routing weights without allowing outcome statistics to erase minority or safety-critical perspectives.

**Core law:** ALL MINDS VALID does not mean all claims are equally supported. Evidence, provenance, uncertainty, disagreement, and outcomes determine influence.
