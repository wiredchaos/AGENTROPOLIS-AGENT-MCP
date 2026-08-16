import test from 'node:test';
import assert from 'node:assert/strict';
import { assertManagedHerdrSession, getHerdrSessionContext, verifyManagedHerdrSession } from '../integrations/herdr/session-context.mjs';

const managedEnv = {
  HERDR_ENV: '1',
  HERDR_WORKSPACE_ID: 'w1',
  HERDR_TAB_ID: 'w1:t1',
  HERDR_PANE_ID: 'w1:p2'
};

test('reports unmanaged context without exposing socket data', () => {
  const context = getHerdrSessionContext({});
  assert.equal(context.managed, false);
  assert.equal(context.complete, false);
  assert.equal(context.socket_exposed, false);
  assert.equal(context.context_fingerprint, null);
});

test('accepts complete managed HERDR context and fingerprints it', () => {
  const context = assertManagedHerdrSession(managedEnv);
  assert.equal(context.complete, true);
  assert.equal(context.workspace_id, 'w1');
  assert.equal(context.pane_id, 'w1:p2');
  assert.equal(context.context_fingerprint.length, 64);
});

test('rejects mutation context outside HERDR', () => {
  assert.throws(() => assertManagedHerdrSession({}), { code: 'HERDR_SESSION_REQUIRED' });
});

test('rejects incomplete managed identifiers', () => {
  assert.throws(() => assertManagedHerdrSession({ HERDR_ENV: '1', HERDR_WORKSPACE_ID: 'w1' }), { code: 'HERDR_CONTEXT_INCOMPLETE' });
});

test('runtime verification requires current pane to match inherited pane', () => {
  const runner = () => ({ stdout: JSON.stringify({ pane_id: 'w1:p2' }), status: 0 });
  const verified = verifyManagedHerdrSession({ runner, env: managedEnv });
  assert.equal(verified.runtime_match, true);
  assert.equal(verified.verification_state, 'runtime_matched');
});

test('runtime verification rejects a mismatched pane', () => {
  const runner = () => ({ stdout: JSON.stringify({ pane_id: 'w1:p9' }), status: 0 });
  assert.throws(() => verifyManagedHerdrSession({ runner, env: managedEnv }), { code: 'HERDR_CONTEXT_MISMATCH' });
});
