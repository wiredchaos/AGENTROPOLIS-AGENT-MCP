const MAX_NODES = 500;
const MAX_EDGES = 1500;
const MAX_TAGS = 24;
const MAX_TEXT = 1200;
const ALLOWED_SCOPES = new Set(["DEFAULT", "ARCHIVE", "REVIEW"]);
const ALLOWED_STATES = new Set(["PLANNED", "IMPLEMENTED", "DEPLOYED", "OBSERVED", "VERIFIED", "UNVERIFIED"]);
const ALLOWED_TYPES = new Set(["note", "evidence", "claim", "entity", "decision", "challenge", "task", "canon", "relationship", "artifact", "memory"]);
const SECRET_KEY = /(secret|token|password|private.?key|seed.?phrase|credential|authorization|bearer)/i;

export function validateProjectionInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return "projection must be an object";
  if (!Array.isArray(input.nodes)) return "nodes must be an array";
  if (!Array.isArray(input.edges)) return "edges must be an array";
  if (input.nodes.length > MAX_NODES) return `node limit exceeded (${MAX_NODES})`;
  if (input.edges.length > MAX_EDGES) return `edge limit exceeded (${MAX_EDGES})`;
  if (containsSecretLikeKeys(input)) return "secret-like fields are not allowed in JSpace projections";

  const ids = new Set();
  for (const node of input.nodes) {
    const issue = validateNode(node);
    if (issue) return issue;
    if (ids.has(node.id)) return `duplicate node id: ${node.id}`;
    ids.add(node.id);
  }
  for (const edge of input.edges) {
    const issue = validateEdge(edge, ids);
    if (issue) return issue;
  }
  return null;
}

export function normalizeProjectionInput(input) {
  const nodes = input.nodes
    .filter((node) => String(node.scope || "DEFAULT").toUpperCase() !== "SECURITY_ONLY")
    .map((node) => ({
      id: clean(node.id, 180),
      type: ALLOWED_TYPES.has(node.type) ? node.type : "memory",
      title: clean(node.title, 240),
      summary: clean(node.summary || "", MAX_TEXT),
      namespace: clean(node.namespace || "", 180),
      evidenceState: ALLOWED_STATES.has(String(node.evidenceState || "").toUpperCase()) ? String(node.evidenceState).toUpperCase() : "UNVERIFIED",
      verificationState: clean(node.verificationState || "unverified", 64).toLowerCase(),
      challengeState: clean(node.challengeState || "none", 64).toLowerCase(),
      confidence: bounded(node.confidence, 0, 1, null),
      torque: bounded(node.torque, 0, 1, null),
      sourceUri: clean(node.sourceUri || "", 500),
      sourceRef: clean(node.sourceRef || "", 240),
      provenanceHash: clean(node.provenanceHash || "", 128),
      updatedAt: clean(node.updatedAt || "", 64),
      scope: clean(node.scope || "DEFAULT", 32).toUpperCase(),
      tags: Array.isArray(node.tags) ? node.tags.slice(0, MAX_TAGS).map((v) => clean(v, 80)).filter(Boolean) : []
    }));
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = input.edges
    .filter((edge) => nodeIds.has(String(edge.from)) && nodeIds.has(String(edge.to)))
    .map((edge) => ({
      id: clean(edge.id, 180),
      from: clean(edge.from, 180),
      to: clean(edge.to, 180),
      relation: clean(edge.relation || "related_to", 80).toLowerCase(),
      weight: bounded(edge.weight, 0, 1, 0.5),
      confidence: bounded(edge.confidence, 0, 1, null)
    }));
  return {
    schema: "agentropolis.jspace.memory-projection.v1",
    authority: "DERIVED_READ_ONLY_PROJECTION",
    source: clean(input.source || "wikivault-export", 120),
    sourceRevision: clean(input.sourceRevision || "", 180),
    generatedAt: clean(input.generatedAt || new Date().toISOString(), 64),
    nodes,
    edges,
    stats: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      challenged: nodes.filter((n) => n.challengeState !== "none").length,
      verified: nodes.filter((n) => n.evidenceState === "VERIFIED" || n.verificationState === "verified").length
    }
  };
}

export async function storeProjection(db, projection, actorIdHash) {
  await ensureProjectionSchema(db);
  const payload = stable(projection);
  const revision = await sha256(payload);
  const now = new Date().toISOString();
  await db.batch([
    db.prepare("INSERT OR REPLACE INTO jspace_projection_snapshots(revision,schema_version,source,source_revision,node_count,edge_count,snapshot_json,actor_id_hash,created_at) VALUES(?,?,?,?,?,?,?,?,?)")
      .bind(revision, projection.schema, projection.source, projection.sourceRevision, projection.nodes.length, projection.edges.length, JSON.stringify(projection), actorIdHash, now),
    db.prepare("INSERT INTO jspace_projection_state(id,active_revision,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET active_revision=excluded.active_revision,updated_at=excluded.updated_at")
      .bind(revision, now)
  ]);
  return { revision, createdAt: now, nodeCount: projection.nodes.length, edgeCount: projection.edges.length };
}

export async function readProjection(db) {
  await ensureProjectionSchema(db);
  const row = await db.prepare("SELECT p.revision,p.schema_version,p.source,p.source_revision,p.snapshot_json,p.created_at FROM jspace_projection_state s JOIN jspace_projection_snapshots p ON p.revision=s.active_revision WHERE s.id=1").first();
  if (!row) return null;
  const projection = JSON.parse(row.snapshot_json);
  return {
    revision: row.revision,
    schema: row.schema_version,
    source: row.source,
    sourceRevision: row.source_revision,
    createdAt: row.created_at,
    projection
  };
}

