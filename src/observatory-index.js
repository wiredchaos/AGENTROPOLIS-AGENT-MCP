import baseWorker from "./index.js";
import { DISTRICTS, TOOLS as BASE_TOOLS } from "./core.js";
import {
  OBSERVATORY_TOOLS,
  OBSERVATORY_VIEWS,
  buildObservatorySnapshot,
  observatoryViewForTool,
  validateObservatoryArguments
} from "./observatory.js";

const ALL_TOOLS = [...BASE_TOOLS, ...OBSERVATORY_TOOLS];
const MCP_PATHS = new Set(["/mcp", "/mcp/"]);
let schemaReady;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = request.headers.get("cf-ray") || crypto.randomUUID();
    try {
      if (request.method === "OPTIONS") return decorate(new Response(null, { status: 204 }), request, env, requestId);

      if ((url.pathname === "/.well-known/mcp.json" || url.pathname === "/api/manifest") && request.method === "GET") {
        const base = await baseWorker.fetch(request, env, ctx);
        const manifest = await base.json();
        manifest.tools = ALL_TOOLS.map(({ name, title, description, annotations }) => ({ name, title, description, annotations }));
        manifest.endpoints = { ...(manifest.endpoints || {}), observatory: "/api/observatory" };
        manifest.observatory = {
          name: "AGENTROPOLIS Intelligence Observatory",
          views: OBSERVATORY_VIEWS,
          telemetry: "canonical baseline with optional D1 receipt aggregates",
          authority: "READ_ONLY"
        };
        return decorate(json(manifest), request, env, requestId);
      }

      if (url.pathname === "/api/tools" && request.method === "GET") {
        return decorate(json({ tools: ALL_TOOLS }), request, env, requestId);
      }

      if (url.pathname === "/api/observatory" && request.method === "GET") {
        const guard = requestGuard(request, env);
        if (guard) return decorate(guard, request, env, requestId);
        const rate = await rateLimit(request, env);
        if (!rate.allowed) return decorate(errorJson(429, "RATE_LIMITED", "Request limit exceeded."), request, env, requestId);
        const view = url.searchParams.get("view") || "all";
        if (!["all", ...OBSERVATORY_VIEWS].includes(view)) return decorate(errorJson(400, "INVALID_VIEW", "Unknown observatory view."), request, env, requestId);
        const identity = await actorIdentity(request, env);
        const toolName = toolForView(view);
        const result = await executeObservatory(toolName, view === "all" ? { view } : {}, env, requestId, identity);
        return decorate(json(result.output), request, env, requestId);
      }

      if (MCP_PATHS.has(url.pathname) && request.method === "POST") {
        const message = await tryReadJson(request.clone(), env);
        if (message?.method === "tools/list") {
          const gate = await mcpGate(request, env);
          if (gate) return decorate(gate, request, env, requestId);
          return decorate(rpcResult(message.id ?? null, { tools: ALL_TOOLS }), request, env, requestId);
        }
        if (message?.method === "tools/call" && isObservatoryTool(message.params?.name)) {
          const gate = await mcpGate(request, env);
          if (gate) return decorate(gate, request, env, requestId);
          const name = message.params?.name;
          const args = message.params?.arguments || {};
          const tool = OBSERVATORY_TOOLS.find((item) => item.name === name);
          const problem = validateObservatoryArguments(tool, args);
          if (problem) return decorate(rpcError(message.id ?? null, -32602, problem), request, env, requestId);
          const identity = await actorIdentity(request, env);
          const result = await executeObservatory(name, args, env, requestId, identity);
          return decorate(rpcResult(message.id ?? null, {
            content: [{ type: "text", text: JSON.stringify(result.output, null, 2) }],
            structuredContent: result.output,
            isError: false,
            _meta: { receiptId: result.receipt.id, receiptPersisted: result.receipt.persisted }
          }), request, env, requestId);
        }
      }

      return baseWorker.fetch(request, env, ctx);
    } catch (error) {
      console.error(JSON.stringify({ event: "observatory_wrapper_error", requestId, path: url.pathname, message: error instanceof Error ? error.message : "unknown" }));
      return decorate(errorJson(error?.status || 500, error?.code || "OBSERVATORY_ERROR", error?.status ? error.message : "The Intelligence Observatory could not complete the request."), request, env, requestId);
    }
  }
};

async function mcpGate(request, env) {
  const guard = requestGuard(request, env);
  if (guard) return guard;
  const auth = authorizeMcp(request, env);
  if (auth) return auth;
  const rate = await rateLimit(request, env);
  if (!rate.allowed) return errorJson(429, "RATE_LIMITED", "Request limit exceeded.");
  return null;
}

