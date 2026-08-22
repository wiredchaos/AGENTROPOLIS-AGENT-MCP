const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

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
