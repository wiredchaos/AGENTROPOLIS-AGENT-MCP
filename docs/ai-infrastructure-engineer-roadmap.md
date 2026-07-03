# AI Infrastructure Engineer Roadmap

Agentropolis needs infrastructure that can run models, agents, memory, tools, and workflows as one coordinated intelligence grid.

This roadmap defines the engineering knowledge base for building and operating that stack.

## Mission

Build Agentropolis as production AI infrastructure, not a demo app.

The system must support:

- High throughput inference
- Multi-agent orchestration
- Secure MCP tool execution
- GPU aware model serving
- RAG and memory pipelines
- Fine-tuning workflows
- Observability across agents, tools, models, and infrastructure
- Cost optimized routing and fallback strategies

## Core Domains

### 1. GPU Foundations

Learn and apply:

- GPU architecture
- VRAM fundamentals
- CUDA execution model
- CUDA memory hierarchy
- Tensor cores
- Kernel launch overhead
- PCIe, NVLink, InfiniBand, and RoCE basics
- Linux GPU drivers, NVIDIA Container Toolkit, and CUDA runtime compatibility

Agentropolis relevance:

GPU literacy turns model hosting from guesswork into capacity planning. Every district that depends on inference needs clear expectations for VRAM, token throughput, batch size, latency, and concurrency.

### 2. Inference Optimization

Learn and apply:

- Quantization: INT8, FP8, 4-bit, GPTQ, AWQ, GGUF
- Batching and continuous batching
- KV caching
- Prefix caching
- Speculative decoding
- Token throughput benchmarking
- Context length tradeoffs
- Prefill versus decode latency

Core tools:

- vLLM
- TensorRT-LLM
- SGLang
- llama.cpp
- Triton Inference Server

Agentropolis relevance:

Inference is the power grid. The city gets faster when shared prompts, common prefixes, cached context, and routing decisions are treated as infrastructure primitives.

### 3. Model Serving

Learn and apply:

- Kubernetes model serving
- Docker images for GPU workloads
- KServe
- Ray Serve
- vLLM serving
- SGLang serving
- Triton serving
- Autoscaling
- Health checks
- Rolling upgrades
- Canary deployments

Agentropolis relevance:

Model serving should behave like a public utility inside the city. Agents should request capabilities, not hardcode model endpoints.

### 4. Distributed Training and Fine-Tuning

Learn and apply:

- PyTorch Distributed Data Parallel
- Fully Sharded Data Parallel
- DeepSpeed
- ZeRO stages
- LoRA
- QLoRA
- PEFT
- Checkpointing
- Dataset preparation
- Model registry workflows

Agentropolis relevance:

Fine-tuning is how districts specialize models without corrupting the whole system. LoRA and QLoRA are preferred for modular skill adaptation.

### 5. Multi-GPU and Multi-Node Systems

Learn and apply:

- NCCL
- InfiniBand
- GPUDirect RDMA
- NVLink and NVSwitch concepts
- Tensor parallelism
- Pipeline parallelism
- Data parallelism
- Expert parallelism basics
- Multi-node inference

Agentropolis relevance:

Large districts may need multi-GPU inference for long context, high concurrency, or specialist model pools.

### 6. RAG, Embeddings, and Memory

Learn and apply:

- Embedding models
- Vector databases
- Hybrid search
- Reranking
- Chunking strategies
- Metadata filtering
- Temporal memory
- Semantic caching
- Prompt caching
- Retrieval evaluation

Agentropolis relevance:

Memory is civic infrastructure. RAG pipelines must separate durable canon, working context, user memory, logs, and temporary task state.

### 7. Agents, MCP, and Workflow Orchestration

Learn and apply:

- MCP servers and tools
- Agent routing
- Tool permissions
- Workflow graphs
- Human approval gates
- Agent memory boundaries
- Skill registries
- Fallback paths
- Guardrail policies

Agentropolis relevance:

MCP is the city service layer. Agents should operate through explicit contracts, not unbounded tool access.

### 8. Observability and Evaluation

Learn and apply:

- OpenTelemetry
- Prometheus
- Grafana
- Langfuse
- Phoenix
- Request tracing
- Token accounting
- Latency histograms
- Cost dashboards
- LLM evaluation
- Benchmarking
- A/B testing
- Regression suites

Agentropolis relevance:

No invisible agents. Every model call, tool call, routing decision, cache hit, fallback, and failure mode should be traceable.

### 9. Security and Guardrails

Learn and apply:

- Prompt injection mitigation
- Tool sandboxing
- Secret management
- Least privilege access
- Policy enforcement
- Audit logs
- Data retention boundaries
- Tenant isolation
- Model output validation

Agentropolis relevance:

A city without security becomes chaos. Guardrails must be part of the runtime, not decoration on top.

### 10. MLOps and CI/CD

Learn and apply:

- GitHub Actions
- MLflow
- Model registries
- Dataset versioning
- Container builds
- Automated benchmarks
- Deployment gates
- Rollback plans
- Environment promotion

Agentropolis relevance:

Every model, skill, agent, and MCP server should have a path from experiment to production with tests, versioning, and observability.

### 11. Streaming and Data Pipelines

Learn and apply:

- Kafka
- Redpanda
- NATS
- Streaming inference
- Event driven workflows
- Backpressure
- Dead letter queues
- Replayable logs

Agentropolis relevance:

The city needs a nervous system. Events should move between districts without brittle point to point scripts.

## Reference Stack

| Layer | Preferred Tools |
|---|---|
| GPU Runtime | CUDA, NVIDIA Container Toolkit, NCCL |
| Inference | vLLM, SGLang, TensorRT-LLM, llama.cpp |
| Serving | KServe, Ray Serve, Triton, Kubernetes |
| Training | PyTorch, FSDP, DeepSpeed, ZeRO |
| Fine-Tuning | LoRA, QLoRA, PEFT |
| Memory | Vector DB, embeddings, rerankers, semantic cache |
| Observability | OpenTelemetry, Prometheus, Grafana, Langfuse, Phoenix |
| Agents | MCP, skill registry, workflow orchestration |
| Data | Kafka, Redpanda, NATS, object storage |
| MLOps | GitHub Actions, MLflow, model registry |

## Agentropolis Implementation Priorities

1. Build a model router that understands capability, cost, latency, context length, and fallback rules.
2. Add observability before scaling agent count.
3. Treat MCP servers as permissioned civic services.
4. Keep RAG memory separated by canon, session, user, and operational logs.
5. Use vLLM or SGLang for high-throughput inference workloads.
6. Use llama.cpp or GGUF models for lightweight local district workers.
7. Use LoRA and QLoRA for specialized district intelligence.
8. Use Kubernetes only when the system is ready for orchestration complexity.
9. Benchmark every model before it becomes a default route.
10. Log every tool call and every agent handoff.

## Anti-Moloch Operating Rules

- Do not scale what cannot be observed.
- Do not automate what cannot be reversed.
- Do not give agents tools without permission boundaries.
- Do not trust one model when routing and fallback are available.
- Do not let memory grow without decay, summarization, or governance.
- Do not confuse demos with infrastructure.

## Outcome

This roadmap gives Agentropolis the foundation to evolve from a creative agent ecosystem into a production-grade AI infrastructure city.

The goal is not bigger models for their own sake.

The goal is coordinated intelligence with memory, governance, observability, cost control, and secure execution.
