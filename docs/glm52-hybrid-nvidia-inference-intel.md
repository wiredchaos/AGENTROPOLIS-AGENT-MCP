# GLM-5.2 Hybrid NVIDIA Inference Intel

Source: https://huggingface.co/madeby561/GLM-5.2-MXFP8-NVFP4-NF3-Hybrid

## Verdict

Yes, this applies to AGENTROPOLIS-AGENT-MCP.

Core lock:

```text
GLM-5.2 MXFP8/NVFP4/NF3 Hybrid = experimental self-hosted inference lane.
MCP tools must call it through adapters, not hardwire to it.
```

This belongs behind Model Exchange, HERMES Dispatch, policy gates, telemetry, and audit receipts.

## What the signal says

The model card presents a community-built hybrid quant of GLM-5.2 designed to make a full large MoE deployment fit on a 4-card NVIDIA workstation/server class box.

Reported model-card signals:

- Base: `zai-org/GLM-5.2`.
- Quantized lineage includes `lukealonso/GLM-5.2-NVFP4`.
- License listed on Hugging Face: MIT.
- Format tags include safetensors, GLM MoE, NVFP4, NF3, MXFP8, quantization, and modelopt.
- The author warns it loads only through a custom serving image using an in-house NF3 3-bit kernel.
- Claimed serving target: 4x 96GB sm120 GPUs plus about 64GB RAM.
- Claimed deployment size: about 327GB total.
- Claimed usable context profile: about 118k context with concurrency headroom, or up to about 240k single stream.
- The card explicitly says this is not the official model's 1M context and is not officially supported.
- Hugging Face shows no hosted Inference Provider deployment for this checkpoint at time of capture.

## MCP interpretation

MCP is the tool boundary. It should not care whether the model is hosted, local, AMD, NVIDIA, FP8, NVFP4, or NF3.

MCP should receive:

```text
intent
policy scope
tool authority
model lane
receipt requirement
```

MCP should return:

```text
tool result
risk signal
trace metadata
receipt payload
```

The model lane can change. The tool contract cannot.

## Adapter rule

Do not hardcode this checkpoint into tools.

Use provider metadata:

```text
provider_type: self_hosted
model_family: GLM-5.2
checkpoint: madeby561/GLM-5.2-MXFP8-NVFP4-NF3-Hybrid
precision_profile: MXFP8/NVFP4/NF3
hardware_profile: 4x 96GB sm120 NVIDIA
serving_stack: custom image required
status: experimental
fallback_required: true
```

## Do now

- Track as experimental model-provider intelligence.
- Keep MCP tools model-agnostic.
- Add provider metadata when Model Exchange schemas exist.
- Require fallback routing.
- Require receipts that record checkpoint, quant profile, serving image, and context limit.

## Do not do yet

- Do not make this the default model for MCP calls.
- Do not let local inference bypass policy gates.
- Do not assume official vLLM compatibility.
- Do not route wallet, identity, or destructive tools through this lane without extra validation.

## Canon line

```text
MCP tools are city utilities.
Models are replaceable workers.
The receipt decides what happened.
```
