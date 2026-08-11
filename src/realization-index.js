import jspaceWorker from "./jspace-index.js";
import { REALIZATION_TOOLS, buildFuturecastPlan, buildMakeRealPlan, buildMindMeldPlan, validateRealizationArguments } from "./realization.js";

const TOOL_NAMES = new Set(REALIZATION_TOOLS.map((tool) => tool.name));
const MCP_PATHS = new Set(["/mcp", "/mcp/"]);
let schemaReady;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = request.headers.get("cf-ray") || crypto.randomUUID();

    if (url.pathname === "/api/realization" && request.method === "GET") {
      return decorate(json({
        name: "HERMES Realization Layer",
        authority: "READ_ONLY_PLAN",
        tools: REALIZATION_TOOLS.map(({ name, title, description, annotations }) => ({ name, title, description, annotations })),
        doctrine: ["futurecast_not_time_travel", "provenance_preserving_memory_merge", "inspect_simulate_preview_approve_execute", "separate_execution_corridor"]
      }), request, env, requestId);
    }

    if (MCP_PATHS.has(url.pathname) && request.method === "POST") {
      const message = await tryInspectJson(request.clone(), env);
      if (message?.method === "tools/list" && message.id !== undefined) {
        const delegated = await jspaceWorker.fetch(request, env, ctx);
        try {
          const payload = await delegated.clone().json();
          if (payload?.result?.tools && Array.isArray(payload.result.tools)) {
            const names = new Set(payload.result.tools.map((tool) => tool.name));
            payload.result.tools.push(...REALIZATION_TOOLS.filter((tool) => !names.has(tool.name)));
            return decorate(json(payload, delegated.status, Object.fromEntries(delegated.headers.entries())), request, env, requestId);
          }
        } catch {}
        return delegated;
      }

      const name = message?.params?.name;
      if (message?.method === "tools/call" && TOOL_NAMES.has(name)) {
        const gate = await mcpGate(request, env);
        if (gate) return decorate(gate, request, env, requestId);
        if (message.jsonrpc !== "2.0" || message.id === undefined) {
          return decorate(message?.id === undefined ? new Response(null, { status: 202 }) : rpcError(message?.id ?? null, -32600, "Invalid Request"), request, env, requestId);
        }
        const tool = REALIZATION_TOOLS.find((item) => item.name === name);
        const args = message.params?.arguments || {};
        const problem = validateRealizationArguments(tool, args);
        if (problem) return decorate(rpcError(message.id, -32602, problem), request, env, requestId);
        const identity = await actorIdentity(request, env);
        const result = await executeRealizationTool(name, args, env, requestId, identity);
        return decorate(rpcResult(message.id, {
          content: [{ type: "text", text: JSON.stringify(result.output, null, 2) }],
          structuredContent: result.output,
          isError: false,
          _meta: { receiptId: result.receipt.id, receiptPersisted: result.receipt.persisted }
        }), request, env, requestId);
      }
    }

    return jspaceWorker.fetch(request, env, ctx);
  }
};

async function executeRealizationTool(name, args, env, requestId, identity) {
  const started = Date.now();
  let rawOutput;
  if (name === "futurecast_plan") rawOutput = { futurecast: buildFuturecastPlan(args) };
  else if (name === "mind_meld_plan") rawOutput = { mindMeld: buildMindMeldPlan(args) };
  else if (name === "make_real_plan") rawOutput = { makeReal: buildMakeRealPlan(args) };
  else throw Object.assign(new Error("Unknown realization tool"), { status: 400, code: "UNKNOWN_TOOL" });

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
  if (env.PUBLIC_MCP_ENABLED === "false" || env.MCP_AUTH_MODE === "disabled") return errorJson(503, "MCP_DISABLED", "The MCP endpoint is disabled.");
  if (env.MCP_AUTH_MODE === "token") {
    if (!env.MCP_API_TOKEN) return errorJson(503, "OPERATOR_TOKEN_NOT_CONFIGURED", "Operator access is not configured.");
    const token = bearer(request);
    if (!token || !constantEqual(token, env.MCP_API_TOKEN)) return errorJson(401, "UNAUTHORIZED", "A valid bearer token is required.", { "www-authenticate": "Bearer" });
  }
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

async function actorIdentity(request, env) {
  const token = bearer(request);
  return token && env.MCP_API_TOKEN && constantEqual(token, env.MCP_API_TOKEN)
    ? { actorType: "operator", actorIdHash: await sha256(token) }
    : { actorType: "anonymous", actorIdHash: null };
}

async function writeReceipt(env, data) {
  const receipt = { id: `rcpt_${crypto.randomUUID()}`, persisted: false, authorityDecision: "ALLOW_READ_ONLY_PLAN" };
  try {
    await ensureSchema(env.DB);
    await env.DB.prepare("INSERT INTO execution_receipts (id,request_id,tool_name,tool_version,actor_type,actor_id_hash,authority_decision,input_hash,output_hash,status,duration_ms,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(receipt.id, data.requestId, data.toolName, "1.2.0-realization", data.actorType, data.actorIdHash, "ALLOW_READ_ONLY_PLAN", await sha256(stable(data.input)), await sha256(stable(data.output)), "success", data.durationMs, new Date().toISOString()).run();
    receipt.persisted = true;
  } catch (error) {
    console.warn(JSON.stringify({ event: "realization_receipt_persistence_failed", receiptId: receipt.id, message: error instanceof Error ? error.message : "unknown" }));
  }
  return receipt;
}

async function ensureSchema(db) {
  if (!db) throw new Error("D1 binding unavailable");
  if (!schemaReady) schemaReady = db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS execution_receipts (id TEXT PRIMARY KEY,request_id TEXT NOT NULL,tool_name TEXT NOT NULL,tool_version TEXT NOT NULL,actor_type TEXT NOT NULL,actor_id_hash TEXT,authority_decision TEXT NOT NULL,input_hash TEXT NOT NULL,output_hash TEXT,status TEXT NOT NULL CHECK(status IN ('success','error')),duration_ms INTEGER NOT NULL CHECK(duration_ms>=0),created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_receipts_created ON execution_receipts(created_at DESC)")
  ]).catch((error) => { schemaReady = undefined; throw error; });
  return schemaReady;
}

async function tryInspectJson(request, env) {
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > positive(env.MAX_REQUEST_BYTES, 131072)) return null;
    return text ? JSON.parse(text) : {};
  } catch { return null; }
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
function positive(value, fallback) { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : fallback; }
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
  headers.set("x-agentropolis-authority", "READ_ONLY_PLAN");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
