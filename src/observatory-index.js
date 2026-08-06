import baseWorker from "./index.js";
import {
  DISTRICTS,
  TOOLS as BASE_TOOLS,
  deploymentManifest,
  validateArguments
} from "./core.js";
import {
  OBSERVATORY_TOOLS,
  OBSERVATORY_VIEWS,
  buildObservatorySnapshot,
  observatoryViewForTool,
  validateObservatoryArguments
} from "./observatory.js";
import {
  DISCIPLINE_TOOLS,
  buildDisciplineSnapshot,
  isDisciplineTool,
  validateDisciplineArguments
} from "./discipline-observatory.js";

const ALL_TOOLS = [...BASE_TOOLS, ...OBSERVATORY_TOOLS, ...DISCIPLINE_TOOLS];
const MCP_PATHS = new Set(["/mcp", "/mcp/"]);
const MANIFEST_TOOL = "get_cloudflare_deployment_manifest";
const DEFAULT_OBSERVATION_WINDOW_HOURS = 24;
const DEFAULT_OBSERVATION_MAX_RECEIPTS = 1000;
const MAX_OBSERVATION_WINDOW_HOURS = 168;
const MAX_OBSERVATION_RECEIPTS = 5000;
let schemaReady;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = request.headers.get("cf-ray") || crypto.randomUUID();

    try {
      if (request.method === "OPTIONS") {
        return decorate(new Response(null, { status: 204 }), request, env, requestId);
      }

      if ((url.pathname === "/.well-known/mcp.json" || url.pathname === "/api/manifest") && request.method === "GET") {
        return decorate(json(buildExtendedManifest(env)), request, env, requestId);
      }

      if (url.pathname === "/api/tools" && request.method === "GET") {
        return decorate(json({ tools: ALL_TOOLS }), request, env, requestId);
      }

      if (url.pathname === "/api/observatory" && request.method === "GET") {
        const guard = requestGuard(request, env);
        if (guard) return decorate(guard, request, env, requestId);

        const rate = await rateLimit(request, env);
        if (!rate.allowed) {
          return decorate(errorJson(429, "RATE_LIMITED", "Request limit exceeded."), request, env, requestId);
        }

        const view = url.searchParams.get("view") || "all";
        if (!["all", ...OBSERVATORY_VIEWS].includes(view)) {
          return decorate(errorJson(400, "INVALID_VIEW", "Unknown observatory view."), request, env, requestId);
        }

        const identity = await actorIdentity(request, env);
        const toolName = toolForView(view);
        const result = await executeExtendedTool(toolName, view === "all" ? { view } : {}, env, requestId, identity);
        return decorate(json(result.output), request, env, requestId);
      }

      if (MCP_PATHS.has(url.pathname) && request.method === "POST") {
        const message = await tryInspectJson(request.clone(), env);
        const classification = classifyMcpIntercept(message);

        if (classification.kind !== "delegate") {
          const gate = await mcpGate(request, env);
          if (gate) return decorate(gate, request, env, requestId);

          if (classification.kind === "invalid") {
            return decorate(rpcError(message?.id ?? null, -32600, "Invalid Request"), request, env, requestId);
          }

          if (classification.kind === "notification") {
            return decorate(new Response(null, { status: 202 }), request, env, requestId);
          }

          if (classification.kind === "tools-list") {
            return decorate(rpcResult(message.id, { tools: ALL_TOOLS }), request, env, requestId);
          }

          const name = message.params?.name;
          const args = message.params?.arguments || {};
          const tool = ALL_TOOLS.find((item) => item.name === name);
          const problem = isObservatoryTool(name)
            ? validateObservatoryArguments(tool, args)
            : isDisciplineTool(name)
              ? validateDisciplineArguments(tool, args)
              : validateArguments(tool, args);

          if (problem) {
            return decorate(rpcError(message.id, -32602, problem), request, env, requestId);
          }

          const identity = await actorIdentity(request, env);
          const result = await executeExtendedTool(name, args, env, requestId, identity);
          return decorate(rpcResult(message.id, {
            content: [{ type: "text", text: JSON.stringify(result.output, null, 2) }],
            structuredContent: result.output,
            isError: false,
            _meta: {
              receiptId: result.receipt.id,
              receiptPersisted: result.receipt.persisted
            }
          }), request, env, requestId);
        }
      }

      return baseWorker.fetch(request, env, ctx);
    } catch (error) {
      console.error(JSON.stringify({
        event: "observatory_wrapper_error",
        requestId,
        path: url.pathname,
        message: error instanceof Error ? error.message : "unknown"
      }));
      return decorate(
        errorJson(
          error?.status || 500,
          error?.code || "OBSERVATORY_ERROR",
          error?.status ? error.message : "The Intelligence Observatory could not complete the request."
        ),
        request,
        env,
        requestId
      );
    }
  }
};

