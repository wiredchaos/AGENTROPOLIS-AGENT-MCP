// HERMES Execution Discipline Observatory — governed READ_ONLY observability tools.
// Canon: docs/HERMES_EXECUTION_DISCIPLINE_AND_CONTEXT_GOVERNOR.md (wiredchaos/agentropolis).
// Contracts: execution-state.schema.json, context-budget.schema.json,
// verification-receipt.schema.json, thermodynamic-metrics.schema.json,
// optimization-profile.schema.json (wiredchaos/agentropolis/contracts).
//
// TRUTH DISCIPLINE: this surface never fabricates live telemetry. When live data is
// absent it returns explicit NOT_CONFIGURED / UNVERIFIED / canonical-baseline states
// with null values. No numbers are invented. No secrets are echoed back.

const CONTEXT_COMPONENT_KEYS = [
  "runtime_context_limit",
  "system_instruction_tokens",
  "tool_schema_tokens",
  "active_task_tokens",
  "reserved_output_tokens",
  "safety_headroom_tokens"
];

const CONTEXT_COMPONENT_LABELS = {
  runtime_context_limit: "Runtime Context Limit",
  system_instruction_tokens: "System Instructions",
  tool_schema_tokens: "Tool Schemas",
  active_task_tokens: "Active Task State",
  reserved_output_tokens: "Reserved Output Capacity",
  safety_headroom_tokens: "Safety Headroom"
};

export const DISCIPLINE_TOOLS = [
  {
    name: "get_context_floor_status",
    title: "Get Context Floor Status",
    description: "Return the effective context budget for a model runtime using the canonical Context Floor Governor formula (runtime - system - tools - active - reserved - safety) with GREEN/AMBER/RED/CRITICAL health states.",
    annotations: annotations(),
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: contextComponentSchema()
    }
  },
  {
    name: "get_execution_plan_status",
    title: "Get Execution Plan Status",
    description: "Return the governed execution-plan state for a task: task class, plan verification, retry budget, and the canonical execution flow.",
    annotations: annotations(),
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: { task_id: idSchema("Canonical task identifier."), plan_id: idSchema("Canonical plan identifier.") }
    }
  },
  {
    name: "get_task_verification_status",
    title: "Get Task Verification Status",
    description: "Return verification status for a task: verification state and the seven-element task-complete evidence checklist. Generated output is not completed work.",
    annotations: annotations(),
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: { task_id: idSchema("Canonical task identifier."), plan_id: idSchema("Canonical plan identifier.") }
    }
  },
  {
    name: "get_thermodynamic_metrics",
    title: "Get Thermodynamic Metrics",
    description: "Return the ten canonical thermodynamic measurements (token energy, compute energy, context churn, coordination friction, semantic drift, memory entropy, correction load, compression loss, tool failure heat, useful work ratio). Unmeasured metrics are reported UNKNOWN, never estimated.",
    annotations: annotations(),
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: { task_id: idSchema("Canonical task identifier.") }
    }
  },
  {
    name: "list_approved_optimization_profiles",
    title: "List Approved Optimization Profiles",
    description: "List governed, hardware-specific optimization profiles from the optimization profile registry, filtered by model family, approval state, or profile class.",
    annotations: annotations(),
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        model_family: { type: "string", maxLength: 128, description: "Model family filter." },
        approval_state: { type: "string", enum: ["PROPOSED", "EXPERIMENTAL", "APPROVED", "RETIRED"], description: "Approval state filter (defaults to APPROVED)." },
        profile_class: { type: "string", enum: ["CANONICAL_FINAL", "FAST_DRAFT", "PORTABLE_DRAFT", "NATIVE_PREVIEW", "LOW_VRAM_EXPERIMENTAL", "BALANCED_LOCAL", "WORKSTATION", "CLOUD_FINAL"], description: "Profile class filter." }
      }
    }
  },
  {
    name: "validate_execution_receipt",
    title: "Validate Execution Receipt",
    description: "Validate a verification receipt against the canonical verification-receipt contract. Fails closed on malformed receipts and reports uncertainty when evidence is incomplete.",
    annotations: annotations(),
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: { receipt: { type: "object", description: "Verification receipt to validate against the canonical contract." } },
      required: ["receipt"]
    }
  },
  {
    name: "assess_context_pressure",
    title: "Assess Context Pressure",
    description: "Assess context pressure from the canonical budget formula and return the overflow-protocol response: freeze dispatch, checkpoint, compact, or resume.",
    annotations: annotations(),
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: contextComponentSchema()
    }
  },
  {
    name: "explain_task_blocker",
    title: "Explain Task Blocker",
    description: "Reason about why a task is blocked and return a classification (BLOCKED, AWAITING_APPROVAL, FAILED_SAFE, NONE_DETECTED, UNVERIFIED) with explicit uncertainty when the cause is not determinable.",
    annotations: annotations(),
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        task_id: idSchema("Canonical task identifier."),
        plan_id: idSchema("Canonical plan identifier."),
        evidence: {
          type: "object",
          additionalProperties: false,
          properties: {
            approval_state: { type: "string", enum: ["PENDING", "APPROVED", "DENIED"] },
            risk_level: { type: "string", enum: ["low", "moderate", "high", "critical"] },
            retry_count: { type: "integer", minimum: 0 },
            max_retries: { type: "integer", minimum: 0 },
            dead_letter: { type: "boolean" },
            safety_block: { type: "boolean" },
            approval_required: { type: "boolean" }
          }
        }
      }
    }
  }
];

