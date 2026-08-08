export const OBSERVATORY_VIEWS = ["topology", "thermodynamics", "memory_evolution", "skill_development"];

export const OBSERVATORY_TOOLS = [
  tool("get_agentropolis_topology", "Get Agentropolis Topology", "Return the governed city topology, node registry, and connection map."),
  tool("get_agentropolis_thermodynamics", "Get Agentropolis Thermodynamics", "Return receipt-aware energy, entropy, drift, friction, and stability indicators."),
  tool("get_agentropolis_memory_evolution", "Get Agentropolis Memory Evolution", "Return the governed memory-layer model, provenance coverage, confidence, and contradiction indicators."),
  tool("get_agentropolis_skill_development", "Get Agentropolis Skill Development", "Return the capability progression, verification gates, and citizenship-readiness model."),
  {
    name: "get_agentropolis_observatory_snapshot",
    title: "Get Agentropolis Observatory Snapshot",
    description: "Return one or every Intelligence Observatory view through a single read-only MCP call.",
    annotations: annotations(),
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: { view: { type: "string", enum: ["all", ...OBSERVATORY_VIEWS], default: "all" } }
    }
  }
];

function annotations() {
  return { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
}

function tool(name, title, description) {
  return { name, title, description, annotations: annotations(), inputSchema: { type: "object", additionalProperties: false, properties: {} } };
}

export function observatoryViewForTool(name, args = {}) {
  if (name === "get_agentropolis_topology") return "topology";
  if (name === "get_agentropolis_thermodynamics") return "thermodynamics";
  if (name === "get_agentropolis_memory_evolution") return "memory_evolution";
  if (name === "get_agentropolis_skill_development") return "skill_development";
  if (name === "get_agentropolis_observatory_snapshot") return args.view || "all";
  return null;
}

export function validateObservatoryArguments(toolDefinition, args) {
  if (!args || typeof args !== "object" || Array.isArray(args)) return "arguments must be an object";
  const allowed = new Set(Object.keys(toolDefinition.inputSchema.properties || {}));
  for (const key of Object.keys(args)) if (!allowed.has(key)) return `unexpected argument: ${key}`;
  if (toolDefinition.name === "get_agentropolis_observatory_snapshot" && args.view !== undefined && !["all", ...OBSERVATORY_VIEWS].includes(args.view)) return "invalid observatory view";
  return null;
}

export function buildObservatorySnapshot(view, districts, runtime = null) {
  const normalized = view || "all";
  const metadata = {
    identity: "AGENTROPOLIS Intelligence Observatory",
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    authority: "READ_ONLY",
    telemetryState: runtime?.receiptCount > 0 ? "receipt-backed-observability" : "canonical-baseline",
    liveTelemetry: Boolean(runtime?.receiptCount > 0),
    source: runtime?.receiptCount > 0
      ? ["canonical district registry", "D1 execution receipt aggregates"]
      : ["canonical district registry"],
    caution: runtime?.receiptCount > 0
      ? "Operational indicators are derived from bounded execution receipts, not hidden chain-of-thought or private model state."
      : "This is a reference baseline. It must not be represented as live production telemetry until receipt-backed data is available."
  };
  if (normalized === "all") {
    return {
      ...metadata,
      view: "all",
      views: Object.fromEntries(OBSERVATORY_VIEWS.map((item) => [item, buildView(item, districts, runtime)]))
    };
  }
  if (!OBSERVATORY_VIEWS.includes(normalized)) throw new Error("Unknown observatory view");
  return { ...metadata, view: normalized, data: buildView(normalized, districts, runtime) };
}

function buildView(view, districts, runtime) {
  if (view === "topology") return topology(districts, runtime);
  if (view === "thermodynamics") return thermodynamics(districts, runtime);
  if (view === "memory_evolution") return memoryEvolution(districts, runtime);
  return skillDevelopment(districts, runtime);
}

function topology(districts, runtime) {
  const infrastructure = [
    ["runtime", "Agent Runtime"], ["memory", "Memory Layer"], ["skills", "Skill Registry"],
    ["dispatch", "Dispatch Protocol"], ["membrane", "MCP Capability Membrane"], ["ledger", "Receipt Ledger"]
  ];
  const nodes = [{ id: "grid-core", label: "GRID CORE", type: "core", depth: 0, authority: "GOVERNED" }];
  infrastructure.forEach(([id, label], index) => nodes.push({ id, label, type: "infrastructure", depth: 1, authority: "READ_ONLY", heat: score(label, "heat", 15, 48), index }));
  districts.forEach((district, index) => nodes.push({
    id: slug(district.name), label: district.name, type: "district", depth: 2,
    domain: district.domain, role: district.role, authority: district.authority,
    heat: score(district.name, "heat", 20, 82), stability: score(district.name, "stable", 72, 98), index
  }));
  const edges = infrastructure.map(([id]) => ({ source: "grid-core", target: id, relation: "governs" }));
  districts.forEach((district, index) => {
    const primary = infrastructure[index % infrastructure.length][0];
    const secondary = infrastructure[(index + 2) % infrastructure.length][0];
    edges.push({ source: primary, target: slug(district.name), relation: "serves" });
    edges.push({ source: secondary, target: slug(district.name), relation: "audits" });
  });
  return {
    summary: {
      nodeCount: nodes.length, edgeCount: edges.length, districtCount: districts.length,
      connectedComponents: 1, receiptCount: runtime?.receiptCount || 0,
      averageDegree: Number((edges.length * 2 / nodes.length).toFixed(2))
    },
    nodes, edges,
    runtime: compactRuntime(runtime)
  };
}

function thermodynamics(districts, runtime) {
  const receiptPulse = Math.min(18, Math.log2((runtime?.receiptCount || 0) + 1) * 2.5);
  const perDistrict = districts.map((district) => {
    const energyIn = score(district.name, "energy", 48, 94) + receiptPulse;
    const friction = score(district.name, "friction", 7, 34);
    const entropyRate = Number((score(district.name, "entropy", 8, 37) / 100).toFixed(2));
    const drift = score(district.name, "drift", 3, 29);
    const valueOut = Math.max(20, Math.round(energyIn * (1 - friction / 145) * (1 - entropyRate / 2.4)));
    const stability = Math.max(0, Math.min(100, Math.round(100 - friction * .48 - drift * .35 - entropyRate * 24)));
    return { district: district.name, energyIn: Math.round(energyIn), computeLoad: Math.round(energyIn * .72), valueOut, friction, entropyRate, drift, stability };
  });
  return {
    summary: {
      energyIn: average(perDistrict, "energyIn"), valueOut: average(perDistrict, "valueOut"),
      coordinationFriction: average(perDistrict, "friction"), entropyRate: average(perDistrict, "entropyRate", 2),
      drift: average(perDistrict, "drift"), stabilityIndex: average(perDistrict, "stability"),
      avgToolDurationMs: runtime?.avgDurationMs || 0
    },
    perDistrict,
    runtime: compactRuntime(runtime),
    thresholds: { stable: 80, elevatedFriction: 30, highEntropyRate: .35, driftReview: 25 }
  };
}

function memoryEvolution(districts, runtime) {
  const pulse = Math.min(500, runtime?.receiptCount || 0);
  const layers = [
    { id: "L0", label: "CORE", age: "foundational", count: 96 + districts.length, color: "#00e5ff" },
    { id: "L1", label: "EARLY", age: "1-7 days", count: 148 + Math.round(pulse * .08), color: "#536dfe" },
    { id: "L2", label: "DEVELOPING", age: "8-30 days", count: 224 + Math.round(pulse * .14), color: "#9d4edd" },
    { id: "L3", label: "RECENT", age: "31-180 days", count: 312 + Math.round(pulse * .2), color: "#ff2bd6" },
    { id: "L4", label: "NEWEST", age: "current cycle", count: 86 + Math.round(pulse * .3), color: "#d7ff3f" }
  ];
  const clusters = districts.map((district) => ({
    district: district.name,
    episodic: score(district.name, "episodic", 22, 58), semantic: score(district.name, "semantic", 18, 46),
    procedural: score(district.name, "procedural", 10, 34), constitutional: score(district.name, "constitutional", 7, 22),
    confidence: Number((score(district.name, "confidence", 78, 98) / 100).toFixed(2)),
    provenanceCoverage: score(district.name, "provenance", 76, 100), contradictions: score(district.name, "contradictions", 0, 5)
  }));
  return {
    summary: {
      totalMemories: layers.reduce((sum, layer) => sum + layer.count, 0),
      averageConfidence: average(clusters, "confidence", 2),
      provenanceCoverage: average(clusters, "provenanceCoverage"),
      contradictions: clusters.reduce((sum, item) => sum + item.contradictions, 0),
      archived: Math.round(layers.reduce((sum, layer) => sum + layer.count, 0) * .09)
    },
    layers, clusters,
    memoryTypes: ["episodic", "semantic", "procedural", "constitutional"],
    promotionFlow: ["capture", "validate", "link", "consolidate", "govern", "promote or quarantine"],
    runtime: compactRuntime(runtime)
  };
}

function skillDevelopment(districts, runtime) {
  const stages = [
    ["observation", "Observation"], ["training", "Training"], ["sandbox", "Sandbox Testing"],
    ["council", "Council Review"], ["bounded", "Bounded Deployment"], ["verified", "Verified Competence"]
  ].map(([id, label], index) => ({ id, label, order: index + 1, gate: index < 4 ? "evidence-required" : "approval-required" }));
  const citizenship = ["Spawned Agent", "Apprentice", "Worker", "Specialist", "Naturalized Citizen", "Council-Eligible"];
  const perDistrict = districts.map((district) => ({
    district: district.name,
    observation: score(district.name, "obs", 78, 100), training: score(district.name, "train", 58, 94),
    sandbox: score(district.name, "sandbox", 44, 88), councilReview: score(district.name, "council", 35, 82),
    boundedDeployment: score(district.name, "bounded", 28, 76), verifiedCompetence: score(district.name, "verified", 18, 68),
    readiness: score(district.name, "readiness", 42, 86)
  }));
  return {
    summary: {
      trackedCapabilities: districts.length * 14 + (runtime?.toolCalls?.length || 0),
      verifiedCapabilities: perDistrict.reduce((sum, item) => sum + Math.round(item.verifiedCompetence / 10), 0),
      averageReadiness: average(perDistrict, "readiness"),
      approvalState: "human-governed",
      selfPromotionAllowed: false
    },
    stages, citizenship, perDistrict,
    doctrine: "Agents may propose progression. Only governed evidence, sandbox results, council review, and authority policy may promote capability or citizenship.",
    runtime: compactRuntime(runtime)
  };
}

function compactRuntime(runtime) {
  if (!runtime) return {
    receiptCount: 0, avgDurationMs: 0, lastReceiptAt: null, toolCalls: [],
    observationWindow: { windowHours: 24, maxReceipts: 1000, truncated: false }
  };
  return {
    receiptCount: Number(runtime.receiptCount || 0),
    avgDurationMs: Number(runtime.avgDurationMs || 0),
    lastReceiptAt: runtime.lastReceiptAt || null,
    toolCalls: Array.isArray(runtime.toolCalls) ? runtime.toolCalls.slice(0, 12) : [],
    observationWindow: runtime.observationWindow || {
      windowHours: Number(runtime.windowHours || 24),
      maxReceipts: Number(runtime.maxReceipts || 1000),
      truncated: Boolean(runtime.truncated)
    }
  };
}

function average(items, key, precision = 0) {
  if (!items.length) return 0;
  const value = items.reduce((sum, item) => sum + Number(item[key] || 0), 0) / items.length;
  return Number(value.toFixed(precision));
}

function score(value, salt, min, max) {
  let hash = 2166136261;
  const text = `${value}:${salt}`;
  for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  const ratio = (hash >>> 0) / 4294967295;
  return Math.round(min + ratio * (max - min));
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
