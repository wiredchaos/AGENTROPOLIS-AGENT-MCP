import { createOpsEvent, toHermesCityProjection } from './execution-corridor.js';

const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

export function opsSupervisionEnabled(env = {}) {
  return env.OPS_SUPERVISION_ENABLED === 'true';
}

export async function persistOpsEvent(db, event) {
  if (!db) throw new Error('D1 binding unavailable');
  const projection = toHermesCityProjection(event.state, event);
  await db.prepare(`INSERT INTO execution_ops_events
    (event_id,authorization_receipt_id,production_id,job_id,runtime_id,state,attempt,timestamp,projection_json)
    VALUES (?,?,?,?,?,?,?,?,?)`)
    .bind(
      event.event_id,
      event.authorization_receipt_id,
      event.production_id,
      event.job_id,
      event.runtime_id,
      event.state,
      event.attempt,
      event.timestamp,
      JSON.stringify(projection),
    ).run();
  return { event, projection, persisted: true };
}

export async function recordOpsEvent(db, state, receipt, attempt = 1, now = new Date()) {
  const event = createOpsEvent(state, receipt, attempt, now);
  return persistOpsEvent(db, event);
}

export async function listOpsEvents(db, filters = {}) {
  if (!db) throw new Error('D1 binding unavailable');
  const limit = Math.min(Math.max(Number(filters.limit) || 25, 1), 100);
  let sql = `SELECT event_id,authorization_receipt_id,production_id,job_id,runtime_id,state,attempt,timestamp,projection_json
    FROM execution_ops_events`;
  const binds = [];
  const clauses = [];
  if (nonEmpty(filters.job_id)) {
    clauses.push('job_id=?');
    binds.push(filters.job_id);
  }
  if (nonEmpty(filters.production_id)) {
    clauses.push('production_id=?');
    binds.push(filters.production_id);
  }
  if (nonEmpty(filters.authorization_receipt_id)) {
    clauses.push('authorization_receipt_id=?');
    binds.push(filters.authorization_receipt_id);
  }
  if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
  sql += ' ORDER BY timestamp DESC LIMIT ?';
  binds.push(limit);
  const result = await db.prepare(sql).bind(...binds).all();
  const rows = result?.results || [];
  return rows.map((row) => {
    let projection = null;
    try {
      projection = typeof row.projection_json === 'string' ? JSON.parse(row.projection_json) : row.projection_json;
    } catch {
      projection = null;
    }
    return {
      event_id: row.event_id,
      authorization_receipt_id: row.authorization_receipt_id,
      production_id: row.production_id,
      job_id: row.job_id,
      runtime_id: row.runtime_id,
      state: row.state,
      attempt: row.attempt,
      timestamp: row.timestamp,
      hermes_city: projection,
    };
  });
}