function contextComponentSchema() {
  const schema = {};
  for (const key of CONTEXT_COMPONENT_KEYS) schema[key] = { type: "integer", minimum: 0, maximum: 100000000, description: `Optional ${CONTEXT_COMPONENT_LABELS[key]} override in tokens.` };
  return schema;
}

function idSchema(description) {
  return { type: "string", pattern: "^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$", description };
}

// Canonical health-state thresholds as fractions of the runtime context limit.
// CRITICAL <= 10% or negative, RED <= 25%, AMBER <= 50%, else GREEN.
export const CONTEXT_BUDGET_THRESHOLDS = { critical: 0.1, red: 0.25, amber: 0.5 };

export const VERIFICATION_EVIDENCE_KEYS = [
  "expected_behavior_demonstrated",
  "tests_passed",
  "logs_inspected",
  "security_checks_passed",
  "regression_surface_reviewed",
  "artifact_recorded",
  "receipt_committed"
];

export const THERMODYNAMIC_METRICS = [
  { key: "token_energy", unit: "tokens_per_accepted_result", description: "Tokens consumed per accepted result." },
  { key: "compute_energy", unit: "accelerator_seconds_per_accepted_result", description: "CPU, GPU, accelerator time and energy per accepted result." },
  { key: "context_churn", unit: "context_reloads_per_task", description: "Context repeatedly loaded, summarized, discarded, or retrieved without contributing to accepted output." },
  { key: "coordination_friction", unit: "agent_roundtrips_per_task", description: "Resources spent routing, reconciling, waiting on, or correcting agents." },
  { key: "semantic_drift", unit: "deviation_ratio", description: "Deviation from the approved objective and constraints." },
  { key: "memory_entropy", unit: "conflict_count", description: "Duplication, contradiction, staleness, and unresolved conflicts in memory." },
  { key: "correction_load", unit: "rework_cycles_per_task", description: "Rework caused by preventable errors." },
  { key: "compression_loss", unit: "loss_ratio", description: "Decision-relevant information lost during context compaction." },
  { key: "tool_failure_heat", unit: "failed_calls_per_task", description: "Resource expenditure on failed calls and retries." },
  { key: "useful_work_ratio", unit: "ratio", description: "Verified accepted value divided by total resource expenditure." }
];

const OPTIMIZATION_PROFILE_CLASSES = [
  "CANONICAL_FINAL", "FAST_DRAFT", "PORTABLE_DRAFT", "NATIVE_PREVIEW",
  "LOW_VRAM_EXPERIMENTAL", "BALANCED_LOCAL", "WORKSTATION", "CLOUD_FINAL"
];
const OPTIMIZATION_APPROVAL_STATES = ["PROPOSED", "EXPERIMENTAL", "APPROVED", "RETIRED"];
const VERIFICATION_STATES = ["PENDING", "PASSED", "FAILED", "QUARANTINED", "RETURNED_FOR_CORRECTION"];
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

