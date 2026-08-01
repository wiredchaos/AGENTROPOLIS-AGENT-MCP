import http from "node:http";
import { randomUUID } from "node:crypto";
import { config } from "./config.js";
import { authorize, validateRequest } from "./policy.js";
import { SerialQueue } from "./queue.js";
import { writeReceipt } from "./receipts.js";

const queue = new SerialQueue();

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(body);
}

async function readJson(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("request body too large"), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("invalid JSON"), { status: 400 });
  }
}

async function proxy(req, res) {
  const started = Date.now();
  const requestId = req.headers["x-request-id"] || randomUUID();
  const body = validateRequest(req.url, await readJson(req, config.maxBodyBytes), config);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("timeout")), config.requestTimeoutMs);
  res.on("close", () => {
    if (!res.writableEnded) controller.abort(new Error("client disconnected"));
  });

  let status = 502;
  let waste = null;
  let outcome = "failed";

  try {
    await queue.run(async () => {
      const headers = { "content-type": "application/json", "x-request-id": requestId };
      if (config.upstreamApiKey) headers.authorization = `Bearer ${config.upstreamApiKey}`;
      const upstream = await fetch(new URL(req.url, config.upstream), {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
      status = upstream.status;
      const responseBody = Buffer.from(await upstream.arrayBuffer());
      try {
        waste = JSON.parse(responseBody.toString("utf8")).waste ?? null;
      } catch {}
      outcome = upstream.ok ? "completed" : "upstream_rejected";
      res.writeHead(status, {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "content-length": responseBody.length,
        "cache-control": "no-store",
        "x-request-id": requestId
      });
      res.end(responseBody);
    });
  } catch (error) {
    outcome = controller.signal.aborted ? "cancelled" : "failed";
    throw error;
  } finally {
    clearTimeout(timer);
    await writeReceipt(config.receiptPath, {
      adapter: "waste-byoh",
      adapter_version: "0.1.0",
      request_id: requestId,
      outcome,
      http_status: status,
      duration_ms: Date.now() - started,
      queue_depth: queue.depth,
      model: config.modelId,
      waste
    });
  }
}

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/health") return json(res, 200, { status: "ok" });
      if (req.method === "GET" && req.url === "/ready") {
        try {
          const upstream = await fetch(new URL("/health", config.upstream), { signal: AbortSignal.timeout(3000) });
          return json(res, upstream.ok ? 200 : 503, {
            status: upstream.ok ? "ready" : "degraded",
            queue_depth: queue.depth
          });
        } catch {
          return json(res, 503, { status: "unavailable", queue_depth: queue.depth });
        }
      }
      if (req.method !== "POST") return json(res, 405, { error: "method not allowed" });
      if (!authorize(req, config.apiKey)) return json(res, 401, { error: "unauthorized" });
      await proxy(req, res);
    } catch (error) {
      if (!res.headersSent) json(res, error.status || 502, { error: error.message || "upstream error" });
      else res.destroy(error);
    }
  });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const server = createServer();
  server.listen(config.port, config.host, () => {
    console.log(`waste-provider listening on http://${config.host}:${config.port}`);
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
