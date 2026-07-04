# Wafer GLM-5.2 AMD Inference Intel

Source: https://www.wafer.ai/blog/glm52-amd

## Verdict

Yes, this applies to Agentropolis.

Core lock:

```text
Wafer + GLM-5.2 + AMD = inference infrastructure lane.
Not a separate repo yet.
```

This belongs behind the Model Router and Intelligence Grid. It should not become another standalone product surface until usage, cost, and deployment demand prove it.

## What the signal says

Wafer announced GLM-5.2 served through Vercel AI Gateway and OpenRouter, with AMD MI355X performance positioned around performance-per-dollar rather than raw brand loyalty.

Key reported signals:

- GLM-5.2 live through Vercel AI Gateway and OpenRouter.
- AMD MI355X deployment reached 2626 tok/s/node on Wafer's benchmark workload.
- Single-stream GLM-5.2 reached 213 tok/s.
- Wafer frames AMD as cheaper capacity against Blackwell scarcity.
- The engineering work focused on quantization, sglang, speculative decode, ROCm fixes, KV cache tuning, and MoE kernel selection.
- Wafer's conclusion: the CUDA moat is eroding as support improves.

## Agentropolis interpretation

This validates the low-overhead doctrine:

```text
Cloud API-first.
Local optional.
Self-hosted later.
Dedicated AMD/NVIDIA inference only when workload proves it.
```

Agentropolis should not make AMD, NVIDIA, Wafer, GLM, OpenRouter, or Vercel the city brain.

Agentropolis should route to them as supply lines.

## Where it fits

```text
User / Agent / District
  -> HERMES Dispatch
  -> Intelligence Grid
  -> Policy Gate
  -> Model Router
  -> Provider Lane
      -> OpenRouter
      -> Vercel AI Gateway
      -> Wafer
      -> Direct GLM API
      -> Other hosted inference
  -> Telemetry
  -> Audit Log
```

## AGENTROPOLIS-AGENT-MCP impact

This repo should treat the signal as an MCP provider-routing capability.

Possible MCP additions later:

- `model.route`
- `model.quote`
- `model.healthcheck`
- `model.cost_report`
- `model.provider_registry`
- `model.latency_snapshot`

The MCP layer should expose provider choice as governed infrastructure, not hard-code one model.

## Do now

- Keep this as provider intelligence.
- Add model-provider registry fields when the router is implemented.
- Track Wafer/OpenRouter/Vercel as possible provider lanes.
- Do not create a dedicated Wafer repo.

## Do not do yet

- Do not self-host GLM-5.2 just because AMD performance improved.
- Do not optimize kernels before traffic exists.
- Do not bind Agentropolis identity to any one provider.
- Do not turn inference benchmarking into the product.

## Canon line

```text
Agentropolis owns the routing, policy, memory, telemetry, and audit path.
Compute providers are replaceable supply lines.
```
