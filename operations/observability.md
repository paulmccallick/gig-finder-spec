---
type: operations
scope: observability
summary: Inspect health, correlated logs, and diagnostic limitations.
load_when:
  - Inspect health, correlated logs, and diagnostic limitations.
related:
  - requirements/security.md
  - operations/recovery.md
  - architecture/overview.md
---

# Observability

## Health

`GET /healthz` reports application revision, database integrity, and foreign-key violation count. Its status also reflects the full database validation result. A healthy response is not a model-provider check, source-retrieval check, queue-progress assertion, or full artifact-integrity audit.

## Logging

Pino writes JSON logs to the configured log directory as `server.log`, rotates at 10 MB with at most five files, and tees output to stdout. Log level defaults to `debug`. Request loggers carry `requestId`; HTTP records include path/method, status, latency, and errors. Streaming response start is separately logged, so its recorded latency is not total conversation completion time.

The per-user macOS production host defaults file logs to
`~/Library/Logs/GigFinder`. Docker stdout logs provide a separate copy for
the lifetime of a retained container; replacing a container can remove that
copy, so archive it first when preserving history.

Scout response bodies are logged only in bounded, sanitized form by default.
Set `GIG_FINDER_SCOUT_LOG_FULL_RESPONSES=true` for a controlled diagnostic run
to include the complete sanitized response body; disable it immediately after
capturing evidence because response logs may contain sensitive career-site
content and can grow rapidly.

Startup logs report address, revision, active log path, level, and devtools diagnostics. Scout runtimes emit processing events. Profile materialization failure is separately logged. AI SDK devtools are enabled only by the exact configured `true` value; Docker defaults them off.

## Privacy and Limits

Selected authorization/cookie headers are redacted; general content is not comprehensively redacted. See [security](../requirements/security.md). No metrics backend, paging/alert configuration, or service-level dashboard is established by the inspected runtime.

## Evidence

**OBS-ARCH-001** Current implementation references for logging, HTTP instrumentation, startup, composition, and database validation are listed in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#obs-arch-001).
