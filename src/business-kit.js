export const BUSINESS_KIT_VERSION = "0.2.0";

export const BUSINESS_KIT_STAGES = ["DISCOVER", "DESCRIBE", "VALIDATE", "PREPARE", "APPROVE", "EXECUTE", "OBSERVE"];

export const GLOBAL_JURISDICTION_FIELDS = [
  "countryCode",
  "subdivisionCode",
  "cityOrLocality",
  "operatingCountries",
  "customerCountries",
  "taxResidencyCountries",
  "dataResidencyCountries"
];

export const BUSINESS_KIT_TOOLS = [
  {
    name: "get_agent_business_kit_manifest",
    title: "Get Global Agent Business Kit Manifest",
    description: "Return the provider-neutral global Agentropolis business capability map, jurisdiction model, Web3 overlays, safety boundaries, and execution lanes.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: {} }
  },
  {
    name: "plan_agent_business_setup",
    title: "Plan Global Agent Business Setup",
    description: "Build a non-filing, jurisdiction-aware setup plan for an agent-operated business without autonomously choosing a legal entity, tax treatment, bank, or Web3 compliance position.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        countryCode: { type: "string", minLength: 2, maxLength: 2, description: "ISO 3166-1 alpha-2 country code" },
        subdivisionCode: { type: "string", maxLength: 12, description: "Optional ISO 3166-2 or provider-recognized subdivision code" },
        cityOrLocality: { type: "string", maxLength: 120 },
        operatingCountries: { type: "array", maxItems: 64, items: { type: "string", minLength: 2, maxLength: 2 } },
        customerCountries: { type: "array", maxItems: 128, items: { type: "string", minLength: 2, maxLength: 2 } },
        taxResidencyCountries: { type: "array", maxItems: 16, items: { type: "string", minLength: 2, maxLength: 2 } },
        dataResidencyCountries: { type: "array", maxItems: 32, items: { type: "string", minLength: 2, maxLength: 2 } },
        entityForm: { type: "string", maxLength: 120, description: "Owner-selected local entity form or 'undecided'" },
        taxTreatment: { type: "string", maxLength: 120, description: "Owner/professional-selected local tax treatment or 'undecided'" },
        businessModel: { type: "string", enum: ["services", "software", "commerce", "media", "marketplace", "protocol", "dao", "treasury", "mixed", "other"] },
        web3Enabled: { type: "boolean", default: false },
        custodyMode: { type: "string", enum: ["none", "self_custody", "third_party_custody", "smart_contract", "undecided"], default: "none" },
        tokenActivity: { type: "string", enum: ["none", "accept_only", "payments", "treasury", "issuance", "staking", "defi", "nft", "mixed", "undecided"], default: "none" },
        hasDomain: { type: "boolean", default: false },
        hasEmail: { type: "boolean", default: false },
        hasEntity: { type: "boolean", default: false },
        hasTaxIdentity: { type: "boolean", default: false },
        needsBanking: { type: "boolean", default: true }
      },
      required: ["countryCode"]
    }
  },
  {
    name: "validate_agent_business_readiness",
    title: "Validate Global Agent Business Readiness",
    description: "Check a proposed global business setup for missing jurisdiction facts, regulated-action gates, cross-border exposure, Web3 risk, and human review requirements.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        countryCode: { type: "string", minLength: 2, maxLength: 2 },
        subdivisionCode: { type: "string", maxLength: 12 },
        operatingCountries: { type: "array", maxItems: 64, items: { type: "string", minLength: 2, maxLength: 2 } },
        customerCountries: { type: "array", maxItems: 128, items: { type: "string", minLength: 2, maxLength: 2 } },
        taxResidencyCountries: { type: "array", maxItems: 16, items: { type: "string", minLength: 2, maxLength: 2 } },
        dataResidencyCountries: { type: "array", maxItems: 32, items: { type: "string", minLength: 2, maxLength: 2 } },
        entityForm: { type: "string", maxLength: 120 },
        taxTreatment: { type: "string", maxLength: 120 },
        web3Enabled: { type: "boolean" },
        custodyMode: { type: "string", enum: ["none", "self_custody", "third_party_custody", "smart_contract", "undecided"] },
        tokenActivity: { type: "string", enum: ["none", "accept_only", "payments", "treasury", "issuance", "staking", "defi", "nft", "mixed", "undecided"] },
        hasDomain: { type: "boolean" },
        hasEmail: { type: "boolean" },
        hasEntity: { type: "boolean" },
        hasTaxIdentity: { type: "boolean" },
        hasBanking: { type: "boolean" },
        humanOwnerOrResponsiblePartyConfirmed: { type: "boolean" },
        sanctionsScreeningConfigured: { type: "boolean" },
        kybKycProviderConfigured: { type: "boolean" }
      },
      required: ["countryCode", "entityForm", "taxTreatment"]
    }
  },
  {
    name: "get_global_jurisdiction_adapter_contract",
    title: "Get Global Jurisdiction Adapter Contract",
    description: "Return the contract that country and regional provider adapters must implement before the Agent Business Kit can make jurisdiction-specific recommendations.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: { type: "object", additionalProperties: false, properties: {} }
  }
];