export function buildExtendedManifest(env = {}) {
  const manifest = deploymentManifest(env);
  return {
    ...manifest,
    tools: ALL_TOOLS.map(({ name, title, description, annotations }) => ({
      name,
      title,
      description,
      annotations
    })),
    endpoints: {
      ...(manifest.endpoints || {}),
      observatory: "/api/observatory"
    },
    observatory: {
      name: "AGENTROPOLIS Intelligence Observatory",
      views: OBSERVATORY_VIEWS,
      telemetry: "canonical baseline with bounded D1 receipt aggregates",
      authority: "READ_ONLY"
    },
    executionDiscipline: {
      name: "HERMES Execution Discipline Observatory",
      tools: DISCIPLINE_TOOLS.length,
      telemetry: "canonical baseline until execution receipts and the thermodynamic measurement pipeline provide live data",
      authority: "READ_ONLY"
    }
  };
}

export function classifyMcpIntercept(message) {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return { kind: "delegate" };
  }

  const method = message.method;
  const name = message.params?.name;
  const candidate = method === "tools/list"
    || (method === "tools/call" && (isObservatoryTool(name) || isDisciplineTool(name) || name === MANIFEST_TOOL));

  if (!candidate) return { kind: "delegate" };
  if (message.jsonrpc !== "2.0" || typeof method !== "string") return { kind: "invalid" };
  if (message.id === undefined) return { kind: "notification" };
  if (method === "tools/list") return { kind: "tools-list" };
  return { kind: "tools-call" };
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

async function executeExtendedTool(name, args, env, requestId, identity) {
  const started = Date.now();
  let rawOutput;

  if (name === MANIFEST_TOOL) {
    rawOutput = { deployment: buildExtendedManifest(env) };
  } else if (isDisciplineTool(name)) {
    const runtime = await observatoryRuntime(env);
    rawOutput = { discipline: buildDisciplineSnapshot(name, args, runtime) };
  } else {
    const view = observatoryViewForTool(name, args);
    if (!view) {
      throw Object.assign(new Error("Unknown observatory tool"), {
        status: 400,
        code: "UNKNOWN_TOOL"
      });
    }
    const runtime = await observatoryRuntime(env);
    rawOutput = { observatory: buildObservatorySnapshot(view, DISTRICTS, runtime) };
  }

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
    const windowHours = boundedPositive(
      env.OBSERVATORY_WINDOW_HOURS,
      DEFAULT_OBSERVATION_WINDOW_HOURS,
      1,
      MAX_OBSERVATION_WINDOW_HOURS
    );
    const maxReceipts = boundedPositive(
      env.OBSERVATORY_MAX_RECEIPTS,
      DEFAULT_OBSERVATION_MAX_RECEIPTS,
      1,
      MAX_OBSERVATION_RECEIPTS
    );
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
    const result = await env.DB.prepare(
      "SELECT tool_name, duration_ms, created_at FROM execution_receipts WHERE created_at >= ? ORDER BY created_at DESC LIMIT ?"
    ).bind(since, maxReceipts + 1).all();

    return summarizeReceiptRows(result.results || [], {
      since,
      windowHours,
      maxReceipts
    });
  } catch {
    return emptyRuntime();
  }
}

