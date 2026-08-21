import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authorizeHermesDispatch,
  hermesDispatchAuditRecord,
  validateHermesDispatchEnvelope,
} from '../src/hermes-dispatch.js';

function request(overrides = {}) {
  return {
    request_id: 'req_65',
    production_id: 'prod_65',
    job_id: 'job_65',
    provider_id: 'provider.test',
    runtime_id: 'runtime.test',
    adapter_id: 'adapter.test',
    capability: 'media.generate',
    risk_class: 'LOW',
    budget_class: 'LOW',
    adapter_registered: true,
    attestations: { '54t': 'VERIFIED', provider: 'VERIFIED', adapter: 'VERIFIED', egress: 'VERIFIED' },
    provenance: { source: 'hermes-dispatch-test' },
    capability_handle: {
      handle_id: 'cap_65',
      scope: 'media.generate',
      subject: 'agent.test',
      issuer: 'agentropolis.identity',
      sealed: true,
    },
    ...overrides,
  };
}

function envelope(overrides = {}) {
  return {
    dispatch_id: 'dispatch_65',
    district_id: 'creator-district',
    app_id: 'creator-app',
    hermes_instance_id: 'hermes.test',
    identity_attestation: 'VERIFIED',
    identity_receipt_id: 'identity_65',
    execution_request: request(),
    ...overrides,
  };
}

const env = {
  EXECUTION_CORRIDOR_ENABLED: 'true',
  EXECUTION_MODE: 'AUTHORIZATION_ONLY',
  AUTHORIZATION_TTL_SECONDS: '300',
  AUTHORIZATION_POLICY: {
    allowed_capabilities: ['media.generate'],
    allowed_providers: ['provider.test'],
    allowed_runtimes: ['runtime.test'],
    allowed_budget_classes: ['LOW'],
  },
};

test('accepts a verified HERMES dispatch but performs no invocation', async () => {
  const result = await authorizeHermesDispatch(envelope(), env, new Date('2026-08-21T04:00:00Z'));
  assert.equal(result.decision, 'ACCEPT_DISPATCH');
  assert.equal(result.authorization_receipt.authority_decision, 'ALLOW_EXECUTION');
  assert.equal(result.authorization_receipt.mode, 'AUTHORIZATION_ONLY');
  assert.equal(result.invocation_performed, false);
  assert.equal(result.ops_event.state, 'AUTHORIZED');
  assert.equal(result.hermes_city.authority, 'PROJECTION_ONLY');
});

test('HERMES cannot self-authorize by injecting a decision or receipt', () => {
  const validation = validateHermesDispatchEnvelope(envelope({
    authority_decision: 'ALLOW_EXECUTION',
    authorization_receipt: { receipt_id: 'forged' },
  }));
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('HERMES dispatch may not supply an authority decision'));
  assert.ok(validation.errors.includes('HERMES dispatch may not supply an authorization receipt'));
});

test('district or app impersonation fails closed', () => {
  const validation = validateHermesDispatchEnvelope(envelope({
    execution_request: request({ district_id: 'finance-district', app_id: 'other-app' }),
  }));
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('district identity does not match execution request'));
  assert.ok(validation.errors.includes('app identity does not match execution request'));
});

test('unverified dispatch identity fails closed before authorization', async () => {
  const result = await authorizeHermesDispatch(envelope({ identity_attestation: 'UNVERIFIED' }), env);
  assert.equal(result.decision, 'DENY_DISPATCH');
  assert.equal(result.authorization_receipt, null);
  assert.equal(result.invocation_performed, false);
});

test('corridor policy remains authoritative over a verified HERMES dispatch', async () => {
  const result = await authorizeHermesDispatch(envelope(), { ...env, EXECUTION_CORRIDOR_ENABLED: 'false' });
  assert.equal(result.decision, 'DENY_DISPATCH');
  assert.equal(result.authorization_receipt.authority_decision, 'DENY_EXECUTION');
  assert.ok(result.reasons.includes('execution corridor is disabled'));
  assert.equal(result.invocation_performed, false);
});

test('audit record exposes references and hashes but no execution payload or capability secret material', async () => {
  const result = await authorizeHermesDispatch(envelope(), env, new Date('2026-08-21T04:00:00Z'));
  const audit = hermesDispatchAuditRecord(result, new Date('2026-08-21T04:00:01Z'));
  assert.equal(audit.record_type, 'HERMES_GOVERNED_DISPATCH');
  assert.equal(audit.dispatch_id, 'dispatch_65');
  assert.ok(audit.authorization_hash);
  assert.equal(audit.invocation_performed, false);
  assert.equal('execution_request' in audit, false);
  assert.equal('capability_handle' in audit, false);
});
