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

`GET /healthz` is a lightweight container liveness probe. It reports the
application revision with database integrity marked `skipped` and the
foreign-key violation count set to `null`; it does not run database integrity
or foreign-key validation. Run the explicit maintenance
validation command for those checks. A healthy response is not a
model-provider check, source-retrieval check, queue-progress assertion, or full
artifact-integrity audit.

## Logging

Pino writes newline-delimited JSON to stdout; the container runtime owns local
log retention and rotation. Log level defaults to `debug`. Request loggers carry
`requestId`; HTTP records include path/method, status, latency, and errors.
Streaming response start is separately logged, so its recorded latency is not
total conversation completion time.

The production container uses Docker's `local` logging driver with a 20 MB
maximum file size and five retained files. There is no application-owned log
file or log-directory bind mount. Preserve container logs through the runtime
or an external collector when longer retention is required.

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
