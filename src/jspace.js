const DEFAULT_COUNCIL_SIZE = 7;
const MAX_COUNCIL_SIZE = 12;

export const JSPACE_LAYERS = Object.freeze({
  evidence: ["WikiVault evidence records", "canon records", "provenance", "conflicts", "review queue"],
  human_editable: ["Obsidian vault", "local node wiki", "idea/capability files"],
  retrieval: ["llm-wiki index", "RAG chunks", "archive/review/security retrieval scopes"],
  ontology: ["gbrain entities", "relationships", "claims", "confidence", "evidence links"],
  cognition: ["Mind Vault", "lens router", "attention market", "cognitive assembly", "collision engine", "Heretic slot", "Meta-J"],
  governance: ["AEGIS / 54-T / Policy-Risk gate", "ASBE for Agentic Studios workloads only", "authority profile", "human approval", "execution receipts"]
});

export const JSPACE_INVARIANTS = Object.freeze([
  "WikiVault evidence remains canonical storage; J-Space produces derived deliberation artifacts.",
  "Obsidian is human-editable memory, not automatic proof of deployment or truth.",
  "gbrain claims must retain provenance, confidence, holder identity, and evidence state.",
  "Mind profiles are source-backed reasoning lenses, not simulated identities or claims of consciousness.",
  "Reference-list membership, page order, rank, fame, or intelligence estimates do not grant routing or execution authority.",
  "The router may select minds and lenses but cannot increase execution authority.",
  "The Heretic slot is reserved for the strongest relevant counter-position when available.",
  "Meta-J audits selection bias, missing evidence, consensus collapse, uncertainty, and unresolved conflicts.",
  "General governance routes through AEGIS / 54-T / Policy-Risk; ASBE applies only when the workload belongs to Agentic Studios.",
  "No raw secrets, hidden chain-of-thought, private model activations, or credentials are exposed.",
  "All public MCP operations remain READ_ONLY and receipt-backed."
]);

export const JSPACE_TOOLS = [
  {
    name: "get_jspace_manifest",
    title: "Get J-Space Cognitive Commons Manifest",
    description: "Return the governed J-Space architecture connecting WikiVault, Obsidian, llm-wiki, gbrain, the Mind Vault, deliberation, and policy gates.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: {} }
  },
  {
    name: "get_wikivault_jspace_bridge",
    title: "Get WikiVault to J-Space Bridge",
    description: "Describe how provenance-backed WikiVault records become bounded retrieval and deliberation inputs without mutating canon.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: {} }
  },
  {
    name: "assemble_cognitive_council",
    title: "Assemble a J-Space Cognitive Council",
    description: "Create a bounded, evidence-aware council plan for a problem using domain lenses, disagreement requirements, and a mandatory Heretic slot. This returns a plan only; it does not impersonate people or execute actions.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        problem: { type: "string", minLength: 1, maxLength: 8000 },
        domains: { type: "array", maxItems: 12, items: { type: "string", maxLength: 120 } },
        councilSize: { type: "integer", minimum: 3, maximum: MAX_COUNCIL_SIZE, default: DEFAULT_COUNCIL_SIZE },
        requireHeretic: { type: "boolean", default: true }
      },
      required: ["problem"]
    }
  },
  {
    name: "get_mind_vault_contract",
    title: "Get Mind Vault Contract",
    description: "Return the source-backed schema and governance contract for the uncapped Mind Vault source union.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: {} }
  }
];

export function jspaceManifest() {
  return {
    name: "J-SPACE INFINITY / Cognitive Commons",
    role: "Model-agnostic deliberation layer above the provenance-backed knowledge substrate",
    authority: "READ_ONLY",
    placement: "Agentropolis Layer 1 / Intelligence Grid infrastructure",
    layers: JSPACE_LAYERS,
    flow: [
      "source adapters",
      "ingest membrane",
      "WikiVault evidence/canon separation",
      "Obsidian and node wiki",
      "llm-wiki retrieval",
      "gbrain ontology",
      "J-Space router",
      "Mind Vault and specialist lenses",
      "attention market",
      "cognitive assembly",
      "collision + Heretic",
      "Meta-J audit",
      "synthesis",
      "AEGIS / 54-T / Policy-Risk gate",
      "ASBE when Agentic Studios governance applies",
      "human approval when required",
      "execution corridor",
      "receipt",
      "outcome feedback"
    ],
    invariants: JSPACE_INVARIANTS,
    integrationState: {
      wikivault: "SPECIFIED_AND_DEMO_VALIDATED",
      portableEvidenceGraphRagExports: "DEMO_VALIDATED",
      obsidianNodeVault: "DOCTRINE_PRESENT_VERIFY_PER_NODE",
      llmWikiIndex: "DOCTRINE_PRESENT_VERIFY_PER_NODE",
      gbrainOntology: "DOCTRINE_PRESENT_VERIFY_PER_NODE",
      mindVault200PlusRoster: "SUPERSEDED_BY_SOURCE_UNION",
      mindVaultPopulationPolicy: "SOURCE_UNION_UNCAPPED",
      mindVaultSourceRegistry: "HMOLPEDIA_PLUS_EDINFORMATICS_CONFIGURED",
      mindVaultSourceIngest: "INGESTER_IMPLEMENTED_DATA_REFRESH_REVIEW_REQUIRED",
      jspaceMcpSurface: "IMPLEMENTED_IN_SOURCE_DEPLOYMENT_UNVERIFIED"
    }
  };
}

