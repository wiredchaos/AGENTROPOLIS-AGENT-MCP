import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTEXT_BUDGET_THRESHOLDS,
  DISCIPLINE_TOOLS,
  buildDisciplineSnapshot,
  isDisciplineTool,
  validateDisciplineArguments
} from '../src/discipline-observatory.js';

const TOOL_NAMES = [
  'get_context_floor_status',
  'get_execution_plan_status',
  'get_task_verification_status',
  'get_thermodynamic_metrics',
  'list_approved_optimization_profiles',
  'validate_execution_receipt',
  'assess_context_pressure',
  'explain_task_blocker'
];

function toolDef(name) {
  const tool = DISCIPLINE_TOOLS.find((item) => item.name === name);
  assert.ok(tool, `expected tool ${name} to be registered`);
  return tool;
}

function budgetArgs(overrides = {}) {
  return {
    runtime_context_limit: 100000,
    system_instruction_tokens: 10000,
    tool_schema_tokens: 5000,
    active_task_tokens: 10000,
    reserved_output_tokens: 5000,
    safety_headroom_tokens: 5000,
    ...overrides
  };
}

function validReceipt(overrides = {}) {
  return {
    schema_version: '1.0.0',
    verification_receipt_id: 'vr_0001',
    task_id: 'task_0001',
    plan_id: 'plan_0001',
    verification_state: 'PASSED',
    task_complete_evidence: {
      expected_behavior_demonstrated: true,
      tests_passed: true,
      logs_inspected: true,
      security_checks_passed: true,
      regression_surface_reviewed: true,
      artifact_recorded: true,
      receipt_committed: true
    },
    verified_at: '2026-08-06T00:00:00.000Z',
    ...overrides
  };
}

test('registers eight bounded read-only discipline tools', () => {
  assert.equal(DISCIPLINE_TOOLS.length, 8);
  assert.deepEqual(DISCIPLINE_TOOLS.map((tool) => tool.name), TOOL_NAMES);
  for (const tool of DISCIPLINE_TOOLS) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
    assert.equal(tool.annotations.idempotentHint, true);
    assert.equal(tool.inputSchema.additionalProperties, false);
    assert.equal(isDisciplineTool(tool.name), true);
  }
  assert.equal(isDisciplineTool('route_front_desk'), false);
});

test('validates arguments positively and rejects unexpected keys', () => {
  const floor = toolDef('get_context_floor_status');
  assert.equal(validateDisciplineArguments(floor, budgetArgs()), null);
  assert.equal(validateDisciplineArguments(floor, {}), null);
  assert.equal(validateDisciplineArguments(floor, null), 'arguments must be an object');
  assert.equal(validateDisciplineArguments(floor, []), 'arguments must be an object');
  assert.match(validateDisciplineArguments(floor, budgetArgs({ execute: true })), /unexpected argument/);
  assert.match(validateDisciplineArguments(floor, { runtime_context_limit: -1 }), /non-negative integer/);
  assert.match(validateDisciplineArguments(floor, { runtime_context_limit: 1.5 }), /non-negative integer/);
  assert.match(validateDisciplineArguments(floor, { runtime_context_limit: 1e9 }), /non-negative integer/);
});

test('validates plan and task id formats and status filters', () => {
  const plan = toolDef('get_execution_plan_status');
  assert.equal(validateDisciplineArguments(plan, { task_id: 'task_1', plan_id: 'plan-1' }), null);
  assert.match(validateDisciplineArguments(plan, { plan_id: '' }), /invalid plan_id/);
  assert.match(validateDisciplineArguments(plan, { plan_id: 'bad id!' }), /invalid plan_id/);
  assert.match(validateDisciplineArguments(plan, { plan_id: 'x'.repeat(200) }), /invalid plan_id/);
  assert.match(validateDisciplineArguments(plan, { task_id: 42 }), /invalid task_id/);

  const profiles = toolDef('list_approved_optimization_profiles');
  assert.equal(validateDisciplineArguments(profiles, { approval_state: 'APPROVED', profile_class: 'CANONICAL_FINAL', model_family: 'deepseek-v4' }), null);
  assert.match(validateDisciplineArguments(profiles, { approval_state: 'GRANTED' }), /invalid approval_state/);
  assert.match(validateDisciplineArguments(profiles, { profile_class: 'TURBO' }), /invalid profile_class/);
  assert.match(validateDisciplineArguments(profiles, { model_family: '' }), /model_family/);
});