function annotations() {
  return { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
}

export function isDisciplineTool(name) {
  return DISCIPLINE_TOOLS.some((item) => item.name === name);
}

export function validateDisciplineArguments(toolDefinition, args) {
  if (!args || typeof args !== "object" || Array.isArray(args)) return "arguments must be an object";
  const allowed = new Set(Object.keys(toolDefinition.inputSchema.properties || {}));
  for (const key of Object.keys(args)) if (!allowed.has(key)) return `unexpected argument: ${key}`;
  for (const key of toolDefinition.inputSchema.required || []) if (!(key in args)) return `missing required argument: ${key}`;
  const name = toolDefinition.name;

  for (const key of ["task_id", "plan_id"]) {
    if (args[key] !== undefined && (typeof args[key] !== "string" || !ID_PATTERN.test(args[key]))) return `invalid ${key} format`;
  }

  if (name === "get_context_floor_status" || name === "assess_context_pressure") {
    const problem = validateContextComponents(args);
    if (problem) return problem;
  }

  if (name === "list_approved_optimization_profiles") {
    if (args.model_family !== undefined && (typeof args.model_family !== "string" || !args.model_family.trim() || args.model_family.length > 128)) return "model_family must be a non-empty string up to 128 characters";
    if (args.approval_state !== undefined && !OPTIMIZATION_APPROVAL_STATES.includes(args.approval_state)) return "invalid approval_state filter";
    if (args.profile_class !== undefined && !OPTIMIZATION_PROFILE_CLASSES.includes(args.profile_class)) return "invalid profile_class filter";
  }

  if (name === "validate_execution_receipt" && (args.receipt === null || typeof args.receipt !== "object" || Array.isArray(args.receipt))) return "receipt must be an object";

  if (name === "explain_task_blocker" && args.evidence !== undefined) {
    if (args.evidence === null || typeof args.evidence !== "object" || Array.isArray(args.evidence)) return "evidence must be an object";
    const allowedEvidence = new Set(["approval_state", "risk_level", "retry_count", "max_retries", "dead_letter", "safety_block", "approval_required"]);
    for (const key of Object.keys(args.evidence)) if (!allowedEvidence.has(key)) return `unexpected evidence field: ${key}`;
    if (args.evidence.approval_state !== undefined && !["PENDING", "APPROVED", "DENIED"].includes(args.evidence.approval_state)) return "invalid evidence.approval_state";
    if (args.evidence.risk_level !== undefined && !["low", "moderate", "high", "critical"].includes(args.evidence.risk_level)) return "invalid evidence.risk_level";
    for (const key of ["retry_count", "max_retries"]) if (args.evidence[key] !== undefined && (!Number.isInteger(args.evidence[key]) || args.evidence[key] < 0)) return `evidence.${key} must be a non-negative integer`;
    for (const key of ["dead_letter", "safety_block", "approval_required"]) if (args.evidence[key] !== undefined && typeof args.evidence[key] !== "boolean") return `evidence.${key} must be boolean`;
  }

  return null;
}

function validateContextComponents(args) {
  for (const key of CONTEXT_COMPONENT_KEYS) {
    const value = args[key];
    if (value === undefined) continue;
    if (!Number.isInteger(value) || value < 0 || value > 100_000_000) return `${key} must be a non-negative integer up to 100,000,000`;
  }
  return null;
}

export function buildDisciplineSnapshot(toolName, args = {}, runtime = null) {
  const receiptBacked = Boolean(runtime?.receiptCount > 0);
  const metadata = {
    identity: "HERMES Execution Discipline Observatory",
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    authority: "READ_ONLY",
    telemetryState: receiptBacked ? "receipt-backed-observability" : "canonical-baseline",
    source: receiptBacked
      ? ["HERMES Execution Discipline doctrine", "canonical contracts", "D1 execution receipt aggregates"]
      : ["HERMES Execution Discipline doctrine", "canonical contracts"],
    caution: "This surface is READ_ONLY observability. Absent data is reported as NOT_CONFIGURED or UNVERIFIED with null values; no numbers are estimated or fabricated."
  };
  const data = buildDisciplineData(toolName, args, runtime, metadata);
  return { ...metadata, tool: toolName, data };
}

function buildDisciplineData(toolName, args, runtime, metadata) {
  if (toolName === "get_context_floor_status") return contextFloor(args, runtime, metadata);
  if (toolName === "assess_context_pressure") return contextPressure(args, runtime, metadata);
  if (toolName === "get_execution_plan_status") return executionPlanStatus(args, runtime, metadata);
  if (toolName === "get_task_verification_status") return taskVerificationStatus(args, runtime, metadata);
  if (toolName === "get_thermodynamic_metrics") return thermodynamicMetrics(args, runtime, metadata);
  if (toolName === "list_approved_optimization_profiles") return optimizationProfiles(args, runtime, metadata);
  if (toolName === "validate_execution_receipt") return validateReceipt(args.receipt, runtime, metadata);
  if (toolName === "explain_task_blocker") return explainBlocker(args, runtime, metadata);
  throw new Error("Unknown discipline observatory tool");
}

function contextComponents(args, runtime) {
  const provided = {};
  for (const key of CONTEXT_COMPONENT_KEYS) {
    if (args[key] !== undefined) provided[key] = Number(args[key]);
  }
  const floor = runtime?.contextFloor;
  if (floor && typeof floor === "object") {
    for (const key of CONTEXT_COMPONENT_KEYS) {
      if (provided[key] === undefined && Number.isInteger(floor[key]) && floor[key] >= 0) provided[key] = Number(floor[key]);
    }
  }
  return provided;
}

function computeBudget(provided) {
  const runtimeLimit = provided.runtime_context_limit;
  const effective = runtimeLimit - provided.system_instruction_tokens - provided.tool_schema_tokens
    - provided.active_task_tokens - provided.reserved_output_tokens - provided.safety_headroom_tokens;
  return { runtimeLimit, effective };
}

function budgetState(effective, runtimeLimit) {
  if (!Number.isFinite(runtimeLimit) || runtimeLimit <= 0) return "NOT_CONFIGURED";
  const ratio = effective / runtimeLimit;
  if (effective < 0 || ratio <= CONTEXT_BUDGET_THRESHOLDS.critical) return "CRITICAL";
  if (ratio <= CONTEXT_BUDGET_THRESHOLDS.red) return "RED";
  if (ratio <= CONTEXT_BUDGET_THRESHOLDS.amber) return "AMBER";
  return "GREEN";
}

function contextFloor(args, runtime, metadata) {
  const provided = contextComponents(args, runtime);
  const present = CONTEXT_COMPONENT_KEYS.filter((key) => provided[key] !== undefined);
  const missing = CONTEXT_COMPONENT_KEYS.filter((key) => provided[key] === undefined);
  const base = {
    components: Object.fromEntries(CONTEXT_COMPONENT_KEYS.map((key) => [key, provided[key] ?? null])),
    componentLabels: CONTEXT_COMPONENT_LABELS,
    states: { GREEN: "Sufficient workspace for the approved task graph.", AMBER: "Checkpoint and offload before further dispatch.", RED: "Block execution until context is compacted, expanded, or partitioned.", CRITICAL: "Preserve state and restart from a clean governed checkpoint." },
    thresholds: { critical: "effective <= 10% of runtime limit or negative", red: "effective <= 25%", amber: "effective <= 50%", green: "effective > 50%" }
  };
  if (present.length < CONTEXT_COMPONENT_KEYS.length) {
    const dataState = present.length === 0 ? "NOT_CONFIGURED" : "UNVERIFIED";
    return {
      ...base,
      dataState,
      status: "NOT_CONFIGURED",
      statusDescription: dataState === "NOT_CONFIGURED"
        ? "No discovered context budget is available. The Context Floor Governor must measure the active model, runtime configuration, and tool payloads; a fixed value is never assumed."
        : `Context budget is only partially known; missing components: ${missing.map((key) => CONTEXT_COMPONENT_LABELS[key]).join(", ")}.`,
      effective_context_budget: null,
      ratio: null,
      missingComponents: missing,
      measuredAt: null
    };
  }
  const { runtimeLimit, effective } = computeBudget(provided);
  const ratio = Number((effective / runtimeLimit).toFixed(4));
  const live = Boolean(runtime?.contextFloor);
  const hasCallerOverrides = CONTEXT_COMPONENT_KEYS.some((key) => args[key] !== undefined);
  const dataState = hasCallerOverrides
    ? "CALLER_SUPPLIED_PROJECTION"
    : live
      ? (metadata.telemetryState === "receipt-backed-observability" ? "RECEIPT_BACKED" : "RUNTIME_DISCOVERED")
      : "NOT_CONFIGURED";
  return {
    ...base,
    dataState,
    status: budgetState(effective, runtimeLimit),
    statusDescription: budgetStateDescription(budgetState(effective, runtimeLimit)),
    effective_context_budget: effective,
    ratio,
    missingComponents: [],
    measuredAt: live ? (runtime?.contextFloor?.measuredAt || new Date().toISOString()) : null
  };
}

function budgetStateDescription(state) {
  const descriptions = {
    GREEN: "Sufficient workspace for the approved task graph.",
    AMBER: "Checkpoint and offload before further dispatch.",
    RED: "Block execution until context is compacted, expanded, or partitioned.",
    CRITICAL: "Preserve state and restart from a clean governed checkpoint.",
    NOT_CONFIGURED: "The context budget cannot be computed because the effective context budget is not discovered or fully supplied."
  };
  return descriptions[state];
}

function contextPressure(args, runtime, metadata) {
  const provided = contextComponents(args, runtime);
  const present = CONTEXT_COMPONENT_KEYS.filter((key) => provided[key] !== undefined);
  if (present.length < CONTEXT_COMPONENT_KEYS.length) {
    return {
      dataState: present.length === 0 ? "NOT_CONFIGURED" : "UNVERIFIED",
      pressure: "UNKNOWN",
      freezeDispatch: false,
      checkpointRequired: false,
      recommendation: "Context pressure cannot be assessed: the effective context budget is not discovered or fully supplied. Measure the runtime before dispatching non-trivial work.",
      ratio: null,
      missingComponents: CONTEXT_COMPONENT_KEYS.filter((key) => provided[key] === undefined)
    };
  }
  const { runtimeLimit, effective } = computeBudget(provided);
  const ratio = Number((effective / runtimeLimit).toFixed(4));
  const state = budgetState(effective, runtimeLimit);
  const live = Boolean(runtime?.contextFloor);
  const hasCallerOverrides = CONTEXT_COMPONENT_KEYS.some((key) => args[key] !== undefined);
  const dataState = hasCallerOverrides
    ? "CALLER_SUPPLIED_PROJECTION"
    : live
      ? (metadata.telemetryState === "receipt-backed-observability" ? "RECEIPT_BACKED" : "RUNTIME_DISCOVERED")
      : "NOT_CONFIGURED";
  const mapping = {
    GREEN: { pressure: "NONE", freezeDispatch: false, checkpointRequired: false, recommendation: "No context pressure detected. Resume normal dispatch within the approved task graph." },
    AMBER: { pressure: "MODERATE", freezeDispatch: false, checkpointRequired: false, recommendation: "Context pressure rising. Checkpoint and offload before further dispatch." },
    RED: { pressure: "HIGH", freezeDispatch: true, checkpointRequired: false, recommendation: "Context pressure high. Freeze new dispatch until context is compacted, expanded, or partitioned." },
    CRITICAL: { pressure: "CRITICAL", freezeDispatch: true, checkpointRequired: true, recommendation: "Context pressure critical. Preserve state and restart from a clean governed checkpoint." }
  };
  return {
    dataState,
    pressure: mapping[state].pressure,
    freezeDispatch: mapping[state].freezeDispatch,
    checkpointRequired: mapping[state].checkpointRequired,
    recommendation: mapping[state].recommendation,
    ratio,
    effective_context_budget: effective,
    overflowProtocol: ["freeze new dispatch", "write checkpoint", "extract stable facts", "attach provenance", "offload stable facts", "remove redundant state", "recalculate context floor", "resume from checkpoint"]
  };
}

function executionPlanStatus(args, runtime, metadata) {
  const plan = findRecord(runtime?.executionPlans, args, "task_id", "plan_id");
  if (plan) {
    return {
      dataState: "RECORD_FOUND",
      requested: { task_id: args.task_id || null, plan_id: args.plan_id || null },
      plan: sanitizeRecord(plan, ["task_id", "plan_id", "task_class", "state", "verified_plan_before_dispatch", "retry_count", "max_retries", "approval_receipt_ref", "dead_letter_evidence_ref", "created_at", "updated_at"]),
      canonicalFlow: ["RECEIVE", "CLASSIFY", "PLAN", "VERIFY_PLAN", "ALLOCATE_CONTEXT", "DISPATCH", "OBSERVE", "VERIFY", "COMMIT", "LEARN"],
      taskClasses: ["TRIVIAL", "MULTI_STEP", "ARCHITECTURAL", "HIGH_RISK_OR_IRREVERSIBLE", "FAILED_DRIFTING_OR_AMBIGUOUS"]
    };
  }
  const hasReference = Boolean(args.task_id || args.plan_id);
  return {
    dataState: hasReference ? "UNVERIFIED" : "CANONICAL_BASELINE",
    requested: { task_id: args.task_id || null, plan_id: args.plan_id || null },
    plan: null,
    state: "UNVERIFIED",
    stateDescription: hasReference
      ? "No execution-state record for the requested task or plan is available to this read-only surface. Do not assume a plan exists."
      : "No task was referenced. This is the canonical execution flow reference, not a live plan.",
    canonicalFlow: ["RECEIVE", "CLASSIFY", "PLAN", "VERIFY_PLAN", "ALLOCATE_CONTEXT", "DISPATCH", "OBSERVE", "VERIFY", "COMMIT", "LEARN"],
    taskClasses: ["TRIVIAL", "MULTI_STEP", "ARCHITECTURAL", "HIGH_RISK_OR_IRREVERSIBLE", "FAILED_DRIFTING_OR_AMBIGUOUS"],
    doctrine: "Non-trivial work is planned, bounded, observed, verified, receipted, and learned from before it is accepted. HERMES stops and re-plans when evidence contradicts the active plan."
  };
}

function taskVerificationStatus(args, runtime, metadata) {
  const record = findRecord(runtime?.verificationRecords, args, "task_id", "plan_id");
  if (record) {
    return {
      dataState: "RECORD_FOUND",
      requested: { task_id: args.task_id || null, plan_id: args.plan_id || null },
      verificationState: record.verification_state || "UNVERIFIED",
      taskComplete: completeness(record.task_complete_evidence),
      evidenceChecklist: checklist(record.task_complete_evidence),
      verifiedAt: record.verified_at || null,
      evidenceReferences: Array.isArray(record.evidence_references) ? record.evidence_references.slice(0, 50) : []
    };
  }
  const hasReference = Boolean(args.task_id || args.plan_id);
  return {
    dataState: hasReference ? "UNVERIFIED" : "CANONICAL_BASELINE",
    requested: { task_id: args.task_id || null, plan_id: args.plan_id || null },
    verificationState: "UNVERIFIED",
    taskComplete: null,
    evidenceChecklist: checklist(null),
    verifiedAt: null,
    evidenceReferences: [],
    doctrine: "TASK COMPLETE = expected behavior demonstrated + tests passed + logs inspected + security checks passed + regression surface reviewed + artifact recorded + receipt committed. Generated output is not completed work."
  };
}

function checklist(evidence) {
  return VERIFICATION_EVIDENCE_KEYS.map((key) => ({ item: key, required: true, value: evidence && typeof evidence === "object" ? (evidence[key] === undefined ? null : Boolean(evidence[key])) : null }));
}

function completeness(evidence) {
  if (!evidence || typeof evidence !== "object") return null;
  const values = VERIFICATION_EVIDENCE_KEYS.map((key) => evidence[key]);
  if (values.some((value) => typeof value !== "boolean")) return null;
  return values.every(Boolean);
}

function thermodynamicMetrics(args, runtime, metadata) {
  const measures = THERMODYNAMIC_METRICS.map(({ key, unit, description }) => ({
    metric: key,
    unit,
    description,
    value: null,
    state: "UNKNOWN",
    provenance: null
  }));
  return {
    dataState: "NOT_CONFIGURED",
    requestedTaskId: args.task_id || null,
    measures,
    measurementNote: "The thermodynamic measurement pipeline is not configured on this read-only surface. No metric values are estimated; unmeasured metrics are labeled UNKNOWN per the canonical contract.",
    runtime: compactRuntime(runtime),
    thresholds: { stable: 80, elevatedFriction: 30, highEntropyRate: 0.35, driftReview: 25 },
    doctrine: "The city measures the energetic cost of maintaining useful order, not merely task speed."
  };
}

function optimizationProfiles(args, runtime, metadata) {
  const registry = Array.isArray(runtime?.optimizationProfiles) ? runtime.optimizationProfiles : [];
  const approvalFilter = args.approval_state || "APPROVED";
  let profiles = registry.filter((profile) => profile && typeof profile === "object" && profile.approval_state === approvalFilter);
  if (args.model_family) profiles = profiles.filter((profile) => profile.model_family === args.model_family);
  if (args.profile_class) profiles = profiles.filter((profile) => profile.profile_class === args.profile_class);
  const filtered = profiles.map((profile) => sanitizeRecord(profile, ["profile_id", "profile_class", "model_family", "quality", "speed", "hardware", "policy_tradeoffs", "approval_state", "benchmark_state"]));
  return {
    dataState: filtered.length ? "REGISTRY_BACKED" : "NOT_CONFIGURED",
    filters: { model_family: args.model_family || null, approval_state: approvalFilter, profile_class: args.profile_class || null },
    optimizationPolicy: {
      canonical_profile_required: true,
      change_one_variable_at_a_time: true,
      compare_against_baseline: true,
      benchmark_per_device: true,
      reject_unverified_quality_regressions: true
    },
    profiles: filtered,
    routingReceipts: Array.isArray(runtime?.routingReceipts) ? runtime.routingReceipts.slice(0, 50) : [],
    note: filtered.length
      ? null
      : "No optimization profiles are registered in this read-only surface. Benchmarks are hardware-specific evidence, not universal guarantees; canonical final output remains the comparison baseline."
  };
}

function validateReceipt(receipt, runtime, metadata) {
  const reasons = [];
  const checks = [];
  if (receipt === null || typeof receipt !== "object" || Array.isArray(receipt)) {
    return {
      dataState: "FAIL_CLOSED",
      verdict: "INVALID",
      confidence: 0,
      taskComplete: null,
      summary: null,
      checks: [{ check: "receipt is an object", passed: false }],
      reasons: ["Receipt must be a JSON object."],
      note: "Malformed receipts are rejected without further processing."
    };
  }
  const required = ["schema_version", "verification_receipt_id", "task_id", "plan_id", "verification_state", "task_complete_evidence", "verified_at"];
  const missing = required.filter((key) => receipt[key] === undefined);
  checks.push({ check: "all required fields present", passed: missing.length === 0, detail: missing.length ? `missing: ${missing.join(", ")}` : null });
  if (missing.length) reasons.push(`Missing required field(s): ${missing.join(", ")}`);

  checks.push({ check: "schema_version is 1.0.0", passed: receipt.schema_version === "1.0.0", detail: receipt.schema_version === undefined ? null : String(receipt.schema_version) });
  if (receipt.schema_version !== undefined && receipt.schema_version !== "1.0.0") reasons.push("schema_version must be 1.0.0");

  checks.push({ check: "verification_state in canonical enum", passed: VERIFICATION_STATES.includes(receipt.verification_state), detail: receipt.verification_state === undefined ? null : String(receipt.verification_state) });
  if (receipt.verification_state !== undefined && !VERIFICATION_STATES.includes(receipt.verification_state)) reasons.push(`verification_state must be one of ${VERIFICATION_STATES.join(", ")}`);

  const evidence = receipt.task_complete_evidence;
  const evidenceOk = evidence && typeof evidence === "object" && !Array.isArray(evidence);
  const malformedEvidence = evidenceOk ? VERIFICATION_EVIDENCE_KEYS.filter((key) => evidence[key] !== undefined && typeof evidence[key] !== "boolean") : [];
  const missingEvidence = evidenceOk ? VERIFICATION_EVIDENCE_KEYS.filter((key) => evidence[key] === undefined) : VERIFICATION_EVIDENCE_KEYS;
  const evidenceMalformed = !evidenceOk || malformedEvidence.length > 0;
  checks.push({ check: "task_complete_evidence present", passed: evidenceOk });
  checks.push({ check: "all seven task-complete evidence booleans present", passed: evidenceOk && missingEvidence.length === 0, detail: evidenceOk && missingEvidence.length ? `missing: ${missingEvidence.join(", ")}` : null });
  checks.push({ check: "evidence booleans are well-formed", passed: !evidenceMalformed, detail: malformedEvidence.length ? `non-boolean: ${malformedEvidence.join(", ")}` : null });
  if (!evidenceOk) reasons.push("task_complete_evidence must be an object");
  else if (malformedEvidence.length) reasons.push(`Evidence malformed: non-boolean item(s): ${malformedEvidence.join(", ")}`);
  else if (missingEvidence.length) reasons.push(`Evidence incomplete: missing item(s): ${missingEvidence.join(", ")}`);

  let verifiedAtOk = true;
  if (receipt.verified_at !== undefined) {
    verifiedAtOk = typeof receipt.verified_at === "string" && !Number.isNaN(Date.parse(receipt.verified_at));
    checks.push({ check: "verified_at is an ISO date-time", passed: verifiedAtOk });
    if (!verifiedAtOk) reasons.push("verified_at must be an ISO 8601 date-time string");
  }

  let refsOk = true;
  if (receipt.evidence_references !== undefined) {
    refsOk = Array.isArray(receipt.evidence_references) && receipt.evidence_references.every((ref) => typeof ref === "string");
    checks.push({ check: "evidence_references is an array of strings", passed: refsOk });
    if (!refsOk) reasons.push("evidence_references must be an array of strings");
  }

  const structurallyValid = missing.length === 0
    && receipt.schema_version === "1.0.0"
    && VERIFICATION_STATES.includes(receipt.verification_state)
    && !evidenceMalformed
    && verifiedAtOk
    && refsOk;

  let verdict;
  let confidence;
  if (!structurallyValid) {
    verdict = "INVALID";
    confidence = 0;
    reasons.push("Receipt failed closed against the canonical verification-receipt contract.");
  } else if (receipt.verification_state === "PENDING" || missingEvidence.length > 0) {
    verdict = "INDETERMINATE";
    confidence = receipt.verification_state === "PENDING" ? 0.3 : 0.5;
    reasons.push(receipt.verification_state === "PENDING"
      ? "The task has not completed verification; the receipt is indeterminate."
      : "Evidence is incomplete; completion cannot be confirmed from this receipt.");
  } else {
    verdict = "VALID";
    confidence = 1;
    reasons.push("Receipt conforms to the canonical verification-receipt contract.");
  }

  return {
    dataState: verdict === "VALID" ? "CONFIRMED" : verdict === "INDETERMINATE" ? "UNCERTAIN" : "FAIL_CLOSED",
    verdict,
    confidence,
    taskComplete: structurallyValid && missingEvidence.length === 0 ? completeness(evidence) : null,
    summary: {
      verification_receipt_id: receipt.verification_receipt_id ?? null,
      task_id: receipt.task_id ?? null,
      plan_id: receipt.plan_id ?? null,
      verification_state: receipt.verification_state ?? null,
      verified_at: receipt.verified_at ?? null
    },
    checks,
    reasons,
    note: "Only summary fields of the supplied receipt are returned; receipt bodies are never echoed back."
  };
}

function explainBlocker(args, runtime, metadata) {
  const evidence = args.evidence || {};
  const signals = Object.keys(evidence);
  const hasTaskReference = Boolean(args.task_id || args.plan_id);
  const result = {
    requested: { task_id: args.task_id || null, plan_id: args.plan_id || null },
    signalsPresent: signals,
    evidence: { ...evidence }
  };

  if (evidence.safety_block === true) {
    return { ...result, classification: "FAILED_SAFE", uncertainty: 0.15, reason: "A safety slowdown was triggered. The task was stopped before any credential, wallet, payment, publish, or destructive path could be reached.", recommendedAction: "Preserve state and route through the safety review lane." };
  }
  if (evidence.approval_state === "DENIED") {
    return { ...result, classification: "BLOCKED", uncertainty: 0.1, reason: "The approval gate resolved to DENIED.", recommendedAction: "Stop and diagnose. Re-plan before any further dispatch." };
  }
  if ((evidence.risk_level === "critical" || evidence.risk_level === "high") && evidence.approval_state !== "APPROVED" && evidence.approval_required !== false) {
    return { ...result, classification: "AWAITING_APPROVAL", uncertainty: 0.25, reason: `Task risk is ${evidence.risk_level} and no approval receipt is confirmed. High-risk or irreversible tasks require an approval gate before dispatch.`, recommendedAction: "Hold dispatch until the approval gate resolves." };
  }
  if (evidence.retry_count !== undefined && evidence.max_retries !== undefined && evidence.retry_count >= evidence.max_retries) {
    return { ...result, classification: "BLOCKED", uncertainty: 0.2, reason: `Retry budget exhausted (${evidence.retry_count} of ${evidence.max_retries}).`, recommendedAction: "Stop, diagnose, and re-plan; do not continue consuming compute." };
  }
  if (evidence.dead_letter === true) {
    return { ...result, classification: "BLOCKED", uncertainty: 0.1, reason: "The task reached the dead-letter lane and its evidence was preserved.", recommendedAction: "Review the dead-letter evidence reference before re-planning." };
  }
  if (signals.length > 0) {
    return { ...result, classification: "NONE_DETECTED", uncertainty: 0.3, reason: "The supplied evidence contains no blocker indicators.", recommendedAction: "No blocker detected from the supplied signals; proceed only if the plan is verified." };
  }
  return {
    ...result,
    classification: "UNVERIFIED",
    uncertainty: hasTaskReference ? 0.9 : 1,
    reason: hasTaskReference
      ? "No execution-state record for the referenced task or plan is available to this read-only surface; the blocker cause cannot be determined."
      : "No task reference or evidence was supplied; the blocker cause cannot be determined.",
    recommendedAction: "Consult the execution-state record before proceeding. Do not assume the cause."
  };
}

function findRecord(records, args, taskKey, planKey) {
  if (!Array.isArray(records)) return null;
  const matches = records.filter((record) => record && typeof record === "object"
    && (args[taskKey] ? record[taskKey] === args[taskKey] : true)
    && (args[planKey] ? record[planKey] === args[planKey] : true));
  return matches[0] || null;
}

function sanitizeRecord(record, keys) {
  const out = {};
  for (const key of keys) if (record[key] !== undefined) out[key] = record[key];
  return out;
}

function compactRuntime(runtime) {
  if (!runtime) return { receiptCount: 0, avgDurationMs: 0, lastReceiptAt: null, toolCalls: [] };
  return {
    receiptCount: Number(runtime.receiptCount || 0),
    avgDurationMs: Number(runtime.avgDurationMs || 0),
    lastReceiptAt: runtime.lastReceiptAt || null,
    toolCalls: Array.isArray(runtime.toolCalls) ? runtime.toolCalls.slice(0, 12) : []
  };
}