async function executeObservatory(name, args, env, requestId, identity) {
  const started = Date.now();
  const view = observatoryViewForTool(name, args);
  if (!view) throw Object.assign(new Error("Unknown observatory tool"), { status: 400, code: "UNKNOWN_TOOL" });
  const runtime = await observatoryRuntime(env);
  const observatory = buildObservatorySnapshot(view, DISTRICTS, runtime);
  const rawOutput = { observatory };
  const receipt = await writeReceipt(env, {
    requestId,
    toolName: name,
    actorType: identity.actorType,
    actorIdHash: identity.actorIdHash,
    input: args,
    output: rawOutput,
    durationMs: Date.now() - started
  });
  return { output: { ...rawOutput, receipt }, receipt };
}

async function observatoryRuntime(env) {
  try {
    await ensureSchema(env.DB);
    const aggregate = await env.DB.prepare("SELECT COUNT(*) AS receipt_count, AVG(duration_ms) AS avg_duration_ms, MAX(created_at) AS last_receipt_at FROM execution_receipts").first();
    const calls = await env.DB.prepare("SELECT tool_name, COUNT(*) AS count, AVG(duration_ms) AS avg_duration_ms, MAX(created_at) AS last_called_at FROM execution_receipts GROUP BY tool_name ORDER BY count DESC LIMIT 20").all();
    return {
      receiptCount: Number(aggregate?.receipt_count || 0),
      avgDurationMs: Number(Number(aggregate?.avg_duration_ms || 0).toFixed(2)),
      lastReceiptAt: aggregate?.last_receipt_at || null,
      toolCalls: (calls.results || []).map((row) => ({
        tool: row.tool_name,
        count: Number(row.count || 0),
        avgDurationMs: Number(Number(row.avg_duration_ms || 0).toFixed(2)),
        lastCalledAt: row.last_called_at || null
      }))
    };
  } catch {
    return { receiptCount: 0, avgDurationMs: 0, lastReceiptAt: null, toolCalls: [] };
  }
}

async function writeReceipt(env, data) {
  const receipt = { id: `rcpt_${crypto.randomUUID()}`, persisted: false, authorityDecision: "ALLOW_READ_ONLY" };
  try {
    await ensureSchema(env.DB);
    await env.DB.prepare("INSERT INTO execution_receipts (id,request_id,tool_name,tool_version,actor_type,actor_id_hash,authority_decision,input_hash,output_hash,status,duration_ms,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(
        receipt.id,
        data.requestId,
        data.toolName,
        "1.0.0",
        data.actorType,
        data.actorIdHash,
        "ALLOW_READ_ONLY",
        await sha256(stable(data.input)),
        await sha256(stable(data.output)),
        "success",
        data.durationMs,
        new Date().toISOString()
      ).run();
    receipt.persisted = true;
  } catch (error) {
    console.warn(JSON.stringify({ event: "observatory_receipt_persistence_failed", receiptId: receipt.id, message: error instanceof Error ? error.message : "unknown" }));
  }
  return receipt;
}

async function ensureSchema(db) {
  if (!schemaReady) schemaReady = db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS execution_receipts (id TEXT PRIMARY KEY,request_id TEXT NOT NULL,tool_name TEXT NOT NULL,tool_version TEXT NOT NULL,actor_type TEXT NOT NULL,actor_id_hash TEXT,authority_decision TEXT NOT NULL,input_hash TEXT NOT NULL,output_hash TEXT,status TEXT NOT NULL CHECK(status IN ('success','error')),duration_ms INTEGER NOT NULL CHECK(duration_ms>=0),created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_receipts_created ON execution_receipts(created_at DESC)"),
    db.prepare("CREATE TABLE IF NOT EXISTS rate_limits (key_hash TEXT NOT NULL,window_start INTEGER NOT NULL,count INTEGER NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(key_hash,window_start))")
  ]).catch((error) => { schemaReady = undefined; throw error; });
  return schemaReady;
}

async function rateLimit(request, env) {
  try {
    await ensureSchema(env.DB);
    const windowSeconds = positive(env.RATE_LIMIT_WINDOW_SECONDS, 60);
    const limit = positive(env.RATE_LIMIT_MAX_REQUESTS, 120);
    const now = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
    const key = await sha256(`${request.headers.get("cf-connecting-ip") || "unknown"}:${new URL(request.url).pathname}:observatory`);
    await env.DB.prepare("INSERT INTO rate_limits(key_hash,window_start,count,updated_at) VALUES(?,?,1,?) ON CONFLICT(key_hash,window_start) DO UPDATE SET count=count+1,updated_at=excluded.updated_at")
      .bind(key, windowStart, new Date().toISOString()).run();
    const row = await env.DB.prepare("SELECT count FROM rate_limits WHERE key_hash=? AND window_start=?").bind(key, windowStart).first();
    return { allowed: Number(row?.count || 1) <= limit };
  } catch {
    return { allowed: true, degraded: true };
  }
}