export function globalJurisdictionAdapterContract() {
  return {
    contract: "agentropolis.business.jurisdiction.v1",
    principle: "Global core, local adapters.",
    requiredResolverInputs: GLOBAL_JURISDICTION_FIELDS,
    requiredAdapterMethods: [
      "resolve_entity_forms",
      "resolve_registration_authorities",
      "resolve_tax_identity_requirements",
      "resolve_tax_election_or_classification_options",
      "resolve_beneficial_ownership_requirements",
      "resolve_licenses_and_permits",
      "resolve_employment_and_payroll_requirements",
      "resolve_vat_gst_sales_tax_requirements",
      "resolve_banking_and_payment_constraints",
      "resolve_web3_and_virtual_asset_constraints",
      "resolve_sanctions_and_restricted_party_controls",
      "resolve_data_residency_and_privacy_requirements",
      "resolve_filing_deadlines",
      "resolve_source_provenance"
    ],
    freshness: {
      legalTaxRegulatoryData: "time_sensitive",
      rule: "Adapters must carry source provenance, effective dates, checked-at timestamps, and expiry or revalidation policy."
    },
    fallback: "If no verified local adapter is available, return REQUIRE_LOCAL_VERIFICATION. Never substitute United States rules or another country's rules."
  };
}

export function businessKitManifest() {
  return {
    name: "AGENTROPOLIS MCP AGENT BUSINESS KIT",
    version: BUSINESS_KIT_VERSION,
    scope: "GLOBAL_WEB3_AND_TRADITIONAL_BUSINESS",
    layer: "infrastructure",
    lifecycle: BUSINESS_KIT_STAGES,
    architectureRule: "Global core, local adapters, provider-neutral execution.",
    verticalSpine: [
      "identity_and_mandate",
      "jurisdiction_resolution",
      "domain_and_email",
      "legal_structure_decision",
      "registration_and_beneficial_ownership",
      "tax_identity_and_tax_residency",
      "tax_classification_or_election_when_applicable",
      "banking_payments_and_fx",
      "web3_wallet_treasury_and_token_controls",
      "bookkeeping_reporting_and_cross_border_accounting",
      "licenses_insurance_employment_and_compliance",
      "privacy_data_residency_and_records",
      "ongoing_regulatory_observability"
    ],
    horizontalMesh: [
      "parent_organization",
      "subsidiaries_branches_or_operating_entities",
      "district_or_business_units",
      "agent_operating_cells",
      "shared_mail",
      "shared_finance",
      "shared_accounting",
      "shared_compliance",
      "shared_web3_treasury_policy",
      "policy_inheritance",
      "intercompany_and_cross_border_boundaries",
      "consolidated_receipts"
    ],
    capabilityFamilies: {
      jurisdiction: ["country_resolution", "subnational_resolution", "cross_border_exposure_map", "freshness_check"],
      mail: ["discover", "provision_draft", "read", "search", "summarize", "draft", "approval_gated_send"],
      entity: ["discover_local_forms", "prepare_filing", "validate_filing", "approval_gated_submit", "track_status"],
      taxIdentity: ["discover_local_identifier", "prepare_application_packet", "approval_gated_submission_or_handoff", "track_status"],
      taxTreatment: ["classification_options", "eligibility_check", "prepare_election_or_registration_packet", "approval_gated_submission_or_handoff", "track_status"],
      finance: ["provider_discovery", "account_readiness", "approval_gated_onboarding", "read_accounts", "fx_awareness", "approval_gated_money_movement"],
      web3: ["wallet_policy", "custody_policy", "chain_risk", "token_activity_classification", "virtual_asset_requirement_discovery", "approval_gated_transactions"],
      compliance: ["sanctions_controls", "kyb_kyc_requirements", "beneficial_ownership", "licenses", "privacy", "data_residency", "deadline_tracking", "evidence_capture", "human_review"]
    },
    examplesOfLocalOnlyConcepts: {
      US: ["EIN", "S corporation election"],
      rule: "Local concepts are supplied by jurisdiction adapters and must never appear as universal requirements."
    },
    authority: {
      publicMcp: "READ_ONLY_PLANNING",
      authenticatedExecution: "SEPARATE_CORRIDOR",
      filings: "HUMAN_APPROVAL_REQUIRED",
      taxChanges: "HUMAN_APPROVAL_REQUIRED",
      bankingOnboarding: "HUMAN_APPROVAL_REQUIRED",
      web3Transactions: "HUMAN_APPROVAL_AND_POLICY_REQUIRED",
      moneyMovement: "HUMAN_APPROVAL_AND_POLICY_REQUIRED",
      secrets: "SEALED_VAULT_REFERENCES_ONLY"
    },
    invariants: [
      "An AI agent is an operator, not automatically the legal owner, director, officer, beneficial owner, taxpayer, or regulated responsible person.",
      "Do not autonomously select an entity form, tax residency, tax treatment, bank, custodian, or regulatory classification for an owner.",
      "Do not place identity documents, taxpayer identifiers, bank credentials, wallet private keys, seed phrases, or unrestricted signing keys in model context.",
      "Prepare and submit are separate actions.",
      "Cross-border activity must be evaluated against all materially relevant jurisdictions, not only the incorporation country.",
      "Every consequential action requires policy evaluation and a receipt.",
      "Provider availability never widens agent authority.",
      "No verified local adapter means no jurisdiction-specific legal or tax assertion."
    ]
  };
}

