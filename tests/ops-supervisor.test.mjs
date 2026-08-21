import test from 'node:test';
import assert from 'node:assert/strict';
import { opsSupervisionEnabled, persistOpsEvent, listOpsEvents } from '../src/ops-supervisor.js';

function fakeDb() {
  const rows = [];
  return {
    rows,
    prepare(sql) {
      return {
        values: [],
        bind(...values) {
          this.values = values;
          return this;
        },
        async run() {
          if (!sql.includes('INSERT INTO execution_ops_events')) throw new Error('unexpected SQL');
          rows.push({
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
        async all() {
          if (!sql.includes('FROM execution_ops_events')) throw new Error('unexpected SQL');
          const limit = Number(this.values[this.values.length - 1]) || 25;
          let filtered = [...rows];
          let index = 0;
          if (sql.includes('job_id=?')) filtered = filtered.filter((row) => row.job_id === this.values[index++]);
          if (sql.includes('production_id=?')) filtered = filtered.filter((row) => row.production_id === this.values[index++]);
          if (sql.includes('authorization_receipt_id=?')) filtered = filtered.filter((row) => row.authorization_receipt_id === this.values[index++]);
          filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          return { results: filtered.slice(0, limit) };
        },
      };
    },
  };
}

test('OPS supervision flag is opt-in', () => {
  assert.equal(opsSupervisionEnabled({}), false);
  assert.equal(opsSupervisionEnabled({ OPS_SUPERVISION_ENABLED: 'false' }), false);
  assert.equal(opsSupervisionEnabled({ OPS_SUPERVISION_ENABLED: 'true' }), true);
});

test('OPS events persist with HERMES-CITY projection and can be read back', async () => {
  const db = fakeDb();
  const event = {
    event_id: 'ops_test_1',
    authorization_receipt_id: 'auth_test_1',
    production_id: 'production-1',
    job_id: 'job-1',
    runtime_id: 'runtime-1',
    state: 'QUEUED',
    attempt: 1,
    timestamp: '2026-08-21T08:00:00.000Z',
  };

  const persisted = await persistOpsEvent(db, event);
  assert.equal(persisted.persisted, true);
  assert.equal(persisted.projection.state, 'working');
  assert.equal(persisted.projection.authorization_receipt_id, 'auth_test_1');
  assert.equal(persisted.projection.authority, 'PROJECTION_ONLY');

  const rows = await listOpsEvents(db, { job_id: 'job-1', limit: 10 });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].event_id, 'ops_test_1');
  assert.equal(rows[0].state, 'QUEUED');
  assert.equal(rows[0].hermes_city.state, 'working');
  assert.equal(rows[0].hermes_city.authorization_receipt_id, 'auth_test_1');
});