export function wikivaultJspaceBridge() {
  return {
    canonicalStorage: "WikiVault evidence/canon/graph/conflict/review records",
    derivedSurfaces: ["Obsidian views", "llm-wiki index", "RAG chunks", "HERMES views", "MCP views", "J-Space deliberation packets"],
    acceptedEvidenceStates: ["PLANNED", "IMPLEMENTED", "DEPLOYED", "OBSERVED", "VERIFIED", "UNVERIFIED"],
    retrievalScopes: ["DEFAULT", "ARCHIVE", "REVIEW", "SECURITY_ONLY"],
    jspaceRules: [
      "Never convert retrieval relevance into canon authority.",
      "Carry namespace, source, ref, commit/path/line where available, timestamp, hash, confidence, and evidence state into deliberation packets.",
      "Expose unresolved conflicts to Meta-J and the Heretic slot instead of silently resolving them.",
      "Keep SECURITY_ONLY evidence out of ordinary council prompts unless an authorized security workflow requests it.",
      "Write-back from deliberation is a proposal/review artifact only until explicitly approved through a separate mutation corridor."
    ]
  };
}

export function mindVaultContract() {
  return {
    namespace: "people/<slug>",
    populationPolicy: "SOURCE_UNION_UNCAPPED",
    scaleTarget: "No fixed ceiling; ingest approved source populations and append new source-backed identities.",
    sourceRegistry: "mind-vault/sources/manifest.json",
    initialProfileState: "UNENRICHED",
    sourceMembershipDoesNotImplyAuthority: true,
    purpose: "Store attributable reasoning methods and documented intellectual positions for selective use as cognitive lenses.",
    prohibited: [
      "identity impersonation",
      "fabricated quotations",
      "invented beliefs",
      "automatic authority from fame",
      "routing authority from reference-list rank or intelligence estimates",
      "treating source membership as Cognitive DNA",
      "treating inference as documented fact"
    ],
    requiredFields: [
      "identity",
      "era",
      "disciplines",
      "first_principles",
      "reasoning_methods",
      "decision_methods",
      "problem_decomposition",
      "mental_models",
      "documented_positions",
      "major_works",
      "primary_sources",
      "historical_context",
      "known_criticisms",
      "strong_domains",
      "weak_domains",
      "disagreement_map",
      "influenced_by",
      "influenced",
      "confidence",
      "provenance",
      "evidence_state"
    ],
    claimKinds: ["fact", "take", "doctrine", "decision", "bet", "hunch", "relationship", "evidence", "confidence"],
    sourceMembershipFields: ["identity", "aliases", "source_id", "source_url", "source_position", "observed_at", "content_hash", "evidence_state"],
    enrichmentRule: "Reference-list membership creates an identity seed only. Cognitive DNA requires separate evidence from primary or high-quality secondary sources.",
    routingPrinciple: "Select the smallest diverse council that maximizes domain fit, evidence fit, contradiction value, novelty, historical task performance, confidence, and context efficiency under the context budget."
  };
}

function uniqueStrings(values = []) {
  return [...new Set(values.map((v) => String(v || "").trim()).filter(Boolean))];
}

export function assembleCognitiveCouncil({ problem, domains = [], councilSize = DEFAULT_COUNCIL_SIZE, requireHeretic = true }) {
  const normalizedDomains = uniqueStrings(domains).slice(0, 12);
  const size = Math.min(MAX_COUNCIL_SIZE, Math.max(3, Number(councilSize) || DEFAULT_COUNCIL_SIZE));
  const slots = [];
  const baseRoles = [
    ["first_principles", "Reduce the problem to assumptions, constraints, and causal mechanisms."],
    ["systems", "Map feedback loops, dependencies, second-order effects, and failure propagation."],
    ["empirical", "Demand current evidence, base rates, tests, and falsifiable predictions."],
    ["operator", "Translate the idea into execution constraints, sequencing, and measurable outcomes."],
    ["ethics_governance", "Test rights, incentives, power concentration, externalities, and authority boundaries."],
    ["historical_analog", "Search for relevant precedents, recurring patterns, and context mismatches."],
    ["cross_domain", "Import a useful model from a different discipline to challenge local assumptions."],
    ["risk", "Model downside, adversarial behavior, fragility, and irreversible failure."],
    ["user_human", "Test usability, accessibility, incentives, and likely human behavior."],
    ["economics", "Inspect resource allocation, incentives, opportunity cost, and market structure."],
    ["technical", "Test feasibility, interfaces, performance, security, and implementation constraints."]
  ];
  const normalSlots = requireHeretic ? size - 1 : size;
  for (let i = 0; i < normalSlots; i += 1) {
    const [role, mandate] = baseRoles[i % baseRoles.length];
    slots.push({ slot: i + 1, role, mandate, selection: "Resolve to one or more source-backed Mind Vault or specialist lenses at runtime; do not fabricate a person." });
  }
  if (requireHeretic) {
    slots.push({ slot: size, role: "HERETIC", mandate: "Find the strongest relevant counter-position, minority model, contradictory evidence, or failure case. Agreement is not a selection criterion.", selection: "Prefer a genuinely independent framework and surface its provenance and uncertainty." });
  }
  return {
    problem: String(problem || "").trim(),
    domains: normalizedDomains,
    councilSize: size,
    authority: "READ_ONLY",
    status: "ASSEMBLY_PLAN",
    slots,
    attentionMarket: {
      scoreDimensions: ["domain_fit", "evidence_fit", "contradiction_value", "novelty", "historical_task_performance", "confidence", "context_cost"],
      rule: "Reference-list position, intelligence estimates, fame, or popularity alone cannot increase selection score."
    },
    metaJAudit: ["selection bias", "lineage redundancy", "missing evidence", "unresolved conflicts", "confidence inflation", "consensus collapse", "falsifiers", "authority creep"],
    nextStep: "Resolve slots against the versioned Mind Vault, WikiVault evidence, gbrain relationships, specialist agents, and live sources permitted by policy; then synthesize with citations and confidence."
  };
}