function step(id, status, risk, approvalRequired, note, scope = "global") {
  return { id, status, risk, approvalRequired, scope, note };
}

function uniqueCountryList(input = {}) {
  const values = [
    input.countryCode,
    ...(input.operatingCountries || []),
    ...(input.customerCountries || []),
    ...(input.taxResidencyCountries || []),
    ...(input.dataResidencyCountries || [])
  ].filter(Boolean).map((v) => String(v).toUpperCase());
  return [...new Set(values)];
}

export function planBusinessSetup(input = {}) {
  const countryCode = String(input.countryCode || "").toUpperCase();
  const entityForm = input.entityForm || "undecided";
  const taxTreatment = input.taxTreatment || "undecided";
  const countriesInScope = uniqueCountryList(input);
  const steps = [];

  steps.push(step("identity_and_mandate", "required", "moderate", true, "Bind the agent to an accountable organization, mandate, budget, and human owner/responsible-party reference."));
  steps.push(step("jurisdiction_resolution", "verification_required", "high", true, `Resolve current requirements for ${countriesInScope.join(", ") || countryCode} using verified local adapters with provenance and effective dates.`));
  steps.push(step("cross_border_exposure", countriesInScope.length > 1 ? "required" : "monitor", countriesInScope.length > 1 ? "high" : "moderate", true, "Evaluate incorporation, operations, customers, tax residency, banking, Web3 activity, and data residency separately."));
  steps.push(step("domain", input.hasDomain ? "complete" : "needed", "low", false, "Reserve or attach a business domain through a provider adapter."));
  steps.push(step("email", input.hasEmail ? "complete" : "needed", "moderate", true, "Provision a scoped mailbox; outbound send authority remains approval-gated by policy."));

  if (entityForm === "undecided") {
    steps.push(step("entity_form", "blocked_pending_owner_decision", "high", true, "Discover locally available forms and compare consequences; the agent must not choose autonomously."));
  } else {
    steps.push(step("entity_form", "selected_for_local_validation", "high", true, `Owner-selected form: ${entityForm}. Verify that this form exists and is suitable in the resolved jurisdiction before preparing a filing.`));
  }

  steps.push(step("registration", input.hasEntity ? "complete_unverified" : "requirements_pending_adapter", "high", true, "Resolve the correct registry, formation or registration path, beneficial-ownership rules, and required local representatives where applicable."));
  steps.push(step("tax_identity", input.hasTaxIdentity ? "complete_unverified" : "requirements_pending_adapter", "high", true, "Resolve local tax identifiers, registrations, and responsible-party requirements. U.S. EIN logic applies only when the U.S. adapter says it applies."));
  steps.push(step("tax_treatment", taxTreatment === "undecided" ? "owner_or_professional_decision_required" : "selected_for_local_validation", "high", true, "Resolve local entity classification, elections, VAT/GST/sales tax, permanent-establishment exposure, and cross-border tax obligations through verified adapters."));

  if (input.needsBanking !== false) steps.push(step("banking_payments_fx", "provider_and_kyb_readiness", "high", true, "Match banking, payment, settlement, and FX providers by jurisdiction and eligibility; account opening remains KYC/KYB dependent."));

  if (input.web3Enabled) {
    steps.push(step("web3_activity_classification", "required", "critical", true, `Classify custody mode (${input.custodyMode || "undecided"}) and token activity (${input.tokenActivity || "undecided"}) per relevant jurisdiction before enabling execution.`));
    steps.push(step("wallet_and_treasury_policy", "required", "critical", true, "Use capability handles, transaction simulation, allowlists, spend limits, chain policy, sanctions controls, and separate approval for signing or movement of value."));
  }

  steps.push(step("bookkeeping_reporting", "needed", "moderate", true, "Attach accounting and reporting providers that can represent multi-currency, cross-border, tax, and digital-asset activity when applicable."));
  steps.push(step("licenses_employment_insurance", "jurisdiction_check_required", "high", true, "Discover industry, employment, payroll, insurance, consumer, and local licensing obligations dynamically."));
  steps.push(step("privacy_and_data_residency", "jurisdiction_check_required", "high", true, "Map data subjects, processing locations, storage regions, transfer paths, retention, and provider obligations."));
  steps.push(step("observe", "continuous", "low", false, "Track deadlines, provider state, receipts, spend, law/policy freshness, and cross-border changes without silently changing legal or tax status."));

  return {
    homeJurisdiction: { countryCode, subdivisionCode: input.subdivisionCode || null, cityOrLocality: input.cityOrLocality || null },
    countriesInScope,
    entityForm,
    taxTreatment,
    web3: { enabled: Boolean(input.web3Enabled), custodyMode: input.custodyMode || "none", tokenActivity: input.tokenActivity || "none" },
    status: entityForm === "undecided" ? "NEEDS_OWNER_DECISION" : "REQUIRES_LOCAL_ADAPTER_VALIDATION",
    stages: BUSINESS_KIT_STAGES,
    steps,
    nextAllowedActions: ["resolve_verified_local_adapters", "discover_requirements", "compare_owner_selected_options", "prepare_non_filing_checklist"],
    prohibitedAtPublicReadOnlyLayer: ["submit_registration", "submit_tax_application", "change_tax_status", "open_bank_account", "move_fiat", "sign_web3_transaction", "move_digital_assets", "send_external_email"]
  };
}

