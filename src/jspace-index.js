import observatoryWorker from "./observatory-index.js";
import {
  TOOLS,
  assembleCognitiveCouncil,
  jspaceManifest,
  mindVaultContract,
  validateArguments,
  wikivaultJspaceBridge
} from "./core.js";

const JSPACE_TOOL_NAMES = new Set([
  "get_jspace_manifest",
  "get_wikivault_jspace_bridge",
  "assemble_cognitive_council",
  "get_mind_vault_contract"
]);

const MCP_PATHS = new Set(["/mcp", "/mcp/"]);
let schemaReady;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = request.headers.get("cf-ray") || crypto.randomUUID();

    try {
      if (url.pathname === "/api/jspace" && request.method === "GET") {
        const guard = requestGuard(request, env);
        if (guard) return decorate(guard, request, env, requestId);
        const rate = await rateLimit(request, env);
        if (!rate.allowed) return decorate(errorJson(429, "RATE_LIMITED", "Request limit exceeded."), request, env, requestId);
        const view = url.searchParams.get("view") || "manifest";
        const name = view === "manifest" ? "get_jspace_manifest"
          : view === "wikivault" ? "get_wikivault_jspace_bridge"
          : view === "mind-vault" ? "get_mind_vault_contract"
          : null;
        if (!name) return decorate(errorJson(400, "INVALID_VIEW", "view must be manifest, wikivault, or mind-vault."), request, env, requestId);
        const identity = await actorIdentity(request, env);
        const result = await executeJspaceTool(name, {}, env, requestId, identity);
        return decorate(json(result.output), request, env, requestId);
      }

      if (MCP_PATHS.has(url.pathname) && request.method === "POST") {
        const message = await tryInspectJson(request.clone(), env);
        const name = message?.params?.name;
        if (message?.method === "tools/call" && JSPACE_TOOL_NAMES.has(name)) {
          const gate = await mcpGate(request, env);
          if (gate) return decorate(gate, request, env, requestId);
          if (message.jsonrpc !== "2.0" || message.id === undefined) {
            return decorate(message?.id === undefined ? new Response(null, { status: 202 }) : rpcError(message?.id ?? null, -32600, "Invalid Request"), request, env, requestId);
          }
          const tool = TOOLS.find((item) => item.name === name);
          const args = message.params?.arguments || {};
          const problem = validateArguments(tool, args);
          if (problem) return decorate(rpcError(message.id, -32602, problem), request, env, requestId);
          const identity = await actorIdentity(request, env);
          const result = await executeJspaceTool(name, args, env, requestId, identity);
          return decorate(rpcResult(message.id, {
            content: [{ type: "text", text: JSON.stringify(result.output, null, 2) }],
            structuredContent: result.output,
            isError: false,
            _meta: { receiptId: result.receipt.id, receiptPersisted: result.receipt.persisted }
          }), request, env, requestId);
        }
      }

      return observatoryWorker.fetch(request, env, ctx);
    } catch (error) {
      console.error(JSON.stringify({ event: "jspace_wrapper_error", requestId, path: url.pathname, message: error instanceof Error ? error.message : "unknown" }));
      return decorate(errorJson(error?.status || 500, error?.code || "JSPACE_ERROR", error?.status ? error.message : "The J-Space cognitive commons could not complete the request."), request, env, requestId);
    }
  }
};

