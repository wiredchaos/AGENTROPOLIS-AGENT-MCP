const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

export const OPENART_PROVIDER_ID = 'openart-mcp';
export const OPENART_ADAPTER_ID = 'openart-mcp-adapter';

export function openArtProviderReadiness(env = {}) {
  const runtimeId = nonEmpty(env.OPENART_MCP_RUNTIME_ID) ? env.OPENART_MCP_RUNTIME_ID.trim() : null;
  const verificationState = nonEmpty(env.OPENART_MCP_VERIFICATION_STATE)
    ? env.OPENART_MCP_VERIFICATION_STATE.trim()
    : 'PENDING';
  const enabled = env.OPENART_MCP_ENABLED === 'true';
  const adapterVerified = env.OPENART_MCP_ADAPTER_VERIFIED === 'true';
  const capabilityVerified = env.OPENART_MCP_CAPABILITY_VERIFIED === 'true';
  const provenanceVerified = env.OPENART_MCP_PROVENANCE_VERIFIED === 'true';

  const reasons = [];
  if (!runtimeId) reasons.push('OpenArt MCP runtime identity is not verified/configured');
  if (verificationState !== 'VERIFIED') reasons.push('OpenArt MCP verification state is not VERIFIED');
  if (!adapterVerified) reasons.push('OpenArt MCP adapter verification evidence is absent');
  if (!capabilityVerified) reasons.push('OpenArt MCP capability evidence is absent');
  if (!provenanceVerified) reasons.push('OpenArt MCP provenance evidence is absent');
  if (!enabled) reasons.push('OpenArt MCP provider is not enabled for execution');

  return {
    provider_id: OPENART_PROVIDER_ID,
    adapter_id: OPENART_ADAPTER_ID,
    runtime_id: runtimeId,
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
      higgsfield_festival_visual_submission: 'DISALLOWED',
    },
    authority: 'READINESS_ONLY',
    invocation_performed: false,
    reasons,
  };
}

export function listProviderReadiness(env = {}) {
  return {
    authority: 'READ_ONLY_PROVIDER_REGISTRY',
    execution_mode: env.EXECUTION_MODE || 'AUTHORIZATION_ONLY',
    provider_invocation: 'DISABLED',
    providers: [openArtProviderReadiness(env)],
  };
}
