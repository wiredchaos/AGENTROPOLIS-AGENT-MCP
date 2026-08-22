const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

/**
 * OpenArt MCP verification evidence — recorded from sanctioned discovery/
 * introspection (2026-08-20, neuro-hermes-strategist). This is metadata for
 * governance, NOT an eligibility grant: write/generative readiness remains
 * CONDITIONAL and provider invocation stays gated until a separate human
 * authorization + budget envelope is approved.
 *
 * - authentication = VERIFIED (OAuth 2.1 PKCE completed)
 * - discovery/tool manifest = VERIFIED (16 tools, see sha256)
 * - read capability = VERIFIED (11 read-only tools)
 * - machine-readable schema evidence = VERIFIED
 * - manifest hash = recorded (sorted 16-tool names)
 * - runtime/server ID = UNKNOWN (server does not expose one; not fabricated)
 * - write/generative readiness = CONDITIONAL
 * - provider invocation remains gated
 */
export const OPENART_MCP_VERIFICATION_EVIDENCE = Object.freeze({
  provider_id: 'openart-mcp',
  endpoint: 'https://mcp.openart.ai/mcp',
  transport: 'MCP',
  authentication: 'VERIFIED',
  oauth: {
    mechanism: 'OAuth 2.1 PKCE',
    code_challenge_method: 'S256',
    scope: 'full_access',
  },
  discovery: {
    tool_manifest: 'VERIFIED',
    tool_count: 16,
    manifest_sha256: 'dc2a73275cd0c59acf477eb5228ec34a2178580cce8b98cb8ca369239e3d44e5',
    read_capability: 'VERIFIED',
    machine_readable_schema: 'VERIFIED',
    runtime_id: null,
  },
  capability: {
    read_only_tools: 11,
    generative_write_tools: 2,
    workspace_write_tools: 1,
    upload_write_tools: 2,
    destructive_tools: 0,
    write_generative_readiness: 'CONDITIONAL',
    invocation: 'GATED',
  },
  cost: {
    credits_spent: 0,
    generation_invoked: false,
  },
  recorded_by: 'neuro-hermes-strategist',
  recorded_at: '2026-08-20',
});

/**
 * OpenArt bounded single-image CANARY execution evidence (2026-08-22).
 *
 * One human-authorized invocation, forensically verified read-only afterward.
 * This records the completed canary WITHOUT granting standing write authority:
 * the write corridor is VERIFIED for a bounded single job only; the default
 * invocation gate stays CLOSED and autonomous invocation remains NOT AUTHORIZED.
 *
 * Sanitized: no account identifiers, balances, OAuth material, or full asset
 * URLs are recorded. Private evidence lives in the verification vault.
 */
export const OPENART_MCP_CANARY_EVIDENCE = Object.freeze({
  canary_execution: 'VERIFIED',
  authorization: 'HUMAN_SINGLE_INVOCATION',
  invocation_count: 1,
  model: 'kling-3-omni',
  mode: 'text2image',
  requested_images: 1,
  returned_assets: 1,
  quoted_credits: 10,
  actual_charged_credits: 10,
  quote_matched_charge: true,
  retries: 0,
  fallback_model: 'NONE',
  provider_switch: 'NONE',
  second_invocation: 'NONE',
  series_amount_finding: 'seriesAmount=4 inert under resultType=single',
  execution_status: 'COMPLETED',
  lane_state_after_canary: 'GATED',
  live: 'UNARMED',
  write_corridor: {
    bounded_single_job_canary: 'VERIFIED',
    standing_write_authority: 'NOT_GRANTED',
    autonomous_invocation: 'NOT_AUTHORIZED',
    default_gate: 'CLOSED',
  },
  recorded_by: 'neuro-hermes-strategist',
  recorded_at: '2026-08-22',
});

const descriptors = Object.freeze([
  {
    id: 'openart-mcp',
    adapterId: 'openart-mcp-adapter',
    prefix: 'OPENART_MCP',
    kind: 'GENERATION_PROVIDER',
    festivalVisual: 'DISALLOWED',
  },
  {
    id: 'comfyui-mcp',
    adapterId: 'comfyui-mcp-adapter',
    prefix: 'COMFYUI_MCP',
    kind: 'GENERATION_PROVIDER',
    festivalVisual: 'DISALLOWED',
  },
  {
    id: 'blender-mcp',
    adapterId: 'blender-mcp-adapter',
    prefix: 'BLENDER_MCP',
    kind: 'UTILITY_RUNTIME',
    festivalVisual: 'POST_PRODUCTION_ONLY',
  },
  {
    id: 'ffmpeg-mcp',
    adapterId: 'ffmpeg-mcp-adapter',
    prefix: 'FFMPEG_MCP',
    kind: 'UTILITY_RUNTIME',
    festivalVisual: 'POST_PRODUCTION_ONLY',
  },
]);

