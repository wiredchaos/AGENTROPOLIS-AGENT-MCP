import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateRequest, authorize } from "../src/policy.js";
import { SerialQueue } from "../src/queue.js";
import { writeReceipt } from "../src/receipts.js";

const cfg = { maxTokens: 1024, allowThinking: false, modelId: "k3-vault" };

test("forces governed model and thinking off", () => {
  const out = validateRequest("/v1/chat/completions", { messages: [], max_tokens: 10 }, cfg);
  assert.equal(out.model, "k3-vault");
  assert.equal(out.reasoning_effort, "none");
  assert.equal(out.max_completion_tokens, 10);
});

test("rejects excess tokens", () => {
  assert.throws(() => validateRequest("/v1/chat/completions", { messages: [], max_tokens: 2048 }, cfg));
});

test("rejects reasoning escalation", () => {
  assert.throws(() => validateRequest("/v1/chat/completions", { messages: [], reasoning_effort: "high" }, cfg));
});

test("rejects unsupported endpoint", () => {
  assert.throws(() => validateRequest("/v1/embeddings", {}, cfg));
});

test("authorizes exact bearer token", () => {
  assert.equal(authorize({ headers: { authorization: "Bearer x" } }, "x"), true);
  assert.equal(authorize({ headers: {} }, "x"), false);
});

test("serializes work", async () => {
  const queue = new SerialQueue();
  const seen = [];
  await Promise.all([
    queue.run(async () => {
      seen.push(1);
      await new Promise((resolve) => setTimeout(resolve, 20));
      seen.push(2);
    }),
    queue.run(async () => seen.push(3))
  ]);
  assert.deepEqual(seen, [1, 2, 3]);
});

test("continues after failure", async () => {
  const queue = new SerialQueue();
  await assert.rejects(queue.run(async () => { throw new Error("x"); }));
  assert.equal(await queue.run(async () => 42), 42);
});

test("writes hashed JSONL receipt", async () => {
  const dir = await mkdtemp(join(tmpdir(), "waste-"));
  const path = join(dir, "receipts.jsonl");
  const receipt = await writeReceipt(path, { status: "ok" });
  assert.match(receipt.sha256, /^[a-f0-9]{64}$/);
  const lines = (await readFile(path, "utf8")).trim().split("\n");
  assert.equal(lines.length, 1);
  assert.equal(JSON.parse(lines[0]).status, "ok");
});
