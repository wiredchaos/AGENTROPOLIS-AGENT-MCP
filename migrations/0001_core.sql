CREATE TABLE IF NOT EXISTS execution_receipts (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_version TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id_hash TEXT,
  authority_decision TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output_hash TEXT,
  status TEXT NOT NULL CHECK (status IN ('success','error')),
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_receipts_created ON execution_receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_tool ON execution_receipts(tool_name,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_request ON execution_receipts(request_id);
CREATE TABLE IF NOT EXISTS security_events (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info','warning','critical')),
  detail_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_security_created ON security_events(created_at DESC);
CREATE TABLE IF NOT EXISTS rate_limits (
  key_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL CHECK (count >= 0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (key_hash,window_start)
);