export function validateBusinessReadiness(input = {}) {
  const findings = [];
  const add = (severity, code, message) => findings.push({ severity, code, message });
  const countriesInScope = uniqueCountryList(input);
  if (!input.countryCode || !/^[A-Za-z]{2}$/.test(input.countryCode)) add("error", "COUNTRY_CODE_REQUIRED", "A two-letter country code is required before local requirements can be resolved.");
  if (!input.entityForm || input.entityForm === "undecided") add("error", "ENTITY_FORM_UNDECIDED", "The legal form still requires an owner decision after local options are discovered.");
  if (!input.taxTreatment || input.taxTreatment === "undecided") add("warning", "TAX_TREATMENT_UNDECIDED", "Tax treatment has not been selected for owner/professional review.");
  if (!input.humanOwnerOrResponsiblePartyConfirmed) add("error", "RESPONSIBLE_PARTY_REQUIRED", "A legally accountable human or organization representative must be confirmed for regulated formation, tax, banking, and compliance workflows where required.");
  if (!input.hasEntity) add("warning", "ENTITY_STATUS_UNVERIFIED", "No verified entity or registration status is recorded in this readiness packet.");
  if (input.hasEntity && !input.hasTaxIdentity) add("warning", "TAX_IDENTITY_UNVERIFIED", "The required local tax identity or registration status has not been verified.");
  if (!input.hasBanking) add("info", "BANKING_NOT_READY", "Banking is not recorded as ready; onboarding remains jurisdiction-, provider-, and KYC/KYB-dependent.");
  if (countriesInScope.length > 1) add("warning", "CROSS_BORDER_REVIEW_REQUIRED", `Multiple jurisdictions are in scope (${countriesInScope.join(", ")}); incorporation country alone is insufficient.`);
  if (input.web3Enabled) {
    if (!input.custodyMode || input.custodyMode === "undecided") add("error", "WEB3_CUSTODY_UNDECIDED", "Web3 execution cannot be enabled until custody mode is explicitly classified.");
    if (!input.tokenActivity || input.tokenActivity === "undecided") add("error", "TOKEN_ACTIVITY_UNDECIDED", "Web3 execution cannot be enabled until token activity is classified.");
    if (!input.sanctionsScreeningConfigured) add("error", "SANCTIONS_CONTROL_REQUIRED", "Web3 value movement requires configured restricted-party/sanctions controls before execution can be considered.");
    if (!input.kybKycProviderConfigured && ["payments", "treasury", "issuance", "staking", "defi", "mixed"].includes(input.tokenActivity)) add("warning", "KYB_KYC_PROVIDER_UNVERIFIED", "The selected Web3 activity may require identity/compliance controls depending on the relevant jurisdictions and provider roles.");
  }

  const hasError = findings.some((f) => f.severity === "error");
  return {
    status: hasError ? "INCOMPLETE" : "READY_FOR_LOCAL_VERIFICATION_AND_HUMAN_REVIEW",
    countriesInScope,
    findings,
    executionAuthority: "NONE_FROM_VALIDATION",
    nextAllowedActions: hasError ? ["resolve_readiness_findings", "resolve_verified_local_adapters", "discover_requirements"] : ["prepare_draft_packets", "request_human_review"],
    disclaimer: "Readiness validation is workflow control, not legal, tax, banking, sanctions, licensing, privacy, or virtual-asset approval."
  };
}