function readinessFor(descriptor, env = {}) {
  const runtimeId = nonEmpty(env[`${descriptor.prefix}_RUNTIME_ID`])
    ? env[`${descriptor.prefix}_RUNTIME_ID`].trim()
    : null;
  const verificationState = nonEmpty(env[`${descriptor.prefix}_VERIFICATION_STATE`])
    ? env[`${descriptor.prefix}_VERIFICATION_STATE`].trim()
    : 'PENDING';
  const enabled = env[`${descriptor.prefix}_ENABLED`] === 'true';
  const adapterVerified = env[`${descriptor.prefix}_ADAPTER_VERIFIED`] === 'true';
  const capabilityVerified = env[`${descriptor.prefix}_CAPABILITY_VERIFIED`] === 'true';
  const provenanceVerified = env[`${descriptor.prefix}_PROVENANCE_VERIFIED`] === 'true';

  const reasons = [];
  if (!runtimeId) reasons.push(`${descriptor.id} runtime identity is not verified/configured`);
  if (verificationState !== 'VERIFIED') reasons.push(`${descriptor.id} verification state is not VERIFIED`);
  if (!adapterVerified) reasons.push(`${descriptor.id} adapter verification evidence is absent`);
  if (!capabilityVerified) reasons.push(`${descriptor.id} capability evidence is absent`);
  if (!provenanceVerified) reasons.push(`${descriptor.id} provenance evidence is absent`);
  if (!enabled) reasons.push(`${descriptor.id} is not enabled for execution`);

  return {
    provider_id: descriptor.kind === 'GENERATION_PROVIDER' ? descriptor.id : null,
    runtime_type: descriptor.kind === 'UTILITY_RUNTIME' ? descriptor.id : null,
    adapter_id: descriptor.adapterId,
    runtime_id: runtimeId,
    kind: descriptor.kind,
    transport: 'MCP',
    registry_state: reasons.length === 0 ? 'ELIGIBLE' : 'PENDING_EVIDENCE',
    eligible: reasons.length === 0,
    enabled,
    verification_state: verificationState,
    evidence: {
      adapter_verified: adapterVerified,
      capability_verified: capabilityVerified,
      provenance_verified: provenanceVerified,
    },
    policy: {
      normal_creator: 'ALLOWED_WHEN_VERIFIED',
      higgsfield_festival_visual_submission: descriptor.festivalVisual,
    },
    authority: 'READINESS_ONLY',
    invocation_performed: false,
    reasons,
  };
}

export function openArtProviderReadiness(env = {}) {
  return readinessFor(descriptors[0], env);
}

/**
 * Surface the recorded OpenArt MCP verification evidence. Read-only; does not
 * change eligibility. Write/generative readiness stays CONDITIONAL and
 * invocation stays GATED until a human authorizes + funds it.
 */
export function openArtVerificationEvidence() {
  return OPENART_MCP_VERIFICATION_EVIDENCE;
}

/**
 * Surface the recorded OpenArt bounded single-image CANARY execution evidence.
 * Read-only; does NOT grant standing write authority. The default invocation
 * gate stays CLOSED and autonomous invocation stays NOT_AUTHORIZED.
 */
export function openArtCanaryEvidence() {
  return OPENART_MCP_CANARY_EVIDENCE;
}

export function comfyUIProviderReadiness(env = {}) {
  return readinessFor(descriptors[1], env);
}

export function blenderUtilityReadiness(env = {}) {
  return readinessFor(descriptors[2], env);
}

export function ffmpegUtilityReadiness(env = {}) {
  return readinessFor(descriptors[3], env);
}

export function listProviderReadiness(env = {}) {
  return {
    authority: 'READ_ONLY_PROVIDER_REGISTRY',
    execution_mode: env.EXECUTION_MODE || 'AUTHORIZATION_ONLY',
    provider_invocation: 'DISABLED',
    providers: descriptors.map((descriptor) => readinessFor(descriptor, env)),
  };
}
