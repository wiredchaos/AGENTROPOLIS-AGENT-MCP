const ALLOWED_PATHS = new Set(["/v1/chat/completions", "/v1/completions"]);

export function authorize(req, apiKey) {
  if (!apiKey) return true;
  const auth = req.headers.authorization || "";
  return auth === `Bearer ${apiKey}`;
}

export function validateRequest(path, body, cfg) {
  if (!ALLOWED_PATHS.has(path)) throw Object.assign(new Error("unsupported endpoint"), { status: 404 });
  if (!body || typeof body !== "object" || Array.isArray(body)) throw Object.assign(new Error("JSON object required"), { status: 400 });
  const requested = body.max_completion_tokens ?? body.max_tokens ?? cfg.maxTokens;
  if (!Number.isInteger(requested) || requested < 1 || requested > cfg.maxTokens) {
    throw Object.assign(new Error(`max tokens must be between 1 and ${cfg.maxTokens}`), { status: 400 });
  }
  if (!cfg.allowThinking && ![undefined, "none", "minimal", "off"].includes(body.reasoning_effort)) {
    throw Object.assign(new Error("reasoning is disabled by BYOH policy"), { status: 403 });
  }
  return {
    ...body,
    model: cfg.modelId,
    max_completion_tokens: requested,
    reasoning_effort: cfg.allowThinking ? body.reasoning_effort : "none"
  };
}