export function validateBusinessKitArguments(tool, args) {
  if (!args || typeof args !== "object" || Array.isArray(args)) return "arguments must be an object";
  const allowed = new Set(Object.keys(tool.inputSchema.properties || {}));
  for (const key of Object.keys(args)) if (!allowed.has(key)) return `unexpected argument: ${key}`;
  for (const key of tool.inputSchema.required || []) if (!(key in args)) return `missing required argument: ${key}`;
  if (args.countryCode !== undefined && (typeof args.countryCode !== "string" || !/^[A-Za-z]{2}$/.test(args.countryCode))) return "countryCode must be a two-letter country code";
  for (const key of ["operatingCountries", "customerCountries", "taxResidencyCountries", "dataResidencyCountries"]) {
    if (args[key] !== undefined && (!Array.isArray(args[key]) || args[key].some((v) => typeof v !== "string" || !/^[A-Za-z]{2}$/.test(v)))) return `${key} must be an array of two-letter country codes`;
  }
  for (const key of ["entityForm", "taxTreatment", "subdivisionCode", "cityOrLocality"]) if (args[key] !== undefined && typeof args[key] !== "string") return `${key} must be a string`;
  for (const key of ["hasDomain", "hasEmail", "hasEntity", "hasTaxIdentity", "needsBanking", "hasBanking", "humanOwnerOrResponsiblePartyConfirmed", "web3Enabled", "sanctionsScreeningConfigured", "kybKycProviderConfigured"]) if (args[key] !== undefined && typeof args[key] !== "boolean") return `${key} must be boolean`;
  return null;
}
