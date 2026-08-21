import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/execution-beta-index.js';
import { createAuthorizationReceipt } from '../src/execution-corridor.js';

const baseEnv = {
  EXECUTION_CORRIDOR_ENABLED: 'true',
  EXECUTION_MODE: 'DRY_RUN',
  MCP_API_TOKEN: 'operator-test-token',
  MAX_REQUEST_BYTES: '131072',
};

function executionRequest() {
  return {
    request_id: 'request-dry-1',
    production_id: 'production-dry-1',
    job_id: 'job-dry-1',
    provider_id: 'provider-dry-1',
    runtime_id: 'runtime-dry-1',
    adapter_id: 'adapter-dry-1',
    capability: 'video.generate',
    risk_class: 'LOW',
    budget_class: 'FREE',
    policy_profile: 'NORMAL_CREATOR',
    adapter_registered: true,
    capability_handle: {
      handle_id: 'handle-dry-1',
      scope: 'video.generate',
      subject: 'job-dry-1',
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
      assignment_plan_id: 'assignment-dry-1',
    },
  };
}

function dbWithReceipt(receipt) {
  return {
    prepare(sql) {
      return {
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

test('dry-run HTTP route rejects anonymous callers', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/execution/dry-run', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  }), { ...baseEnv, DB: dbWithReceipt({}) }, {});

  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, 'UNAUTHORIZED');
});

test('dry-run HTTP route resolves authoritative D1 receipt and never invokes provider', async () => {
  const requestBody = executionRequest();
  const receipt = await createAuthorizationReceipt(requestBody, {
    ...baseEnv,
    EXECUTION_MODE: 'AUTHORIZATION_ONLY',
  }, new Date('2026-08-21T06:00:00.000Z'));

  const response = await worker.fetch(new Request('https://example.test/api/execution/dry-run', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer operator-test-token',
    },
    body: JSON.stringify({
      execution_request: requestBody,
      authorization_receipt: {
        receipt_id: receipt.receipt_id,
        authority_decision: 'DENY_EXECUTION',
        status: 'REVOKED',
      },
    }),
  }), { ...baseEnv, DB: dbWithReceipt(receipt) }, {});

  assert.equal(response.status, 200);
  const output = await response.json();
  assert.equal(output.state, 'DRY_RUN_ACCEPTED');
  assert.equal(output.authorization_receipt_id, receipt.receipt_id);
  assert.equal(output.invocation_performed, false);
  assert.equal(output.simulation.provider_invocation, 'DISABLED');
  assert.equal(output.dry_run_receipt.provider_invocation, 'DISABLED');
  assert.equal(output.hermes_city.authorization_receipt_id, receipt.receipt_id);
});