export function summarizeReceiptRows(rows, options = {}) {
  const maxReceipts = boundedPositive(
    options.maxReceipts,
    DEFAULT_OBSERVATION_MAX_RECEIPTS,
    1,
    MAX_OBSERVATION_RECEIPTS
  );
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const truncated = normalizedRows.length > maxReceipts;
  const sampled = normalizedRows.slice(0, maxReceipts);
  const byTool = new Map();
  let durationTotal = 0;
  let lastReceiptAt = null;

  for (const row of sampled) {
    const duration = Number(row?.duration_ms || 0);
    const toolName = String(row?.tool_name || "unknown");
    const createdAt = row?.created_at || null;
    durationTotal += duration;
    if (createdAt && (!lastReceiptAt || createdAt > lastReceiptAt)) lastReceiptAt = createdAt;

    const current = byTool.get(toolName) || {
      tool: toolName,
      count: 0,
      durationTotal: 0,
      lastCalledAt: null
    };
    current.count += 1;
    current.durationTotal += duration;
    if (createdAt && (!current.lastCalledAt || createdAt > current.lastCalledAt)) {
      current.lastCalledAt = createdAt;
    }
    byTool.set(toolName, current);
  }

  const toolCalls = [...byTool.values()]
    .sort((a, b) => b.count - a.count || a.tool.localeCompare(b.tool))
    .slice(0, 20)
    .map((item) => ({
      tool: item.tool,
      count: item.count,
      avgDurationMs: Number((item.durationTotal / item.count).toFixed(2)),
      lastCalledAt: item.lastCalledAt
    }));

  return {
    receiptCount: sampled.length,
    receiptCountIsLowerBound: truncated,
    avgDurationMs: sampled.length ? Number((durationTotal / sampled.length).toFixed(2)) : 0,
    lastReceiptAt,
    toolCalls,
    observationWindow: {
      since: options.since || null,
      hours: boundedPositive(
        options.windowHours,
        DEFAULT_OBSERVATION_WINDOW_HOURS,
        1,
        MAX_OBSERVATION_WINDOW_HOURS
      ),
      maxReceipts,
      sampledReceipts: sampled.length,
      truncated
    }
  };
}

function emptyRuntime() {
  return {
    receiptCount: 0,
    receiptCountIsLowerBound: false,
    avgDurationMs: 0,
    lastReceiptAt: null,
    toolCalls: [],
    observationWindow: {
      since: null,
      hours: DEFAULT_OBSERVATION_WINDOW_HOURS,
      maxReceipts: DEFAULT_OBSERVATION_MAX_RECEIPTS,
      sampledReceipts: 0,
      truncated: false
    }
  };
}

