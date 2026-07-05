# NaraRouter Provider Lane

NaraRouter is tracked as an optional OpenAI-compatible provider lane for AGENTROPOLIS-AGENT-MCP.

This is a provider adapter candidate, not a permanent dependency and not city law.

## Operator-Reported Signal

Current operator signal:

```text
Provider: NaraRouter
Registration: router.bynara.id/register
Base URL: router.bynara.id/v1
API style: OpenAI-compatible
Reported free tier: up to roughly 7M tokens/day
Reported reset: daily
Reported model pool: 30+ models including Mistral, DeepSeek, GLM, and related backends
Credit card: operator-reported no credit card
```

## Verification Rule

The public search surface did not provide enough stable indexed evidence to lock the daily quota as doctrine.

Treat the token number as dashboard-verified only.

```text
claim seen online
  -> inspect provider dashboard
  -> verify current quota
  -> verify reset time
  -> verify model list
  -> verify terms and acceptable use
  -> run eval prompts
  -> only then promote from experimental to approved fallback
```

Do not hard-code the 7M/day claim into production configuration without a current operator receipt.

## Correct MCP Placement

NaraRouter belongs behind the provider abstraction layer.

```text
MCP request
  -> classify task
  -> score risk
  -> select model lane
  -> select provider adapter
  -> check authority
  -> execute through OpenAI-compatible base URL
  -> validate output
  -> log receipt
```

## Suggested Config Shape

```text
provider: nararouter
base_url: router.bynara.id/v1
default_model: dashboard-selected-model
credential_source: environment_or_secret_manager
```

Provider keys stay in environment variables or secret managers only.

Never commit provider keys, dashboard exports, token receipts, or private account data.

## Best-Fit Workloads

Use NaraRouter first for low-risk volume lanes:

- coding-agent drafts
- repo analysis summaries
- side-project prototypes
- prompt-pack testing
- synthetic eval generation
- large non-sensitive summarization
- creator workflow exploration
- fallback routing tests

## Blocked Until Verified

Do not route the following through NaraRouter until the provider is formally evaluated and approved:

- wallet-capable execution
- payment authorization
- production deployment mutation
- private client data
- regulated financial, legal, tax, or medical workflows
- credential handling
- irreversible write actions

## Routing Status

```yaml
provider_id: nararouter
provider_name: NaraRouter
adapter_type: openai_compatible
base_url: router.bynara.id/v1
trust_tier: experimental
authority_level: READ_ONLY | DRAFT_ONLY
free_tier_status: dashboard_verify_required
quota_claim: operator_reported_up_to_7m_tokens_daily
quota_lock: false
sensitive_data_allowed: false
wallet_execution_allowed: false
production_write_allowed: false
requires_receipt: true
revalidate_after: 7d
```

## Receipt Shape

```yaml
workflow: nararouter_provider_eval
provider: nararouter
base_url: router.bynara.id/v1
model_used: string
quota_seen_in_dashboard: string
reset_window_seen: string
credit_card_required: true_or_false
terms_checked: true_or_false
prompt_set: string
latency_notes: string
quality_notes: string
failure_notes: string
approved_lanes:
  - READ_ONLY
  - DRAFT_ONLY
last_verified: YYYY-MM-DD
```

## Canon

NaraRouter is a volume lane candidate.

HERMES remains the router.

AGENTROPOLIS-AGENT-MCP remains the governed membrane.

Free tokens are useful. Governance decides whether they are safe.