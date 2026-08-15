CREATE TABLE IF NOT EXISTS jspace_projection_snapshots (
  revision TEXT PRIMARY KEY,
  schema_version TEXT NOT NULL,
  source TEXT NOT NULL,
  source_revision TEXT,
  node_count INTEGER NOT NULL CHECK(node_count >= 0),
  edge_count INTEGER NOT NULL CHECK(edge_count >= 0),
  snapshot_json TEXT NOT NULL,
  actor_id_hash TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_jspace_projection_created ON jspace_projection_snapshots(created_at DESC);

CREATE TABLE IF NOT EXISTS jspace_projection_state (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  active_revision TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
