import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/jspace-index.js';
import {
  createAuthorizationReceipt,
  createOpsEvent,
  dryRunInvocation,
  executionMode,
  persistAuthorizationReceipt,
  revokeAuthorizationReceipt,
  toHermesCityProjection,
  validateAuthorizationReceipt,
} from '../src/execution-corridor.js';

const env = {
  EXECUTION_CORRIDOR_ENABLED: 'true',
  EXECUTION_MODE: 'AUTHORIZATION_ONLY',
  AUTHORIZATION_TTL_SECONDS: '60',
  MCP_API_TOKEN: 'operator-test-token',
  PUBLIC_MCP_ENABLED: 'true',
  MCP_AUTH_MODE: 'public-read',
  MAX_REQUEST_BYTES: '131072',
  ALLOWED_ORIGINS: '',
};

function request(overrides = {}) {
  return {
    request_id: 'request-1',
    production_id: 'production-1',
    job_id: 'job-1',
    provider_id: 'provider-1',
    runtime_id: 'runtime-1',
    adapter_id: 'adapter-1',
    capability: 'video.generate',
    risk_class: 'LOW',
    budget_class: 'FREE',
    policy_profile: 'NORMAL_CREATOR',
    adapter_registered: true,
    capability_handle: { handle_id: 'handle-1', scope: 'video.generate', subject: 'job-1', issuer: 'broker', sealed: true },
    attestations: { '54t': 'VERIFIED', provider: 'VERIFIED', adapter: 'VERIFIED', egress: 'VERIFIED' },
    provenance: { source: 'creator-core', assignment_plan_id: 'assignment-1' },
    ...overrides,
  };
}

function dbStub() {
  const statements = [];
  return {
    statements,
    prepare(sql) {
      const statement = {
        sql,
        bind(...values) { statement.values = values; return statement; },
        async run() { statements.push({ sql, values: statement.values }); return { success: true }; },
      };
      return statement;
    },
    async batch(items) { statements.push(...items.map((item) => ({ sql: item.sql }))); return { success: true }; },
  };
}

test('public MCP remains read-only while authorization is separate', async () => {
  const response = await worker.fetch(new Request('https://example.test/mcp', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
  }), env, { waitUntil() {} });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /READ_ONLY/);
  const anonymous = await worker.fetch(new Request('https://example.test/api/execution/authorize', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request()),
  }), env, { waitUntil() {} });
  assert.equal(anonymous.status, 401);
});

test('authorization requires operator auth and corridor enablement', async () => {
  const missing = await createAuthorizationReceipt(request(), { ...env, EXECUTION_CORRIDOR_ENABLED: 'false' });
  assert.equal(missing.authority_decision, 'DENY_EXECUTION');
  assert.ok(missing.reasons.includes('execution corridor is disabled'));
  const response = await worker.fetch(new Request('https://example.test/api/execution/authorize', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer operator-test-token' }, body: JSON.stringify(request()),
  }), { ...env, EXECUTION_CORRIDOR_ENABLED: 'false' }, { waitUntil() {} });
  assert.equal(response.status, 403);
});

test('AUTHORIZATION_ONLY is the fail-closed default for absent and invalid modes', () => {
  assert.equal(executionMode({}), 'AUTHORIZATION_ONLY');
  assert.equal(executionMode({ EXECUTION_MODE: 'INVALID' }), 'AUTHORIZATION_ONLY');
});

test('valid operator authorization persists only safe receipt fields', async () => {
  const receipt = await createAuthorizationReceipt(request(), env);
  assert.equal(receipt.authority_decision, 'ALLOW_EXECUTION');
  assert.equal(receipt.invocation_performed, false);
  const db = dbStub();
  await persistAuthorizationReceipt(db, receipt);
  const insert = db.statements.find((item) => item.sql.includes('INSERT INTO execution_authorizations'));
  assert.ok(insert);
  assert.equal(insert.values.includes('operator-test-token'), false);
  assert.equal(insert.values.includes('api-key'), false);
  db.prepare = (sql) => ({ sql, bind(...values) { this.values = values; return this; }, async run() { return { meta: { changes: 1 } }; } });
  assert.deepEqual(await revokeAuthorizationReceipt(db, receipt.receipt_id), { receipt_id: receipt.receipt_id, revoked: true });
});

