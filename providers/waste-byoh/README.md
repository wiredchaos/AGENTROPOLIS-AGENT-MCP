# AGENTROPOLIS WASTE BYOH Provider

Production boundary between the AGENTROPOLIS Dispatch Protocol and a WASTE OpenAI-compatible server.

## Guarantees

- one active generation per WASTE context
- fixed model identity
- hard completion-token ceiling
- thinking disabled unless operator policy enables it
- bearer authentication on the AGENTROPOLIS edge
- readiness checks against WASTE
- JSONL inference receipts with SHA-256 integrity fields
- cancellation propagated when clients disconnect

## Run

```bash
cp .env.example .env
npm test
npm start
```

Start WASTE separately on `127.0.0.1:8000`. Point Hermes or the AGENTROPOLIS router at `http://127.0.0.1:8787/v1`.

## Cloud deployment

Cloud is supported as a self-hosted BYOH node. Use bare metal or a VM with directly attached local NVMe. Do not place the K3 container on object storage, NFS, ordinary network block storage, or a USB enclosure.

## Authority boundary

This adapter performs inference only. It cannot grant tool authority, mutate memory, approve transactions, deploy code, or bypass AEGIS and Human Mission Control.
