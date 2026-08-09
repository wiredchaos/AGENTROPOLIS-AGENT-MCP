export const CLOUDFLARE_COMPUTER_STATUS = "EXPERIMENTAL_QUARANTINED";

export const CLOUDFLARE_COMPUTER_BACKENDS = [
  {
    id: "worker-javascript",
    name: "Cloudflare Computer JavaScript Isolate",
    authority: "NO_EXECUTION_AUTHORITY",
    networkDefault: "DENY",
    fit: ["structured javascript", "filesystem transforms", "bounded code evaluation"],
    avoid: ["native binaries", "package installation", "browser automation"]
  },
  {
    id: "worker-shell",
    name: "Cloudflare Computer Shell Isolate",
    authority: "NO_EXECUTION_AUTHORITY",
    networkDefault: "DENY",
    fit: ["read", "search", "grep", "sed", "awk", "jq", "text transforms"],
    avoid: ["native compilation", "arbitrary linux binaries", "browser automation"]
  },
  {
    id: "container",
    name: "Cloudflare Computer Container",
    authority: "NO_EXECUTION_AUTHORITY",
    networkDefault: "POLICY_GATED",
    fit: ["npm", "node", "native binaries", "full linux userland"],
    avoid: ["tasks satisfiable by a lower-capability isolate"]
  }
];

export const CLOUDFLARE_COMPUTER_54T_CONTROLS = [
  "preview_only_default_deny",
  "effective_capability_graph",
  "transitive_capability_test",
  "egress_default_deny",
  "secret_non_disclosure",
  "workspace_identity_isolation",
  "cross_workspace_access_test",
  "filesystem_symlink_race_test",
  "path_escape_test",
  "rpc_capability_abuse_test",
  "timeout_and_cancellation_test",
  "stdout_stderr_secret_leak_test",
  "git_network_authority_test",
  "artifact_network_authority_test",
  "resource_limit_test",
  "immutable_execution_receipt",
  "human_approval_before_production_enablement"
];

export function cloudflareComputerManifest() {
  return {
    adapter: "cloudflare-computer",
    upstream: "cloudflare/computer",
    upstreamPackage: "@cloudflare/computer",
    observedVersion: "0.1.0-alpha.1",
    status: CLOUDFLARE_COMPUTER_STATUS,
    productionApproved: false,
    role: "optional execution substrate behind the AGENTROPOLIS Runtime Router",
    canonicalMemory: false,
    workspaceRole: ["scratch space", "project files", "execution state", "build artifacts"],
    sovereignStateRemainsInGrid: ["identity", "long-term memory", "RAG truth", "policy", "provenance", "trust", "audit history"],
    backends: CLOUDFLARE_COMPUTER_BACKENDS,
    controls54T: CLOUDFLARE_COMPUTER_54T_CONTROLS,
    invariants: [
      "tool availability does not grant capability authorization",
      "capability authorization does not grant network authorization",
      "network authorization does not grant secret access",
      "the router selects the least-powerful approved backend capable of the task"
    ]
  };
}

export function selectCloudflareComputerBackend(input = {}) {
  const task = String(input.task || "").toLowerCase();
  const needsNative = Boolean(input.needsNativeBinaries) || /npm install|compile|native binary|full linux|docker/.test(task);
  const needsStructuredJs = Boolean(input.needsStructuredJavaScript) || /javascript|ecmascript|module|json transform/.test(task);
  const needsBrowser = Boolean(input.needsBrowser) || /browser|playwright|puppeteer/.test(task);
  const network = input.network || "deny";

  if (needsBrowser) {
    return {
      decision: "ESCALATE",
      backend: null,
      reason: "Cloudflare Computer is not the approved browser surface; route through the governed Browser Surface.",
      authority: "NO_EXECUTION_AUTHORITY"
    };
  }

  const backend = needsNative ? "container" : needsStructuredJs ? "worker-javascript" : "worker-shell";
  const blocked = network !== "deny";
  return {
    decision: blocked ? "ESCALATE" : "PROCEED_TO_CERTIFICATION",
    backend,
    reason: blocked
      ? "Requested network authority requires an explicit 54-T egress and transitive-capability review."
      : "Selected the least-powerful Cloudflare Computer backend that appears capable of the task.",
    authority: "NO_EXECUTION_AUTHORITY",
    certificationRequired: true,
    productionApproved: false
  };
}
