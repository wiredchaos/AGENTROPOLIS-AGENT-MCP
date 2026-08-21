CREATE TABLE IF NOT EXISTS execution_ops_events (
  event_id TEXT PRIMARY KEY,
  authorization_receipt_id TEXT NOT NULL,
  production_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  runtime_id TEXT,
  state TEXT NOT NULL CHECK (state IN ('AUTHORIZED','QUEUED','STARTING','RUNNING','SUCCEEDED','FAILED','TIMED_OUT','CANCELLED','RECOVERING','DEAD_LETTERED')),
  attempt INTEGER NOT NULL DEFAULT 1 CHECK (attempt >= 0),
  timestamp TEXT NOT NULL,
  projection_json TEXT NOT NULL,
  FOREIGN KEY (authorization_receipt_id) REFERENCES execution_authorizations(receipt_id)
);
CREATE INDEX IF NOT EXISTS idx_ops_events_receipt ON execution_ops_events(authorization_receipt_id,timestamp);
CREATE INDEX IF NOT EXISTS idx_ops_events_job ON execution_ops_events(production_id,job_id,timestamp);
CREATE INDEX IF NOT EXISTS idx_ops_events_state ON execution_ops_events(state,timestamp);