function requestGuard(request, env) {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  if (host && host !== url.host) return errorJson(400, "HOST_MISMATCH", "Host header does not match the request URL.");
  const origin = request.headers.get("origin");
  if (origin && !originAllowed(origin, url.origin, env.ALLOWED_ORIGINS)) return errorJson(403, "ORIGIN_DENIED", "Origin is not allowed.");
  const length = Number(request.headers.get("content-length") || 0);
  if (length > positive(env.MAX_REQUEST_BYTES, 131072)) return errorJson(413, "REQUEST_TOO_LARGE", "Request body exceeds the configured limit.");
  return null;
}

function authorizeMcp(request, env) {
  if (env.PUBLIC_MCP_ENABLED === "false" || env.MCP_AUTH_MODE === "disabled") return errorJson(503, "MCP_DISABLED", "The MCP endpoint is disabled.");
  if (env.MCP_AUTH_MODE === "token") {
    if (!env.MCP_API_TOKEN) return errorJson(503, "OPERATOR_TOKEN_NOT_CONFIGURED", "Operator access is not configured.");
    const token = bearer(request);
    if (!token || !constantEqual(token, env.MCP_API_TOKEN)) return errorJson(401, "UNAUTHORIZED", "A valid bearer token is required.", { "www-authenticate": "Bearer" });
  }
  return null;
}

async function actorIdentity(request, env) {
  const token = bearer(request);
  return token && env.MCP_API_TOKEN && constantEqual(token, env.MCP_API_TOKEN)
    ? { actorType: "operator", actorIdHash: await sha256(token) }
    : { actorType: "anonymous", actorIdHash: null };
}

async function tryReadJson(request, env) {
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > positive(env.MAX_REQUEST_BYTES, 131072)) return null;
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
}

function toolForView(view) {
  if (view === "topology") return "get_agentropolis_topology";
  if (view === "thermodynamics") return "get_agentropolis_thermodynamics";
  if (view === "memory_evolution") return "get_agentropolis_memory_evolution";
  if (view === "skill_development") return "get_agentropolis_skill_development";
  return "get_agentropolis_observatory_snapshot";
}

function isObservatoryTool(name) {
  return OBSERVATORY_TOOLS.some((tool) => tool.name === name);
}

function decorate(response, request, env, requestId) {
  const headers = new Headers(response.headers);
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && originAllowed(origin, url.origin, env.ALLOWED_ORIGINS)) {
    headers.set("access-control-allow-origin", origin);
    headers.append("vary", "Origin");
  }
  headers.set("access-control-allow-methods", "GET,POST,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "Authorization,Content-Type,MCP-Protocol-Version,MCP-Session-Id,Last-Event-ID");
  headers.set("access-control-expose-headers", "MCP-Session-Id,X-Request-Id");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("x-request-id", requestId);
  headers.set("x-agentropolis-version", env.SERVICE_VERSION || "1.0.0");
  headers.set("cache-control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function json(value, status = 200, extra = {}) {
  return new Response(JSON.stringify(value, null, 2), { status, headers: { "content-type": "application/json; charset=utf-8", ...extra } });
}
function errorJson(status, code, message, headers = {}) { return json({ error: { code, message } }, status, headers); }
function rpcResult(id, result) { return json({ jsonrpc: "2.0", id, result }); }
function rpcError(id, code, message) { return json({ jsonrpc: "2.0", id, error: { code, message } }, code === -32600 ? 400 : 200); }
function bearer(request) { const value = request.headers.get("authorization") || ""; return value.startsWith("Bearer ") ? value.slice(7) : null; }
function constantEqual(a, b) { const aa = new TextEncoder().encode(a); const bb = new TextEncoder().encode(b); let diff = aa.length ^ bb.length; const n = Math.max(aa.length, bb.length); for (let i = 0; i < n; i++) diff |= (aa[i % aa.length] || 0) ^ (bb[i % bb.length] || 0); return diff === 0; }
function originAllowed(origin, own, configured) { return origin === own || String(configured || "").split(",").map((item) => item.trim()).filter(Boolean).includes(origin); }
function positive(value, fallback) { const number = Number(value); return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback; }
async function sha256(value) { const bytes = new TextEncoder().encode(value); const digest = await crypto.subtle.digest("SHA-256", bytes); return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
function stable(value) { if (value === null || typeof value !== "object") return JSON.stringify(value); if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`; return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`; }