export async function listProjectionRevisions(db, limit = 20) {
  await ensureProjectionSchema(db);
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 20));
  const active = await db.prepare("SELECT active_revision FROM jspace_projection_state WHERE id=1").first();
  const rows = await db.prepare("SELECT revision,schema_version,source,source_revision,node_count,edge_count,created_at FROM jspace_projection_snapshots ORDER BY created_at DESC LIMIT ?")
    .bind(safeLimit).all();
  return (rows?.results || []).map((row) => ({
    revision: row.revision,
    schema: row.schema_version,
    source: row.source,
    sourceRevision: row.source_revision,
    nodeCount: Number(row.node_count || 0),
    edgeCount: Number(row.edge_count || 0),
    createdAt: row.created_at,
    active: row.revision === active?.active_revision
  }));
}

export async function activateProjectionRevision(db, revision, actorIdHash) {
  await ensureProjectionSchema(db);
  const cleanRevision = clean(revision, 128);
  if (!cleanRevision) return { activated: false, reason: "REVISION_REQUIRED" };
  const row = await db.prepare("SELECT revision,node_count,edge_count,source,source_revision,created_at FROM jspace_projection_snapshots WHERE revision=?")
    .bind(cleanRevision).first();
  if (!row) return { activated: false, reason: "REVISION_NOT_FOUND" };
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO jspace_projection_state(id,active_revision,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET active_revision=excluded.active_revision,updated_at=excluded.updated_at")
    .bind(cleanRevision, now).run();
  return {
    activated: true,
    revision: cleanRevision,
    nodeCount: Number(row.node_count || 0),
    edgeCount: Number(row.edge_count || 0),
    source: row.source,
    sourceRevision: row.source_revision,
    snapshotCreatedAt: row.created_at,
    activatedAt: now,
    actorIdHash
  };
}

export function projectionFreshness(createdAt, maxAgeSeconds = 3600, nowMs = Date.now()) {
  const parsed = Date.parse(String(createdAt || ""));
  const maxAge = Math.max(60, Number(maxAgeSeconds) || 3600);
  if (!Number.isFinite(parsed)) return { stale: true, ageSeconds: null, maxAgeSeconds: maxAge, state: "STALE_UNKNOWN_AGE" };
  const ageSeconds = Math.max(0, Math.floor((nowMs - parsed) / 1000));
  return {
    stale: ageSeconds > maxAge,
    ageSeconds,
    maxAgeSeconds: maxAge,
    state: ageSeconds > maxAge ? "STALE_PROJECTION" : "FRESH_PROJECTION"
  };
}

export async function ensureProjectionSchema(db) {
  if (!db) throw new Error("D1 binding unavailable");
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS jspace_projection_snapshots (revision TEXT PRIMARY KEY,schema_version TEXT NOT NULL,source TEXT NOT NULL,source_revision TEXT,node_count INTEGER NOT NULL CHECK(node_count>=0),edge_count INTEGER NOT NULL CHECK(edge_count>=0),snapshot_json TEXT NOT NULL,actor_id_hash TEXT,created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_jspace_projection_created ON jspace_projection_snapshots(created_at DESC)"),
    db.prepare("CREATE TABLE IF NOT EXISTS jspace_projection_state (id INTEGER PRIMARY KEY CHECK(id=1),active_revision TEXT NOT NULL,updated_at TEXT NOT NULL)")
  ]);
}

function validateNode(node) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return "each node must be an object";
  if (!clean(node.id, 180)) return "each node requires id";
  if (!clean(node.title, 240)) return `node ${node.id || "?"} requires title`;
  if (String(node.scope || "DEFAULT").toUpperCase() === "SECURITY_ONLY") return null;
  if (node.tags !== undefined && (!Array.isArray(node.tags) || node.tags.length > MAX_TAGS)) return `invalid tags for node ${node.id}`;
  if (node.confidence !== undefined && !isUnit(node.confidence)) return `invalid confidence for node ${node.id}`;
  if (node.torque !== undefined && !isUnit(node.torque)) return `invalid torque for node ${node.id}`;
  return null;
}

function validateEdge(edge, ids) {
  if (!edge || typeof edge !== "object" || Array.isArray(edge)) return "each edge must be an object";
  if (!clean(edge.id, 180)) return "each edge requires id";
  if (!ids.has(String(edge.from)) || !ids.has(String(edge.to))) return `edge ${edge.id} references unknown nodes`;
  if (edge.weight !== undefined && !isUnit(edge.weight)) return `invalid weight for edge ${edge.id}`;
  if (edge.confidence !== undefined && !isUnit(edge.confidence)) return `invalid confidence for edge ${edge.id}`;
  return null;
}

function containsSecretLikeKeys(value, depth = 0) {
  if (depth > 8 || value == null) return false;
  if (Array.isArray(value)) return value.some((v) => containsSecretLikeKeys(v, depth + 1));
  if (typeof value !== "object") return false;
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEY.test(key)) return true;
    if (containsSecretLikeKeys(child, depth + 1)) return true;
  }
  return false;
}

function clean(value, max) { return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max); }
function isUnit(value) { const n = Number(value); return Number.isFinite(n) && n >= 0 && n <= 1; }
function bounded(value, min, max, fallback) { const n = Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
async function sha256(value) { const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value))); return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join(""); }
function stable(value) { if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`; if (value && typeof value === "object") return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(",")}}`; return JSON.stringify(value); }
