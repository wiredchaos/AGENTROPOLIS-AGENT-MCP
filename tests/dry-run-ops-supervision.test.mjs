import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthorizationReceipt } from '../src/execution-corridor.js';
import { executeGovernedDryRun } from '../src/dry-run-executor.js';

function requestFixture() {
  return {
    request_id: 'request-ops-1',
    production_id: 'production-ops-1',
    job_id: 'job-ops-1',
    provider_id: 'provider-ops-1',
    runtime_id: 'runtime-ops-1',
    adapter_id: 'adapter-ops-1',
    capability: 'video.generate',
    risk_class: 'LOW',
    budget_class: 'FREE',
    policy_profile: 'NORMAL_CREATOR',
    adapter_registered: true,
    capability_handle: {
      handle_id: 'handle-ops-1',
      scope: 'video.generate',
      subject: 'job-ops-1',
      issuer: 'broker',
      sealed: true,
    },
    attestations: {
      '54t': 'VERIFIED',
      provider: 'VERIFIED',
      adapter: 'VERIFIED',
      egress: 'VERIFIED',
    },
    provenance: { source: 'creator-core', assignment_plan_id: 'assignment-ops-1' },
  };
}

function dbFor(receipt) {
  const ops = [];
  return {
    ops,
    prepare(sql) {
      return {
        values: [],
        bind(...values) {
          this.values = values;
          return this;
        },
        async first() {
          if (!sql.includes('FROM execution_authorizations')) return null;
          if (this.values[0] !== receipt.receipt_id) return null;
          return { ...receipt, attestation_summary: JSON.stringify(receipt.attestation_summary) };
        },
        async run() {
          if (!sql.includes('INSERT INTO execution_ops_events')) throw new Error('unexpected SQL');
          ops.push({
            event_id: this.values[0],
            authorization_receipt_id: this.values[1],
            production_id: this.values[2],
            job_id: this.values[3],
            runtime_id: this.values[4],
            state: this.values[5],
            attempt: this.values[6],
            timestamp: this.values[7],
            projection_json: this.values[8],
          });
          return { meta: { changes: 1 } };
        },
      };
    },
  };
}

test('accepted DRY_RUN emits a receipt-backed OPS event without provider invocation', async () => {
  const request = requestFixture();
  const receipt = await createAuthorizationReceipt(request, {
    EXECUTION_CORRIDOR_ENABLED: 'true',
    EXECUTION_MODE: 'AUTHORIZATION_ONLY',
  }, new Date());
  const db = dbFor(receipt);

  const result = await executeGovernedDryRun({
    execution_request: request,
    authorization_receipt: { receipt_id: receipt.receipt_id },
  }, {
    EXECUTION_CORRIDOR_ENABLED: 'true',
    EXECUTION_MODE: 'DRY_RUN',
    OPS_SUPERVISION_ENABLED: 'true',
    DB: db,
  }, new Date());

  assert.equal(result.state, 'DRY_RUN_ACCEPTED');
  assert.equal(result.invocation_performed, false);
  assert.equal(result.simulation.provider_invocation, 'DISABLED');
  assert.equal(db.ops.length, 1);
  assert.equal(db.ops[0].state, 'QUEUED');
  assert.equal(db.ops[0].authorization_receipt_id, receipt.receipt_id);
  assert.equal(result.ops_event.event_id, db.ops[0].event_id);
  assert.equal(result.hermes_city.state, 'working');
  assert.equal(result.hermes_city.authorization_receipt_id, receipt.receipt_id);
});
