const int = (name, fallback, min, max) => {
  const raw = process.env[name];
  const value = raw === undefined ? fallback : Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
};

export const config = Object.freeze({
  host: process.env.HOST || "127.0.0.1",
  port: int("PORT", 8787, 1, 65535),
  upstream: process.env.WASTE_UPSTREAM || "http://127.0.0.1:8000",
  apiKey: process.env.AGENTROPOLIS_API_KEY || "",
  upstreamApiKey: process.env.WASTE_API_KEY || "",
  maxBodyBytes: int("MAX_BODY_BYTES", 2_000_000, 1024, 64_000_000),
  maxTokens: int("MAX_COMPLETION_TOKENS", 1024, 1, 32768),
  requestTimeoutMs: int("REQUEST_TIMEOUT_MS", 3_600_000, 1000, 86_400_000),
  receiptPath: process.env.RECEIPT_PATH || "./data/receipts.jsonl",
  modelId: process.env.MODEL_ID || "k3-vault",
  allowThinking: process.env.ALLOW_THINKING === "true"
});
