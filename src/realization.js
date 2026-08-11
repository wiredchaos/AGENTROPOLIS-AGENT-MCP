export const REALIZATION_TOOLS = [
  {
    name: "futurecast_plan",
    title: "FutureCast Plan",
    description: "Model a bounded future state, enumerate plausible scenarios, backcast milestones, and return falsifiable present-day experiments. Planning only; no claim of literal future access.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        target: { type: "string", minLength: 1, maxLength: 4000 },
        horizon: { type: "string", maxLength: 120 },
        constraints: { type: "array", maxItems: 20, items: { type: "string", maxLength: 500 } }
      },
      required: ["target"]
    }
  },
  {
    name: "mind_meld_plan",
    title: "Mind Meld Plan",
    description: "Produce a reversible, provenance-preserving plan for combining two memory/profile datasets in merge, absorb, or overlay mode. Does not mutate memory.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        profileA: { type: "string", minLength: 1, maxLength: 200 },
        profileB: { type: "string", minLength: 1, maxLength: 200 },
        mode: { type: "string", enum: ["merge", "absorb", "overlay"] },
        destination: { type: "string", maxLength: 200 }
      },
      required: ["profileA", "profileB", "mode"]
    }
  },
  {
    name: "make_real_plan",
    title: "Make It Real Plan",
    description: "Compile an intent into a governed execution graph: research, scenario analysis, backcast, inspect, simulate, approval gates, bounded execution lane, validation, and receipts. This public tool plans only.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        intent: { type: "string", minLength: 1, maxLength: 8000 },
        desiredOutcome: { type: "string", maxLength: 4000 },
        externalImpact: { type: "string", enum: ["none", "reversible", "irreversible"], default: "none" },
        requiresSecrets: { type: "boolean", default: false },
        requiresPublishing: { type: "boolean", default: false },
        requiresPayment: { type: "boolean", default: false },
        requiresDestructiveAction: { type: "boolean", default: false }
      },
      required: ["intent"]
    }
  }
];

export function validateRealizationArguments(tool, args) {
  if (!tool) return "unknown realization tool";
  if (!args || typeof args !== "object" || Array.isArray(args)) return "arguments must be an object";
  const allowed = new Set(Object.keys(tool.inputSchema.properties || {}));
  for (const key of Object.keys(args)) if (!allowed.has(key)) return `unexpected argument: ${key}`;
  for (const key of tool.inputSchema.required || []) if (!(key in args)) return `missing required argument: ${key}`;

  if (tool.name === "futurecast_plan") {
    if (typeof args.target !== "string" || !args.target.trim() || args.target.length > 4000) return "target must be a non-empty string up to 4,000 characters";
    if (args.horizon !== undefined && (typeof args.horizon !== "string" || args.horizon.length > 120)) return "horizon must be a string up to 120 characters";
    if (args.constraints !== undefined && (!Array.isArray(args.constraints) || args.constraints.length > 20 || args.constraints.some((v) => typeof v !== "string" || v.length > 500))) return "constraints must be an array of up to 20 strings, each up to 500 characters";
  }

  if (tool.name === "mind_meld_plan") {
    for (const key of ["profileA", "profileB"]) if (typeof args[key] !== "string" || !args[key].trim() || args[key].length > 200) return `${key} must be a non-empty string up to 200 characters`;
    if (!["merge", "absorb", "overlay"].includes(args.mode)) return "mode must be merge, absorb, or overlay";
    if (args.destination !== undefined && (typeof args.destination !== "string" || args.destination.length > 200)) return "destination must be a string up to 200 characters";
  }

  if (tool.name === "make_real_plan") {
    if (typeof args.intent !== "string" || !args.intent.trim() || args.intent.length > 8000) return "intent must be a non-empty string up to 8,000 characters";
    if (args.desiredOutcome !== undefined && (typeof args.desiredOutcome !== "string" || args.desiredOutcome.length > 4000)) return "desiredOutcome must be a string up to 4,000 characters";
    if (args.externalImpact !== undefined && !["none", "reversible", "irreversible"].includes(args.externalImpact)) return "invalid externalImpact";
    for (const key of ["requiresSecrets", "requiresPublishing", "requiresPayment", "requiresDestructiveAction"]) if (args[key] !== undefined && typeof args[key] !== "boolean") return `${key} must be boolean`;
  }
  return null;
}

export function buildFuturecastPlan(args) {
  return {
    doctrine: "evidence_based_scenario_modeling_not_time_travel",
    target: args.target.trim(),
    horizon: args.horizon || "unspecified",
    constraints: args.constraints || [],
    scenarioSet: [
      { id: "base", purpose: "Most plausible path under current constraints" },
      { id: "upside", purpose: "Faster path if key enablers improve" },
      { id: "failure", purpose: "Failure path that exposes brittle assumptions" }
    ],
    backcast: ["define_success_metrics", "identify_required_capabilities", "map_dependencies", "sequence_milestones", "select_present_day_experiments"],
    evidenceRequirements: ["current_state_sources", "assumption_register", "confidence_per_assumption", "counterevidence", "falsifiers"],
    outputContract: ["scenarios", "milestones", "dependencies", "risks", "falsifiers", "next_experiments"],
    authority: "READ_ONLY_PLAN"
  };
}

export function buildMindMeldPlan(args) {
  const permanent = args.mode !== "overlay";
  return {
    sourceProfiles: [args.profileA, args.profileB],
    mode: args.mode,
    destination: args.destination || (args.mode === "merge" ? "new_profile" : args.profileA),
    permanent,
    pipeline: ["snapshot_sources", "classify_memory", "exclude_secrets", "preserve_provenance", "detect_conflicts", "deduplicate", "preview_diff", ...(permanent ? ["human_approval", "commit", "rollback_checkpoint"] : ["ephemeral_context_only"])],
    provenanceFields: ["origin_profile", "memory_id", "source", "created_at", "confidence", "merge_id"],
    invariants: ["no_secret_copy", "no_silent_conflict_resolution", "no_source_deletion", "reversible_commit"],
    authority: "READ_ONLY_PLAN"
  };
}

export function buildMakeRealPlan(args) {
  const highImpact = args.externalImpact === "irreversible" || Boolean(args.requiresSecrets || args.requiresPublishing || args.requiresPayment || args.requiresDestructiveAction);
  return {
    intent: args.intent.trim(),
    desiredOutcome: args.desiredOutcome || null,
    executionGraph: ["clarify_intent", "research_current_state", "futurecast_scenarios", "backcast_milestones", "compile_tasks", "inspect", "simulate", "policy_risk_gate", "preview", "human_approval_if_required", "bounded_execution_corridor", "validate_outcome", "write_receipt", "audit_feedback"],
    publicMcpAuthority: "READ_ONLY_PLAN",
    executionAuthority: highImpact ? "SEPARATE_AUTHENTICATED_CORRIDOR_REQUIRED" : "NOT_GRANTED_BY_THIS_TOOL",
    approvalRequired: highImpact,
    guardrails: ["no_secret_material_in_model_context", "no_unbounded_external_write", "no_self_escalation", "no_irreversible_action_without_explicit_approval", "receipt_required"],
    handoff: { protocol: "capability_handle", target: "private Agentropolis execution lane", include: ["plan_hash", "policy_state", "requested_capabilities", "approval_state"] }
  };
}
