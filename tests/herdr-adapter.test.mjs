import test from 'node:test';
import assert from 'node:assert/strict';
import { HerdrAdapter, HerdrAdapterError, normalizeState, redactSecrets } from '../integrations/herdr/adapter.mjs';
import { toWorkflowGenomeObservation } from '../integrations/herdr/watchtower-bridge.mjs';

function fakeRunner(overrides = {}) {
  const calls = [];
  const runner = (args) => {
    calls.push(args);
    const key = args.slice(0, 2).join(' ');
    const payload = overrides[key] ?? overrides[args[0]] ?? { result: { ok: true } };
    return { status: 0, stdout: JSON.stringify(payload), stderr: '' };
  };
  runner.calls = calls;
  return runner;
}

test('normalizes only registered HERDR lifecycle states', () => {
  assert.equal(normalizeState('working'), 'working');
  assert.equal(normalizeState('BLOCKED'), 'blocked');
  assert.equal(normalizeState('complete'), 'unknown');
});

test('redacts secret-shaped material', () => {
  const text = redactSecrets('Authorization: Bearer abc123 OPENAI_API_KEY=sk-live-1234567890');
  assert.doesNotMatch(text, /abc123|sk-live-1234567890/);
});

test('read-only inspection works without approval', () => {
  const adapter = new HerdrAdapter({ runner: fakeRunner({ 'agent list': { result: { agents: [{ name: 'reviewer', state: 'idle' }] } } }) });
  const result = adapter.listAgents();
  assert.equal(result.receipt.capability, 'runtime.agent.list');
  assert.equal(result.receipt.status, 'ok');
  assert.equal(result.receipt.verification_state, 'unverified');
});

test('execution requires approval or allowing policy', () => {
  const runner = fakeRunner({ 'agent get': { result: { state: 'idle' } }, 'agent prompt': { result: { accepted: true } } });
  const adapter = new HerdrAdapter({ runner });
  assert.throws(() => adapter.promptAgent('reviewer', 'review the diff'), (error) => error instanceof HerdrAdapterError && error.code === 'APPROVAL_REQUIRED');
  const allowed = adapter.promptAgent('reviewer', 'review the diff', { approved: true });
  assert.equal(allowed.receipt.status, 'ok');
  assert.equal(allowed.receipt.state_before, 'idle');
  assert.equal(allowed.receipt.state_after, 'idle');
});

test('dangerous pane commands are denied even after approval and emit denial receipts', () => {
  const receipts = [];
  const adapter = new HerdrAdapter({ runner: fakeRunner(), receiptSink: (x) => receipts.push(x) });
  assert.throws(() => adapter.runPane('w1:p2', 'git push origin main', { approved: true }), (error) => error instanceof HerdrAdapterError && error.code === 'COMMAND_BLOCKED');
  assert.throws(() => adapter.runPane('w1:p2', 'cat .env', { approved: true }), (error) => error instanceof HerdrAdapterError && error.code === 'COMMAND_BLOCKED');
  assert.equal(receipts.length, 2);
  assert.equal(receipts[0].status, 'denied');
  assert.equal(receipts[0].policy_state, 'denied');
});

test('bounded terminal reads reject excessive line counts', () => {
  const adapter = new HerdrAdapter({ runner: fakeRunner() });
  assert.throws(() => adapter.readPane('w1:p2', { lines: 1000 }), (error) => error instanceof HerdrAdapterError && error.code === 'INVALID_BOUND');
});

test('receipt and WATCHTOWER event do not preserve raw secrets or correctness claims', () => {
  const receipts = [];
  const events = [];
  const runner = fakeRunner({ 'agent list': { result: { token: 'ghp_1234567890', agents: [{ name: 'x', state: 'done' }] } } });
  const adapter = new HerdrAdapter({ runner, receiptSink: (x) => receipts.push(x), watchtowerSink: (x) => events.push(x), now: () => '2026-08-16T03:00:00.000Z' });
  const result = adapter.listAgents();
  assert.equal(result.data.result.token, '[REDACTED]');
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].correctness_inference, false);
  assert.equal(events[0].verification_state, 'unverified');
  assert.equal(events[0].correctness_inference, false);
});

test('Workflow Genome projection is observation-only and never immediately promotable', () => {
  const observation = toWorkflowGenomeObservation({ receipt_id: 'r1', agent_name: 'reviewer', workspace_id: 'w1', pane_id: 'w1:p2', capability: 'runtime.agent.prompt', transition: 'working->done', observed_at: '2026-08-16T03:00:00Z', state_after: 'done' });
  assert.equal(observation.promotable, false);
  assert.equal(observation.verification_state, 'unverified');
  assert.equal(observation.correctness_inference, false);
});

test('invalid handles are rejected before command execution', () => {
  const runner = fakeRunner();
  const adapter = new HerdrAdapter({ runner });
  assert.throws(() => adapter.readAgent('../../secrets'), (error) => error instanceof HerdrAdapterError && error.code === 'INVALID_HANDLE');
  assert.equal(runner.calls.length, 0);
});

test('policy may authorize a bounded execution action without approval flag', () => {
  const adapter = new HerdrAdapter({ runner: fakeRunner(), policy: () => ({ decision: 'allow' }) });
  const result = adapter.runPane('w1:p2', 'npm test');
  assert.equal(result.receipt.policy_state, 'allowed');
});
