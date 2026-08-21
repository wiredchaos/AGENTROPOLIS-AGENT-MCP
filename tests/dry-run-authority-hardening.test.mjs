import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAuthorizationReceipt,
  authorizationInputHash,
} from '../src/execution-corridor.js';
import {
  executeGovernedDryRun,
  DRY_RUN_STATES,
} from '../src/dry-run-executor.js';

const baseEnv = {
  EXECUTION_CORRIDOR_ENABLED: 'true',
  EXECUTION_MODE: 'DRY_RUN',
  AUTHORIZATION_TTL_SECONDS: '300',
};

function executionRequest(overrides = {}) {
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
    capability_handle: {
      handle_id: 'handle-1',
      scope: 'video.generate',
      subject: 'job-1',
      issuer: 'broker',
      sealed: true,
    },
    attestations: {
      '54t': 'VERIFIED',
      provider: 'VERIFIED',
      adapter: 'VERIFIED',
      egress: 'VERIFIED',
    },
    provenance: {
      source: 'creator-core',
      assignment_plan_id: 'assignment-1',
    },
    ...overrides,
  };
}

function d1WithReceipt(receipt) {
  return {
    prepare(sql) {
      return {
        sql,
        bind(...values) {
          this.values = values;
          return this;
        },
        async first() {
          if (!sql.includes('FROM execution_authorizations')) return null;
          if (this.values?.[0] !== receipt.receipt_id) return null;
          return {
            ...receipt,
            attestation_summary: JSON.stringify(receipt.attestation_summary),
          };
        },
      };
    },
  };
}

async function fixture(now = new Date('2026-01-01T00:00:00.000Z')) {
  const request = executionRequest();
  const receipt = await createAuthorizationReceipt(request, baseEnv, now);
  return { request, receipt, now };
}

test('dry run ignores forged caller receipt contents and resolves authoritative D1 receipt by ID', async () => {
  const { request, receipt, now } = await fixture();
  const forged = {
    ...receipt,
    authority_decision: 'DENY_EXECUTION',
    provider_id: 'forged-provider',
    input_hash: 'forged-input-hash',
  };
  const result = await executeGovernedDryRun({
    execution_request: request,
    authorization_receipt: forged,
  }, { ...baseEnv, DB: d1WithReceipt(receipt) }, new Date(now.getTime() + 30_000));

  assert.equal(result.state, DRY_RUN_STATES.ACCEPTED);
  assert.equal(result.authorization_receipt_id, receipt.receipt_id);
  assert.equal(result.invocation_performed, false);
  assert.equal(result.simulation.provider_invocation, 'DISABLED');
});

test('dry run denies receipt IDs that do not exist in the authoritative store', async () => {
  const { request, receipt, now } = await fixture();
  const result = await executeGovernedDryRun({
    execution_request: request,
    authorization_receipt: { receipt_id: `missing-${receipt.receipt_id}` },
  }, { ...baseEnv, DB: d1WithReceipt(receipt) }, new Date(now.getTime() + 30_000));

  assert.equal(result.state, DRY_RUN_STATES.DENIED);
  assert.ok(result.reasons.includes('authoritative authorization receipt was not found'));
  assert.equal(result.invocation_performed, false);
});

test('dry run binds the complete authorization-relevant input hash', async () => {
  const { request, receipt, now } = await fixture();
  const mutated = executionRequest({ budget_class: 'HIGH' });
  const result = await executeGovernedDryRun({
    execution_request: mutated,
    authorization_receipt: { receipt_id: receipt.receipt_id },
  }, { ...baseEnv, DB: d1WithReceipt(receipt) }, new Date(now.getTime() + 30_000));

  assert.equal(await authorizationInputHash(mutated) === receipt.input_hash, false);
  assert.equal(result.state, DRY_RUN_STATES.DENIED);
  assert.ok(result.reasons.includes('authorization receipt input hash does not match request'));
  assert.equal(result.simulation, null);
});

test('execution corridor kill switch denies previously issued dry-run receipts immediately', async () => {
  const { request, receipt, now } = await fixture();
  const result = await executeGovernedDryRun({
    execution_request: request,
    authorization_receipt: { receipt_id: receipt.receipt_id },
  }, { ...baseEnv, EXECUTION_CORRIDOR_ENABLED: 'false', DB: d1WithReceipt(receipt) }, new Date(now.getTime() + 30_000));

  assert.equal(result.state, DRY_RUN_STATES.DENIED);
  assert.ok(result.reasons.includes('execution corridor is disabled'));
  assert.equal(result.invocation_performed, false);
});

test('HERMES-CITY dry-run projection carries authoritative receipt, runtime and deterministic timestamp', async () => {
  const { request, receipt, now } = await fixture();
  const runAt = new Date(now.getTime() + 30_000);
  const result = await executeGovernedDryRun({
    execution_request: request,
    authorization_receipt: { receipt_id: receipt.receipt_id },
  }, { ...baseEnv, DB: d1WithReceipt(receipt) }, runAt);

  assert.equal(result.state, DRY_RUN_STATES.ACCEPTED);
  assert.equal(result.hermes_city.authorization_receipt_id, receipt.receipt_id);
  assert.equal(result.hermes_city.runtime_id, request.runtime_id);
  assert.equal(result.hermes_city.timestamp, runAt.toISOString());
  assert.equal(result.hermes_city.authority, 'PROJECTION_ONLY');
  assert.equal('token' in result.hermes_city, false);
  assert.equal('payload' in result.hermes_city, false);
});
