import test from 'node:test';
import assert from 'node:assert/strict';
import { GovernedHerdrRuntime } from '../integrations/herdr/production-adapter.mjs';

function makeAdapter() {
  return {
    contract: { adapter: 'herdr' },
    runner: (args) => ({ stdout: JSON.stringify({ pane_id: 'w1:p2' }), status: 0 }),
    detect: () => ({ available: true }),
    listAgents: () => ({ data: [] }),
    inspectSessions: () => ({ data: [] }),
    listPanes: () => ({ data: [] }),
    readAgent: () => ({ data: [] }),
    readPane: () => ({ data: [] }),
    waitAgent: () => ({ data: [] }),
    waitPane: () => ({ data: [] }),
    promptAgent: (agent, prompt, options) => ({ agent, prompt, context: options.context }),
    spawnAgent: (options) => options,
    runPane: (pane, command, options) => ({ pane, command, context: options.context })
  };
}

const managedEnv = {
  HERDR_ENV: '1',
  HERDR_WORKSPACE_ID: 'w1',
  HERDR_TAB_ID: 'w1:t1',
  HERDR_PANE_ID: 'w1:p2'
};

test('governed runtime permits read-only diagnostics outside managed session', () => {
  const runtime = new GovernedHerdrRuntime({ adapter: makeAdapter(), env: {} });
  assert.equal(runtime.detect().available, true);
  assert.deepEqual(runtime.listAgents().data, []);
});

test('governed runtime blocks prompt mutation outside managed session', () => {
  const runtime = new GovernedHerdrRuntime({ adapter: makeAdapter(), env: {} });
  assert.throws(() => runtime.promptAgent('reviewer', 'inspect only', { approved: true }), { code: 'HERDR_SESSION_REQUIRED' });
});

test('governed runtime injects managed context into mutation', () => {
  const runtime = new GovernedHerdrRuntime({ adapter: makeAdapter(), env: managedEnv });
  const result = runtime.runPane('w1:p3', 'npm test', { approved: true });
  assert.equal(result.context.complete, true);
  assert.equal(result.context.pane_id, 'w1:p2');
  assert.equal(result.context.socket_exposed, false);
});

test('governed runtime can verify inherited pane against runtime pane', () => {
  const runtime = new GovernedHerdrRuntime({ adapter: makeAdapter(), env: managedEnv });
  const verified = runtime.verifyContext();
  assert.equal(verified.runtime_match, true);
});