test('validates evidence objects and required receipt argument', () => {
  const blocker = toolDef('explain_task_blocker');
  assert.equal(validateDisciplineArguments(blocker, { evidence: { risk_level: 'high', retry_count: 2, max_retries: 2, safety_block: true } }), null);
  assert.match(validateDisciplineArguments(blocker, { evidence: { execute: true } }), /unexpected evidence field/);
  assert.match(validateDisciplineArguments(blocker, { evidence: { risk_level: 'extreme' } }), /invalid evidence.risk_level/);
  assert.match(validateDisciplineArguments(blocker, { evidence: { retry_count: -1 } }), /non-negative integer/);
  assert.match(validateDisciplineArguments(blocker, { evidence: { safety_block: 'yes' } }), /must be boolean/);

  const validate = toolDef('validate_execution_receipt');
  assert.equal(validateDisciplineArguments(validate, { receipt: validReceipt() }), null);
  assert.match(validateDisciplineArguments(validate, {}), /missing required argument: receipt/);
  assert.match(validateDisciplineArguments(validate, { receipt: 'nope' }), /receipt must be an object/);
  assert.match(validateDisciplineArguments(validate, { receipt: [] }), /receipt must be an object/);
});

test('computes the canonical context budget formula and all four states', () => {
  const floor = toolDef('get_context_floor_status');
  const green = buildDisciplineSnapshot('get_context_floor_status', budgetArgs()).data;
  assert.equal(green.effective_context_budget, 65000);
  assert.equal(green.ratio, 0.65);
  assert.equal(green.status, 'GREEN');
  assert.equal(green.dataState, 'CALLER_SUPPLIED_PROJECTION');

  const amber = buildDisciplineSnapshot('get_context_floor_status', budgetArgs({ system_instruction_tokens: 15000, active_task_tokens: 25000 })).data;
  assert.equal(amber.effective_context_budget, 45000);
  assert.equal(amber.status, 'AMBER');

  const red = buildDisciplineSnapshot('get_context_floor_status', budgetArgs({ system_instruction_tokens: 20000, tool_schema_tokens: 6000, active_task_tokens: 40000 })).data;
  assert.equal(red.effective_context_budget, 24000);
  assert.equal(red.status, 'RED');

  const critical = buildDisciplineSnapshot('get_context_floor_status', budgetArgs({ system_instruction_tokens: 30000, tool_schema_tokens: 10000, active_task_tokens: 45000 })).data;
  assert.equal(critical.effective_context_budget, 5000);
  assert.equal(critical.status, 'CRITICAL');

  const negative = buildDisciplineSnapshot('get_context_floor_status', budgetArgs({ system_instruction_tokens: 80000 })).data;
  assert.equal(negative.effective_context_budget, -5000);
  assert.equal(negative.status, 'CRITICAL');
});

test('applies threshold boundaries at exactly 25% and 50%', () => {
  assert.equal(CONTEXT_BUDGET_THRESHOLDS.critical, 0.1);
  assert.equal(CONTEXT_BUDGET_THRESHOLDS.red, 0.25);
  assert.equal(CONTEXT_BUDGET_THRESHOLDS.amber, 0.5);
  const atRed = buildDisciplineSnapshot('get_context_floor_status', budgetArgs({ active_task_tokens: 50000 })).data;
  assert.equal(atRed.effective_context_budget, 25000);
  assert.equal(atRed.ratio, 0.25);
  assert.equal(atRed.status, 'RED');
  const atAmber = buildDisciplineSnapshot('get_context_floor_status', budgetArgs({ active_task_tokens: 25000 })).data;
  assert.equal(atAmber.effective_context_budget, 50000);
  assert.equal(atAmber.status, 'AMBER');
});

test('returns NOT_CONFIGURED honestly when no live context data exists', () => {
  const floor = buildDisciplineSnapshot('get_context_floor_status', {}).data;
  assert.equal(floor.status, 'NOT_CONFIGURED');
  assert.equal(floor.effective_context_budget, null);
  assert.equal(floor.dataState, 'NOT_CONFIGURED');
  assert.ok(floor.missingComponents.length === 6);
  assert.match(floor.statusDescription, /No discovered context budget/);

  const partial = buildDisciplineSnapshot('get_context_floor_status', { runtime_context_limit: 100000 }).data;
  assert.equal(partial.status, 'NOT_CONFIGURED');
  assert.equal(partial.dataState, 'UNVERIFIED');
  assert.equal(partial.missingComponents.length, 5);

  const pressure = buildDisciplineSnapshot('assess_context_pressure', {}).data;
  assert.equal(pressure.pressure, 'UNKNOWN');
  assert.equal(pressure.freezeDispatch, false);
  assert.equal(pressure.dataState, 'NOT_CONFIGURED');
});

test('accepts a conformant verification receipt and reports task completeness', () => {
  const result = buildDisciplineSnapshot('validate_execution_receipt', { receipt: validReceipt() }).data;
  assert.equal(result.verdict, 'VALID');
  assert.equal(result.confidence, 1);
  assert.equal(result.taskComplete, true);
  assert.equal(result.dataState, 'CONFIRMED');
  assert.equal(result.summary.verification_receipt_id, 'vr_0001');
});