async function writeReceipt(env, data) {
  const receipt = {
    id: `rcpt_${crypto.randomUUID()}`,
    persisted: false,
    authorityDecision: "ALLOW_READ_ONLY"
  };

  try {
    await ensureSchema(env.DB);
    await env.DB.prepare(
      "INSERT INTO execution_receipts (id,request_id,tool_name,tool_version,actor_type,actor_id_hash,authority_decision,input_hash,output_hash,status,duration_ms,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(
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
    console.warn(JSON.stringify({
      event: "observatory_receipt_persistence_failed",
      receiptId: receipt.id,
      message: error instanceof Error ? error.message : "unknown"
    }));
  }

  return receipt;
}

async function ensureSchema(db) {
  if (!db) throw new Error("D1 binding unavailable");
  if (!schemaReady) {
    schemaReady = db.batch([
      db.prepare("CREATE TABLE IF NOT EXISTS execution_receipts (id TEXT PRIMARY KEY,request_id TEXT NOT NULL,tool_name TEXT NOT NULL,tool_version TEXT NOT NULL,actor_type TEXT NOT NULL,actor_id_hash TEXT,authority_decision TEXT NOT NULL,input_hash TEXT NOT NULL,output_hash TEXT,status TEXT NOT NULL CHECK(status IN ('success','error')),duration_ms INTEGER NOT NULL CHECK(duration_ms>=0),created_at TEXT NOT NULL)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_receipts_created ON execution_receipts(created_at DESC)"),
      db.prepare("CREATE TABLE IF NOT EXISTS rate_limits (key_hash TEXT NOT NULL,window_start INTEGER NOT NULL,count INTEGER NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(key_hash,window_start))")
    ]).catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  return schemaReady;
}

async function rateLimit(request, env) {
  try {
    await ensureSchema(env.DB);
    const windowSeconds = positive(env.RATE_LIMIT_WINDOW_SECONDS, 60);
    const limit = positive(env.RATE_LIMIT_MAX_REQUESTS, 120);
    const now = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
    const key = await sha256(
      `${request.headers.get("cf-connecting-ip") || "unknown"}:${new URL(request.url).pathname}:observatory`
    );

    await env.DB.prepare(
      "INSERT INTO rate_limits(key_hash,window_start,count,updated_at) VALUES(?,?,1,?) ON CONFLICT(key_hash,window_start) DO UPDATE SET count=count+1,updated_at=excluded.updated_at"
    ).bind(key, windowStart, new Date().toISOString()).run();

    const row = await env.DB.prepare(
      "SELECT count FROM rate_limits WHERE key_hash=? AND window_start=?"
    ).bind(key, windowStart).first();

    return { allowed: Number(row?.count || 1) <= limit };
  } catch {
    return { allowed: true, degraded: true };
  }
}

function requestGuard(request, env) {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  if (host && host !== url.host) {
    return errorJson(400, "HOST_MISMATCH", "Host header does not match the request URL.");
  }

  const origin = request.headers.get("origin");
  if (origin && !originAllowed(origin, url.origin, env.ALLOWED_ORIGINS)) {
    return errorJson(403, "ORIGIN_DENIED", "Origin is not allowed.");
  }

  const length = Number(request.headers.get("content-length") || 0);
  if (length > positive(env.MAX_REQUEST_BYTES, 131072)) {
    return errorJson(413, "REQUEST_TOO_LARGE", "Request body exceeds the configured limit.");
  }

  return null;
}

function authorizeMcp(request, env) {
  if (env.PUBLIC_MCP_ENABLED === "false" || env.MCP_AUTH_MODE === "disabled") {
    return errorJson(503, "MCP_DISABLED", "The MCP endpoint is disabled.");
  }

  if (env.MCP_AUTH_MODE === "token") {
    if (!env.MCP_API_TOKEN) {
      return errorJson(503, "OPERATOR_TOKEN_NOT_CONFIGURED", "Operator access is not configured.");
    }
    const token = bearer(request);
    if (!token || !constantEqual(token, env.MCP_API_TOKEN)) {
      return errorJson(401, "UNAUTHORIZED", "A valid bearer token is required.", {
        "www-authenticate": "Bearer"
      });
    }
  }

  return null;
}

async function actorIdentity(request, env) {
  const token = bearer(request);
  return token && env.MCP_API_TOKEN && constantEqual(token, env.MCP_API_TOKEN)
    ? { actorType: "operator", actorIdHash: await sha256(token) }
    : { actorType: "anonymous", actorIdHash: null };
}

async function tryInspectJson(request, env) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/json")) return null;

  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > positive(env.MAX_REQUEST_BYTES, 131072)) {
      return null;
    }
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

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function json(value, status = 200, extra = {}) {
  return new Response(JSON.stringify(value, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra }
  });
}

function errorJson(status, code, message, headers = {}) {
  return json({ error: { code, message } }, status, headers);
}

function rpcResult(id, result) {
  return json({ jsonrpc: "2.0", id, result });
}

function rpcError(id, code, message) {
  return json(
    { jsonrpc: "2.0", id, error: { code, message } },
    code === -32600 ? 400 : 200
  );
}

function bearer(request) {
  const value = request.headers.get("authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7) : null;
}

function constantEqual(a, b) {
  const aa = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  let diff = aa.length ^ bb.length;
  const n = Math.max(aa.length, bb.length);
  for (let i = 0; i < n; i++) {
    diff |= (aa[i % aa.length] || 0) ^ (bb[i % bb.length] || 0);
  }
  return diff === 0;
}

function originAllowed(origin, own, configured) {
  return origin === own || String(configured || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(origin);
}

function positive(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function boundedPositive(value, fallback, minimum, maximum) {
  const number = Number(value);
  const normalized = Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
  return Math.min(maximum, Math.max(minimum, normalized));
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function stable(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
    .join(",")}}`;
}
