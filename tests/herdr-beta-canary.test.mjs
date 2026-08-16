import test from 'node:test';
import assert from 'node:assert/strict';
import { assessRestoreReadiness, runHerdrBetaCanary } from '../integrations/herdr/beta-canary.mjs';

const env = {
  HERDR_ENV: '1',
  HERDR_WORKSPACE_ID: 'w1',
  HERDR_TAB_ID: 'w1:t1',
  HERDR_PANE_ID: 'w1:p2'
};

function fakeReceipt(id) {
  return { receipt_id: id, verification_state: 'unverified', correctness_inference: false };
}

function makeAdapter() {
  const runner = (args) => {
    if (args[0] === 'pane' && args[1] === 'current') return { stdout: JSON.stringify({ pane_id: 'w1:p2' }), status: 0 };
    return { stdout: '{}', status: 0 };
  };
  return {
    runner,
    detect: () => ({ available: true, adapter: 'herdr' }),
    listAgents: () => ({
      data: {
        agents: [
          { name: 'hermes-main', kind: 'hermes', session_id: 'h-123', state: 'idle' },
          { name: 'codex-reviewer', kind: 'codex', resumable_session_id: 'c-456', state: 'blocked' }
        ]
      },
      receipt: fakeReceipt('r1')
    }),
    inspectSessions: () => ({ data: { sessions: [{ id: 's1' }] }, receipt: fakeReceipt('r2') })
  };
}

test('restore readiness detects Hermes and Codex resumable identity without exposing ids', () => {
  const readiness = assessRestoreReadiness({ agents: [
    { kind: 'hermes', session_id: 'secret-session-id' },
    { kind: 'codex', resume_id: 'another-session-id' }
  ] });
  assert.deepEqual(readiness.hermes, { detected: true, session_identity_present: true });
  assert.deepEqual(readiness.codex, { detected: true, session_identity_present: true });
  assert.equal(JSON.stringify(readiness).includes('secret-session-id'), false);
});

test('beta canary validates managed context, telemetry, and restore readiness', () => {
  const canary = runHerdrBetaCanary({ adapter: makeAdapter(), env });
  assert.equal(canary.passed, true);
  assert.equal(canary.managed_session.runtime_match, true);
  assert.equal(canary.managed_session.socket_exposed, false);
  assert.equal(canary.telemetry.receipts_emitted, true);
  assert.equal(canary.telemetry.correctness_inference, false);
  assert.equal(canary.restore_readiness.hermes.session_identity_present, true);
  assert.equal(canary.restore_readiness.codex.session_identity_present, true);
  assert.equal(canary.public_mcp_authority_changed, false);
});

test('beta canary refuses to run without a managed HERDR session', () => {
  assert.throws(() => runHerdrBetaCanary({ adapter: makeAdapter(), env: {} }), { code: 'HERDR_SESSION_REQUIRED' });
});

test('beta canary refuses unavailable HERDR', () => {
  const adapter = makeAdapter();
  adapter.detect = () => ({ available: false, adapter: 'herdr' });
  assert.throws(() => runHerdrBetaCanary({ adapter, env }), { code: 'HERDR_NOT_AVAILABLE' });
});