test('authorization receipts are time-bounded, revocable, and job/provider/runtime/capability scoped', async () => {
  const issued = new Date('2026-01-01T00:00:00.000Z');
  const receipt = await createAuthorizationReceipt(request(), env, issued);
  const valid = validateAuthorizationReceipt(receipt, request(), { ...env, EXECUTION_MODE: 'DRY_RUN' }, new Date('2026-01-01T00:00:30.000Z'));
  assert.equal(valid.valid, true);
  const expired = validateAuthorizationReceipt(receipt, request(), { ...env, EXECUTION_MODE: 'DRY_RUN' }, new Date('2026-01-01T00:02:00.000Z'));
  assert.equal(expired.valid, false);
  assert.ok(expired.reasons.includes('authorization receipt is expired'));
  const revoked = validateAuthorizationReceipt({ ...receipt, revoked_at: '2026-01-01T00:00:10.000Z' }, request(), { ...env, EXECUTION_MODE: 'DRY_RUN' }, new Date('2026-01-01T00:00:20.000Z'));
  assert.ok(revoked.reasons.includes('authorization receipt is revoked'));
  const mismatch = validateAuthorizationReceipt(receipt, request({ provider_id: 'other-provider' }), { ...env, EXECUTION_MODE: 'DRY_RUN' });
  assert.ok(mismatch.reasons.includes('authorization receipt scope does not match request'));
});

test('DRY_RUN performs no provider invocation and AUTHORIZATION_ONLY blocks it', async () => {
  const receipt = await createAuthorizationReceipt(request(), env);
  const authOnly = await dryRunInvocation(receipt, request(), env);
  assert.equal(authOnly.decision, 'DENY_EXECUTION');
  assert.equal(authOnly.invocation_performed, false);
  const dryRun = await dryRunInvocation(receipt, request(), { ...env, EXECUTION_MODE: 'DRY_RUN' });
  assert.equal(dryRun.decision, 'ALLOW_EXECUTION');
  assert.equal(dryRun.invocation_performed, false);
});

test('CANARY enforces explicit provider/runtime, job, and budget controls', async () => {
  const canaryEnv = { ...env, EXECUTION_MODE: 'CANARY', CANARY_PROVIDER_ID: 'provider-1', CANARY_RUNTIME_ID: 'runtime-1', CANARY_MAX_JOBS: '1', CANARY_BUDGET_CLASS: 'FREE' };
  assert.equal((await createAuthorizationReceipt(request(), canaryEnv)).authority_decision, 'ALLOW_EXECUTION');
  const rejected = await createAuthorizationReceipt(request({ provider_id: 'provider-2' }), canaryEnv);
  assert.equal(rejected.authority_decision, 'DENY_EXECUTION');
  assert.ok(rejected.reasons.includes('provider/runtime is outside the CANARY allowlist'));
  const atLimit = await createAuthorizationReceipt(request({ canary_job_count: 1 }), canaryEnv);
  assert.ok(atLimit.reasons.includes('CANARY_MAX_JOBS limit has been reached'));
});

test('LIVE cannot activate without an explicit separate enablement', async () => {
  const receipt = await createAuthorizationReceipt(request(), { ...env, EXECUTION_MODE: 'LIVE' });
  assert.equal(receipt.authority_decision, 'DENY_EXECUTION');
  assert.ok(receipt.reasons.includes('LIVE execution is disabled'));
});

test('high risk approval and critical dual control remain fail-closed', async () => {
  const high = await createAuthorizationReceipt(request({ risk_class: 'HIGH' }), env);
  assert.equal(high.authority_decision, 'REVIEW_REQUIRED');
  const critical = await createAuthorizationReceipt(request({ risk_class: 'CRITICAL', required_human_approvals: ['one'] }), env);
  assert.equal(critical.authority_decision, 'REVIEW_REQUIRED');
});

test('OPS events and HERMES-CITY projection expose safe operational state only', () => {
  const receipt = { receipt_id: 'auth-1', production_id: 'production-1', job_id: 'job-1', runtime_id: 'runtime-1' };
  const event = createOpsEvent('RUNNING', receipt, 2, new Date('2026-01-01T00:00:00.000Z'));
  assert.deepEqual(event, { event_id: event.event_id, authorization_receipt_id: 'auth-1', production_id: 'production-1', job_id: 'job-1', runtime_id: 'runtime-1', state: 'RUNNING', attempt: 2, timestamp: '2026-01-01T00:00:00.000Z' });
  const projection = toHermesCityProjection('SUCCEEDED', receipt);
  assert.equal(projection.state, 'complete');
  assert.equal(projection.authority, 'PROJECTION_ONLY');
  assert.equal('token' in projection, false);
  assert.equal('payload' in projection, false);
});
