import baseWorker from "./jspace-index.js";
import {
  cloudflareComputerManifest,
  selectCloudflareComputerBackend
} from "./cloudflare-computer.js";

const MCP_PATHS = new Set(["/mcp", "/mcp/"]);

export const CLOUDFLARE_COMPUTER_TOOLS = [
  {
    name: "get_cloudflare_computer_runtime_manifest",
    title: "Get Cloudflare Computer Runtime Manifest",
    description: "Return the quarantined Cloudflare Computer adapter status, backend profiles, and 54-T controls. This tool does not execute code.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: {} }
  },
  {
    name: "recommend_cloudflare_computer_backend",
    title: "Recommend Cloudflare Computer Backend",
    description: "Recommend the least-powerful Cloudflare Computer backend for a task and identify when 54-T escalation is required. This tool does not execute code.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        task: { type: "string", minLength: 1, maxLength: 4000 },
        needsNativeBinaries: { type: "boolean", default: false },
        needsStructuredJavaScript: { type: "boolean", default: false },
        needsBrowser: { type: "boolean", default: false },
        network: { type: "string", enum: ["deny", "allow"] }
      },
      required: ["task"]
    }
  }
];

const TOOL_NAMES = new Set(CLOUDFLARE_COMPUTER_TOOLS.map((tool) => tool.name));

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestId = request.headers.get("cf-ray") || crypto.randomUUID();

    if (request.method === "OPTIONS") return baseWorker.fetch(request, env, ctx);

    if (url.pathname === "/api/runtime/cloudflare-computer" && request.method === "GET") {
      return decorate(json({ runtime: cloudflareComputerManifest() }), requestId);
    }

    if (MCP_PATHS.has(url.pathname) && request.method === "POST") {
      const message = await inspectJson(request.clone(), env);
      if (message?.method === "tools/list" && message?.id !== undefined) {
        const delegated = await baseWorker.fetch(request, env, ctx);
        const payload = await delegated.clone().json().catch(() => null);
        if (payload?.result?.tools && Array.isArray(payload.result.tools)) {
          payload.result.tools = [...payload.result.tools, ...CLOUDFLARE_COMPUTER_TOOLS];
          return decorate(json(payload, delegated.status), requestId, delegated.headers);
        }
        return delegated;
      }

      const name = message?.params?.name;
      if (message?.method === "tools/call" && TOOL_NAMES.has(name)) {
        if (message.jsonrpc !== "2.0" || message.id === undefined) {
          return message?.id === undefined
            ? new Response(null, { status: 202 })
            : decorate(rpcError(message?.id ?? null, -32600, "Invalid Request"), requestId);
        }
        const args = message.params?.arguments || {};
        const problem = validateComputerArguments(name, args);
        if (problem) return decorate(rpcError(message.id, -32602, problem), requestId);

        const output = name === "get_cloudflare_computer_runtime_manifest"
          ? { runtime: cloudflareComputerManifest() }
          : { recommendation: selectCloudflareComputerBackend(args) };

        return decorate(rpcResult(message.id, {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
          isError: false,
          _meta: {
            authority: "READ_ONLY",
            executionRegistered: false,
            certificationRequired: true
          }
        }), requestId);
      }
    }

    return baseWorker.fetch(request, env, ctx);
  }
};

export function validateComputerArguments(name, args) {
  if (!args || typeof args !== "object" || Array.isArray(args)) return "arguments must be an object";
  if (name === "get_cloudflare_computer_runtime_manifest") {
    return Object.keys(args).length ? "manifest tool accepts no arguments" : null;
  }
  const allowed = new Set(["task", "needsNativeBinaries", "needsStructuredJavaScript", "needsBrowser", "network"]);
  for (const key of Object.keys(args)) if (!allowed.has(key)) return `unexpected argument: ${key}`;
  if (typeof args.task !== "string" || !args.task.trim() || args.task.length > 4000) return "task must be a non-empty string up to 4,000 characters";
  for (const key of ["needsNativeBinaries", "needsStructuredJavaScript", "needsBrowser"]) {
    if (args[key] !== undefined && typeof args[key] !== "boolean") return `${key} must be boolean`;
  }
  if (args.network !== undefined && !["deny", "allow"].includes(args.network)) return "network must be deny or allow";
  return null;
}

async function inspectJson(request, env) {
  try {
    const text = await request.text();
    const max = Number(env.MAX_REQUEST_BYTES || 131072);
    if (new TextEncoder().encode(text).byteLength > max) return null;
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
}

function rpcResult(id, result) { return json({ jsonrpc: "2.0", id, result }); }
function rpcError(id, code, message) { return json({ jsonrpc: "2.0", id, error: { code, message } }); }
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } }); }

function decorate(response, requestId, inheritedHeaders) {
  const headers = new Headers(inheritedHeaders || response.headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-request-id", requestId);
  headers.set("x-agentropolis-authority", "READ_ONLY");
  headers.set("x-agentropolis-execution", "DISABLED");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
