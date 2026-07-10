# DIRECTOR Live Transcript and Clip Trigger Integration

DIRECTOR is the live media intelligence layer for AGENTROPOLIS. It ingests timestamped stream transcripts, evaluates rolling context windows, and queues clip extraction when a configurable score threshold is reached.

## Repository responsibility

AGENTROPOLIS-AGENT-MCP owns the tool contract that exposes transcript ingestion, score evaluation, clip queue creation, job inspection, and status updates to Hermes and other authorized agents.

## Dashboard surface

The DIRECTOR tab appears in the Hermes Dashboard sidebar and exposes rolling transcript, clip queue, generated captions, confidence score, and processing status.

## Transcript sources

- OBS WebSocket plus a bridge script posting text to the plugin API
- local Whisper running against stream audio
- Gladia, Otter, or another service writing to a file, webhook, or API

## Normalized transcript event

```json
{
  "stream_id": "stream_2026_07_10",
  "segment_id": "segment_00482",
  "source": "whisper_local",
  "speaker": "NEURO",
  "text": "This segment is being evaluated for a potential clip.",
  "started_at": "2026-07-10T16:22:13.420Z",
  "ended_at": "2026-07-10T16:22:19.810Z",
  "confidence": 0.94,
  "is_final": true
}
```

## MCP tool surface

Recommended tools:

- `director.ingest_transcript`
- `director.score_window`
- `director.queue_clip`
- `director.list_clip_jobs`
- `director.get_clip_job`
- `director.update_clip_status`
- `director.generate_caption`

All write tools must require an authenticated stream or agent identity and return stable job identifiers.

## Trigger contract

```text
moment_score >= clip_trigger_threshold
```

Passing moments create an auditable extraction job containing timestamps, transcript context, score, contributing signals, pre-roll, post-roll, and caption instructions.

## Reliability rules

Never invent missing transcript text. Ignore incomplete events unless partial evaluation is enabled. On source failure, preserve the last acknowledged timestamp, mark ingestion degraded, retry with backoff, and block low-confidence extraction.