test('fails closed on malformed receipts', () => {
  const missingField = buildDisciplineSnapshot('validate_execution_receipt', { receipt: validReceipt({ plan_id: undefined }) }).data;
  assert.equal(missingField.verdict, 'INVALID');
  assert.equal(missingField.confidence, 0);
  assert.match(missingField.reasons.join(' '), /Missing required field/);

  const badState = buildDisciplineSnapshot('validate_execution_receipt', { receipt: validReceipt({ verification_state: 'COMPLETE' }) }).data;
  assert.equal(badState.verdict, 'INVALID');

  const badSchema = buildDisciplineSnapshot('validate_execution_receipt', { receipt: validReceipt({ schema_version: '2.0.0' }) }).data;
  assert.equal(badSchema.verdict, 'INVALID');

  const malformedEvidence = buildDisciplineSnapshot('validate_execution_receipt', { receipt: validReceipt({ task_complete_evidence: { ...validReceipt().task_complete_evidence, tests_passed: 'yes' } }) }).data;
  assert.equal(malformedEvidence.verdict, 'INVALID');
  assert.match(malformedEvidence.reasons.join(' '), /Evidence malformed/);

  const badVerifiedAt = buildDisciplineSnapshot('validate_execution_receipt', { receipt: validReceipt({ verified_at: 'not-a-date' }) }).data;
  assert.equal(badVerifiedAt.verdict, 'INVALID');

  const badRefs = buildDisciplineSnapshot('validate_execution_receipt', { receipt: validReceipt({ evidence_references: [42] }) }).data;
  assert.equal(badRefs.verdict, 'INVALID');
});

test('returns uncertainty when receipt evidence is incomplete or pending', () => {
  const incomplete = validReceipt();
  delete incomplete.task_complete_evidence.receipt_committed;
  const result = buildDisciplineSnapshot('validate_execution_receipt', { receipt: incomplete }).data;
  assert.equal(result.verdict, 'INDETERMINATE');
  assert.ok(result.confidence > 0 && result.confidence < 1);
  assert.match(result.reasons.join(' '), /Evidence incomplete/);

  const pending = buildDisciplineSnapshot('validate_execution_receipt', { receipt: validReceipt({ verification_state: 'PENDING' }) }).data;
  assert.equal(pending.verdict, 'INDETERMINATE');
  assert.equal(pending.confidence, 0.3);
});

test('never echoes receipt bodies back', () => {
  const receipt = validReceipt({ secret_marker: 'SENSITIVE_MARKER_ABCDEF123456' });
  const output = JSON.stringify(buildDisciplineSnapshot('validate_execution_receipt', { receipt }));
  assert.ok(!output.includes('SENSITIVE_MARKER_ABCDEF123456'));
  assert.ok(!/seed phrase|private key|AKIA[0-9A-Z]{16}|api[_-]?token|MCP_API_TOKEN/i.test(output));
});

test('reports unmeasured thermodynamic metrics as UNKNOWN without inventing numbers', () => {
  const metrics = buildDisciplineSnapshot('get_thermodynamic_metrics', {}).data;
  assert.equal(metrics.dataState, 'NOT_CONFIGURED');
  assert.equal(metrics.measures.length, 10);
  const keys = metrics.measures.map((m) => m.metric);
  for (const expected of ['token_energy', 'compute_energy', 'context_churn', 'coordination_friction', 'semantic_drift', 'memory_entropy', 'correction_load', 'compression_loss', 'tool_failure_heat', 'useful_work_ratio']) {
    assert.ok(keys.includes(expected));
  }
  for (const measure of metrics.measures) {
    assert.equal(measure.value, null);
    assert.equal(measure.state, 'UNKNOWN');
    assert.equal(measure.provenance, null);
  }
  assert.equal(metrics.runtime.receiptCount, 0);
});

test('returns the canonical baseline when no optimization profiles are registered', () => {
  const profiles = buildDisciplineSnapshot('list_approved_optimization_profiles', {}).data;
  assert.equal(profiles.dataState, 'NOT_CONFIGURED');
  assert.deepEqual(profiles.profiles, []);
  assert.equal(profiles.optimizationPolicy.canonical_profile_required, true);
  assert.equal(profiles.optimizationPolicy.reject_unverified_quality_regressions, true);
  assert.equal(profiles.filters.approval_state, 'APPROVED');
});