async function executeJspaceTool(name, args, env, requestId, identity) {
  const started = Date.now();
  let rawOutput;
  if (name === "get_jspace_manifest") rawOutput = { jspace: jspaceManifest() };
  else if (name === "get_wikivault_jspace_bridge") rawOutput = { bridge: wikivaultJspaceBridge() };
  else if (name === "get_mind_vault_contract") rawOutput = { mindVault: mindVaultContract() };
  else if (name === "assemble_cognitive_council") rawOutput = { council: assembleCognitiveCouncil(args) };
  else throw Object.assign(new Error("Unknown J-Space tool"), { status: 400, code: "UNKNOWN_TOOL" });

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

async function mcpGate(request, env) {
  const guard = requestGuard(request, env);
  if (guard) return guard;
  const auth = authorizeMcp(request, env);
  if (auth) return auth;
  const rate = await rateLimit(request, env);
  if (!rate.allowed) return errorJson(429, "RATE_LIMITED", "Request limit exceeded.");
  return null;
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
  if (env.MCP_AUTH_MODE === "token") return authorizeOperator(request, env);
  return null;
}

function authorizeOperator(request, env) {
  if (!env.MCP_API_TOKEN) return errorJson(503, "OPERATOR_TOKEN_NOT_CONFIGURED", "Operator access is not configured.");
  const token = bearer(request);
  if (!token || !constantEqual(token, env.MCP_API_TOKEN)) return errorJson(401, "UNAUTHORIZED", "A valid bearer token is required.", { "www-authenticate": "Bearer" });
  return null;
}

async function actorIdentity(request, env) {
  const token = bearer(request);
  return token && env.MCP_API_TOKEN && constantEqual(token, env.MCP_API_TOKEN)
    ? { actorType: "operator", actorIdHash: await sha256(token) }
    : { actorType: "anonymous", actorIdHash: null };
}

async function rateLimit(request, env) {
  try {
    await ensureSchema(env.DB);
    const windowSeconds = positive(env.RATE_LIMIT_WINDOW_SECONDS, 60);
    const limit = positive(env.RATE_LIMIT_MAX_REQUESTS, 120);
    const now = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
    const key = await sha256(`${request.headers.get("cf-connecting-ip") || "unknown"}:${new URL(request.url).pathname}:jspace`);
    await env.DB.prepare("INSERT INTO rate_limits(key_hash,window_start,count,updated_at) VALUES(?,?,1,?) ON CONFLICT(key_hash,window_start) DO UPDATE SET count=count+1,updated_at=excluded.updated_at")
      .bind(key, windowStart, new Date().toISOString()).run();
    const row = await env.DB.prepare("SELECT count FROM rate_limits WHERE key_hash=? AND window_start=?").bind(key, windowStart).first();
    return { allowed: Number(row?.count || 1) <= limit };
  } catch {
    return { allowed: true, degraded: true };
  }
}

async function writeReceipt(env, data) {
  const receipt = { id: `rcpt_${crypto.randomUUID()}`, persisted: false, authorityDecision: "ALLOW_READ_ONLY" };
  try {
    await ensureSchema(env.DB);
    await env.DB.prepare("INSERT INTO execution_receipts (id,request_id,tool_name,tool_version,actor_type,actor_id_hash,authority_decision,input_hash,output_hash,status,duration_ms,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(receipt.id, data.requestId, data.toolName, "1.1.0-jspace", data.actorType, data.actorIdHash, "ALLOW_READ_ONLY", await sha256(stable(data.input)), await sha256(stable(data.output)), "success", data.durationMs, new Date().toISOString()).run();
    receipt.persisted = true;
  } catch (error) {
    console.warn(JSON.stringify({ event: "jspace_receipt_persistence_failed", receiptId: receipt.id, message: error instanceof Error ? error.message : "unknown" }));
  }
  return receipt;
}

async function ensureSchema(db) {
  if (!db) throw new Error("D1 binding unavailable");
  if (!schemaReady) schemaReady = db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS execution_receipts (id TEXT PRIMARY KEY,request_id TEXT NOT NULL,tool_name TEXT NOT NULL,tool_version TEXT NOT NULL,actor_type TEXT NOT NULL,actor_id_hash TEXT,authority_decision TEXT NOT NULL,input_hash TEXT NOT NULL,output_hash TEXT,status TEXT NOT NULL CHECK(status IN ('success','error')),duration_ms INTEGER NOT NULL CHECK(duration_ms>=0),created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_receipts_created ON execution_receipts(created_at DESC)"),
    db.prepare("CREATE TABLE IF NOT EXISTS rate_limits (key_hash TEXT NOT NULL,window_start INTEGER NOT NULL,count INTEGER NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(key_hash,window_start))")
  ]).catch((error) => { schemaReady = undefined; throw error; });
  return schemaReady;
}

async function tryInspectJson(request, env) {
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > positive(env.MAX_REQUEST_BYTES, 131072)) return null;
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
}

function bearer(request) {
  const value = request.headers.get("authorization") || "";
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

function constantEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function originAllowed(origin, selfOrigin, configured) {
  if (origin === selfOrigin) return true;
  return String(configured || "").split(",").map((v) => v.trim()).filter(Boolean).includes(origin);
}

function positive(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value)));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(",")}}`;
  return JSON.stringify(value);
}

function rpcResult(id, result) { return json({ jsonrpc: "2.0", id, result }); }
function rpcError(id, code, message, data) { return json({ jsonrpc: "2.0", id, error: { code, message, ...(data ? { data } : {}) } }, 200); }
function json(body, status = 200, extraHeaders = {}) { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", ...extraHeaders } }); }
function errorJson(status, code, message, headers = {}) { return json({ error: { code, message } }, status, headers); }

function decorate(response, request, env, requestId) {
  const headers = new Headers(response.headers);
  const origin = request.headers.get("origin");
  const selfOrigin = new URL(request.url).origin;
  if (origin && originAllowed(origin, selfOrigin, env.ALLOWED_ORIGINS)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "Origin");
    headers.set("access-control-allow-headers", "authorization,content-type,mcp-protocol-version");
    headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
  }
  headers.set("x-request-id", requestId);
  headers.set("x-agentropolis-authority", "READ_ONLY");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
