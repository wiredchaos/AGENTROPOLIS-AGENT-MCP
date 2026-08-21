CREATE TABLE IF NOT EXISTS execution_authorizations (
  receipt_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  production_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  runtime_id TEXT NOT NULL,
  adapter_id TEXT NOT NULL,
  capability TEXT NOT NULL,
  capability_handle_id TEXT NOT NULL,
  authority_decision TEXT NOT NULL CHECK (authority_decision IN ('ALLOW_EXECUTION','DENY_EXECUTION','REVIEW_REQUIRED')),
  policy_profile TEXT NOT NULL,
  risk_class TEXT NOT NULL,
  budget_class TEXT NOT NULL,
  attestation_summary TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  authorization_hash TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE','DENIED','REVOKED','EXPIRED'))
);
CREATE INDEX IF NOT EXISTS idx_execution_auth_job ON execution_authorizations(production_id,job_id);
CREATE INDEX IF NOT EXISTS idx_execution_auth_scope ON execution_authorizations(provider_id,runtime_id,capability);
CREATE INDEX IF NOT EXISTS idx_execution_auth_expiry ON execution_authorizations(expires_at,status);
