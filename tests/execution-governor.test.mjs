import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authorizeExecution,
  EXECUTION_DECISIONS,
  validateCapabilityHandle,
  validateExecutionRequest,
} from '../src/execution-governor.js';

function request(overrides = {}) {
  return {
    request_id: 'req-1',
    production_id: 'prod-1',
    job_id: 'job-1',
    provider_id: 'provider-a',
    runtime_id: 'runtime-a',
    adapter_id: 'adapter-a',
    capability: 'video.generate',
    risk_class: 'MEDIUM',
    budget_class: 'STANDARD',
    capability_handle: {
      handle_id: 'cap-1',
      scope: 'video.generate',
      subject: 'creator-job-1',
      issuer: 'agentropolis-capability-broker',
      sealed: true,
    },
    attestations: {
      '54t': 'VERIFIED',
      adapter: 'VERIFIED',
      egress: 'VERIFIED',
      provider: 'VERIFIED',
    },
    provenance: {
      source: 'AGENTROPOLIS-CREATOR-CORE',
      assignment_plan_id: 'assign-1',
    },
    ...overrides,
  };
}

test('allows a fully attested medium-risk execution request without invoking a provider', async () => {
  const receipt = await authorizeExecution(request(), {
    allowed_capabilities: ['video.generate'],
    allowed_providers: ['provider-a'],
    allowed_runtimes: ['runtime-a'],
    allowed_budget_classes: ['STANDARD'],
  });
  assert.equal(receipt.decision, EXECUTION_DECISIONS.ALLOW);
  assert.equal(receipt.invocation_performed, false);
  assert.match(receipt.receipt_hash, /^[a-f0-9]{64}$/);
});

test('fails closed when 54-T evidence is absent', async () => {
  const input = request({ attestations: { adapter: 'VERIFIED', egress: 'VERIFIED', provider: 'VERIFIED' } });
  const receipt = await authorizeExecution(input);
  assert.equal(receipt.decision, EXECUTION_DECISIONS.DENY);
  assert.ok(receipt.reasons.includes('54-T attestation is missing or unverified'));
});

test('rejects raw secrets in capability handles', () => {
  const result = validateCapabilityHandle({
    handle_id: 'cap-1',
    scope: 'video.generate',
    subject: 'creator-job-1',
    issuer: 'broker',
    sealed: true,
    api_key: 'do-not-store-this',
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('capability_handle must not contain raw secrets'));
});

test('requires human approval for high-risk execution', async () => {
  const receipt = await authorizeExecution(request({ risk_class: 'HIGH' }));
  assert.equal(receipt.decision, EXECUTION_DECISIONS.DENY);
  assert.ok(receipt.reasons.includes('human approval is required'));
});

test('requires dual control for critical execution', async () => {
  const receipt = await authorizeExecution(request({
    risk_class: 'CRITICAL',
    human_approval: { state: 'APPROVED', approvers: ['operator-a'] },
  }));
  assert.equal(receipt.decision, EXECUTION_DECISIONS.DENY);
  assert.ok(receipt.reasons.includes('critical execution requires dual control'));
});

test('allows critical execution only with dual control when every hard gate passes', async () => {
  const receipt = await authorizeExecution(request({
    risk_class: 'CRITICAL',
    human_approval: { state: 'APPROVED', approvers: ['operator-a', 'operator-b'] },
  }));
  assert.equal(receipt.decision, EXECUTION_DECISIONS.ALLOW);
});

test('enforces provider, capability, runtime, and budget policy ceilings', async () => {
  const receipt = await authorizeExecution(request(), {
    allowed_capabilities: ['image.generate'],
    allowed_providers: ['provider-b'],
    allowed_runtimes: ['runtime-b'],
    allowed_budget_classes: ['LOW'],
  });
  assert.equal(receipt.decision, EXECUTION_DECISIONS.DENY);
  assert.equal(receipt.reasons.length, 4);
});

test('request validation requires provenance and capability handle', () => {
  const input = request();
  delete input.provenance;
  delete input.capability_handle;
  const result = validateExecutionRequest(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('provenance is required'));
});