test('returns plan and verification states honestly without a live record', () => {
  const plan = buildDisciplineSnapshot('get_execution_plan_status', {}).data;
  assert.equal(plan.dataState, 'CANONICAL_BASELINE');
  assert.equal(plan.plan, null);
  assert.equal(plan.state, 'UNVERIFIED');
  assert.equal(plan.canonicalFlow.length, 10);

  const planRef = buildDisciplineSnapshot('get_execution_plan_status', { task_id: 'task_9' }).data;
  assert.equal(planRef.dataState, 'UNVERIFIED');

  const verification = buildDisciplineSnapshot('get_task_verification_status', {}).data;
  assert.equal(verification.verificationState, 'UNVERIFIED');
  assert.equal(verification.taskComplete, null);
  assert.equal(verification.evidenceChecklist.length, 7);
  for (const item of verification.evidenceChecklist) assert.equal(item.value, null);
});

test('classifies task blockers with explicit uncertainty', () => {
  const safe = buildDisciplineSnapshot('explain_task_blocker', { task_id: 'task_1', evidence: { safety_block: true } }).data;
  assert.equal(safe.classification, 'FAILED_SAFE');
  assert.ok(safe.uncertainty < 0.5);

  const denied = buildDisciplineSnapshot('explain_task_blocker', { evidence: { approval_state: 'DENIED' } }).data;
  assert.equal(denied.classification, 'BLOCKED');

  const awaiting = buildDisciplineSnapshot('explain_task_blocker', { evidence: { risk_level: 'critical' } }).data;
  assert.equal(awaiting.classification, 'AWAITING_APPROVAL');

  const retries = buildDisciplineSnapshot('explain_task_blocker', { evidence: { retry_count: 2, max_retries: 2 } }).data;
  assert.equal(retries.classification, 'BLOCKED');
  assert.match(retries.reason, /Retry budget exhausted/);

  const none = buildDisciplineSnapshot('explain_task_blocker', { evidence: { approval_state: 'APPROVED', risk_level: 'low' } }).data;
  assert.equal(none.classification, 'NONE_DETECTED');

  const unknown = buildDisciplineSnapshot('explain_task_blocker', { task_id: 'task_1' }).data;
  assert.equal(unknown.classification, 'UNVERIFIED');
  assert.equal(unknown.uncertainty, 0.9);

  const empty = buildDisciplineSnapshot('explain_task_blocker', {}).data;
  assert.equal(empty.classification, 'UNVERIFIED');
  assert.equal(empty.uncertainty, 1);
});

test('carries the governed read-only metadata block and honest telemetry states', () => {
  const snapshot = buildDisciplineSnapshot('get_execution_plan_status', {}, { receiptCount: 0 });
  assert.equal(snapshot.identity, 'HERMES Execution Discipline Observatory');
  assert.equal(snapshot.schemaVersion, '1.0.0');
  assert.equal(snapshot.authority, 'READ_ONLY');
  assert.equal(snapshot.telemetryState, 'canonical-baseline');
  assert.ok(!Number.isNaN(Date.parse(snapshot.generatedAt)));
  assert.match(snapshot.caution, /READ_ONLY/);

  const live = buildDisciplineSnapshot('get_execution_plan_status', {}, { receiptCount: 7, avgDurationMs: 12.5 });
  assert.equal(live.telemetryState, 'receipt-backed-observability');
  assert.ok(live.source.some((s) => s.includes('receipt')));
});

test('uses runtime-discovered context floor when provided', () => {
  const runtime = {
    receiptCount: 3,
    contextFloor: {
      runtime_context_limit: 200000,
      system_instruction_tokens: 20000,
      tool_schema_tokens: 10000,
      active_task_tokens: 30000,
      reserved_output_tokens: 10000,
      safety_headroom_tokens: 10000,
      measuredAt: '2026-08-06T01:00:00.000Z'
    }
  };
  const floor = buildDisciplineSnapshot('get_context_floor_status', {}, runtime).data;
  assert.equal(floor.effective_context_budget, 120000);
  assert.equal(floor.status, 'GREEN');
  assert.equal(floor.dataState, 'RECEIPT_BACKED');
  assert.equal(floor.measuredAt, '2026-08-06T01:00:00.000Z');

  const pressure = buildDisciplineSnapshot('assess_context_pressure', {}, runtime).data;
  assert.equal(pressure.pressure, 'NONE');
  assert.equal(pressure.freezeDispatch, false);
});

test('context pressure escalates freeze and checkpoint responses', () => {
  const red = buildDisciplineSnapshot('assess_context_pressure', budgetArgs({ system_instruction_tokens: 20000, tool_schema_tokens: 6000, active_task_tokens: 40000 })).data;
  assert.equal(red.pressure, 'HIGH');
  assert.equal(red.freezeDispatch, true);
  assert.equal(red.checkpointRequired, false);

  const critical = buildDisciplineSnapshot('assess_context_pressure', budgetArgs({ system_instruction_tokens: 80000 })).data;
  assert.equal(critical.pressure, 'CRITICAL');
  assert.equal(critical.freezeDispatch, true);
  assert.equal(critical.checkpointRequired, true);
});
