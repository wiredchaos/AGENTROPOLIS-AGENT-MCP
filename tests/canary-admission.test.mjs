import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/execution-beta-index.js';
import {
  canaryReadiness,
  reserveCanaryAdmission,
  validateCanaryAdmissionRequest,
} from '../src/canary-admission.js';

const armedEnv = {
  EXECUTION_CORRIDOR_ENABLED: 'true',
  EXECUTION_MODE: 'CANARY',
  OPS_SUPERVISION_ENABLED: 'true',
  CANARY_EXECUTION_ENABLED: 'true',
  CANARY_PROVIDER_ID: 'provider-1',
  CANARY_RUNTIME_ID: 'runtime-1',
  CANARY_MAX_JOBS: '1',
  CANARY_MAX_COST_MICRO_USD: '500000',
  CANARY_BUDGET_CLASS: 'LOW',
};

const receipt = {
  receipt_id: 'auth-1',
  production_id: 'production-1',
  job_id: 'job-1',
  provider_id: 'provider-1',
  runtime_id: 'runtime-1',
  capability: 'video.generate',
  budget_class: 'LOW',
  authority_decision: 'ALLOW_EXECUTION',
  status: 'ACTIVE',
};

function request(overrides = {}) {
  return {
    authorization_receipt_id: 'auth-1',
    provider_id: 'provider-1',
    runtime_id: 'runtime-1',
    budget_class: 'LOW',
    risk_class: 'LOW',
    human_canary_approval: true,
    estimated_cost_micro_usd: 100000,
    ...overrides,
  };
}

function db(activeRows = []) {
  const writes = [];
  return {
    writes,
    prepare(sql) {
      const statement = {
        sql,
        values: [],
        bind(...values) { this.values = values; return this; },
        async all() { return { results: activeRows }; },
        async run() { writes.push({ sql, values: this.values }); return { success: true, meta: { changes: 1 } }; },
      };
      return statement;
    },
  };
}

test('production defaults expose readiness only and cannot arm CANARY', () => {
  const readiness = canaryReadiness({
    EXECUTION_CORRIDOR_ENABLED: 'true',
    EXECUTION_MODE: 'DRY_RUN',
    OPS_SUPERVISION_ENABLED: 'true',
    CANARY_EXECUTION_ENABLED: 'false',
    CANARY_PROVIDER_ID: '',
    CANARY_RUNTIME_ID: '',
    CANARY_MAX_JOBS: '0',
    CANARY_MAX_COST_MICRO_USD: '0',
    CANARY_BUDGET_CLASS: 'LOW',
  });
  assert.equal(readiness.ready, false);
  assert.equal(readiness.armed, false);
  assert.equal(readiness.authority, 'READINESS_ONLY');
});

test('CANARY admission requires explicit human approval and budget envelope', () => {
  const missingApproval = validateCanaryAdmissionRequest(request({ human_canary_approval: false }), receipt, armedEnv);
  assert.equal(missingApproval.valid, false);
  assert.ok(missingApproval.reasons.includes('explicit human CANARY approval is required'));

  const overBudget = validateCanaryAdmissionRequest(request({ estimated_cost_micro_usd: 500001 }), receipt, armedEnv);
  assert.equal(overBudget.valid, false);
  assert.ok(overBudget.reasons.includes('estimated canary cost exceeds budget envelope'));
});

test('CANARY admission is D1-backed and enforces an authoritative one-job ceiling', async () => {
  const available = db([]);
  const admitted = await reserveCanaryAdmission(available, request(), receipt, armedEnv, new Date('2026-08-21T09:00:00.000Z'));
  assert.equal(admitted.admitted, true);
  assert.equal(admitted.admission.slot, 1);
  assert.equal(admitted.admission.status, 'RESERVED');
  assert.equal(available.writes.length, 1);

  const occupied = db([{ admission_id: 'canary-existing', status: 'RUNNING' }]);
  const denied = await reserveCanaryAdmission(occupied, request(), receipt, armedEnv);
  assert.equal(denied.admitted, false);
  assert.ok(denied.reasons.includes('authoritative CANARY job limit has been reached'));
  assert.equal(occupied.writes.length, 0);
});

test('CANARY readiness endpoint is authenticated and non-invoking', async () => {
  const env = {
    ...armedEnv,
    EXECUTION_MODE: 'DRY_RUN',
    CANARY_EXECUTION_ENABLED: 'false',
    MCP_API_TOKEN: 'operator-test-token',
  };
  const anonymous = await worker.fetch(new Request('https://example.test/api/execution/canary/readiness'), env, {});
  assert.equal(anonymous.status, 401);

  const response = await worker.fetch(new Request('https://example.test/api/execution/canary/readiness', {
    headers: { authorization: 'Bearer operator-test-token' },
  }), env, {});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.armed, false);
  assert.equal(body.provider_invocation, 'DISABLED');
  assert.equal(body.authority, 'READINESS_ONLY');
});
