CREATE TABLE IF NOT EXISTS execution_canary_admissions (
  admission_id TEXT PRIMARY KEY,
  slot INTEGER NOT NULL UNIQUE CHECK (slot >= 1),
  authorization_receipt_id TEXT NOT NULL,
  production_id TEXT NOT NULL,
  job_id TEXT NOT NULL UNIQUE,
  provider_id TEXT NOT NULL,
  runtime_id TEXT NOT NULL,
  capability TEXT NOT NULL,
  budget_class TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('RESERVED','STARTING','RUNNING','SUCCEEDED','FAILED','TIMED_OUT','CANCELLED','RELEASED')),
  reserved_at TEXT NOT NULL,
  released_at TEXT,
  FOREIGN KEY (authorization_receipt_id) REFERENCES execution_authorizations(receipt_id)
);
CREATE INDEX IF NOT EXISTS idx_canary_admissions_receipt ON execution_canary_admissions(authorization_receipt_id,status);
CREATE INDEX IF NOT EXISTS idx_canary_admissions_status ON execution_canary_admissions(status,reserved_at);
CREATE INDEX IF NOT EXISTS idx_canary_admissions_provider_runtime ON execution_canary_admissions(provider_id,runtime_id,status);
