---
type: operations
scope: observability
summary: How to use the health endpoint and logs to investigate a running application.
load_when:
  - how to use the health endpoint and logs to investigate a running application
---

# Health Checks and Logs

## Check Whether the Server and Database Are Healthy

`GET /healthz` reports the running source revision, database integrity result, and foreign-key violation count. Its HTTP status reflects the full database validation result, including checks not listed in the response body.

A healthy response means these local checks passed. It does not show whether an AI request succeeds, whether a company source is reachable, or whether a Scout queue is making progress. Use the relevant feature and its logs to investigate those cases; see [Scout diagnostics](../architecture/gig-scout.md) and [conversation failure behavior](../architecture/conversational-agent.md).

## Find a Request in the Logs

The application writes JSON log entries to `server.log` in the configured log directory and also sends them to standard output. A request's `x-request-id` response header matches its log `requestId`, allowing request and error entries to be followed together.

Request entries include method/path, status, latency, and errors. For assistant streaming, the response-start entry measures time until streaming begins, not time until the whole answer finishes. Startup entries show address, source revision, log path, level, and devtools status.

Pino supplies structured logging. The file rotates at 10 MB with at most five files; log level defaults to `debug`. AI SDK devtools are enabled only when the configuration value is exactly `true`, and the Docker image defaults them off.

## Use Logs With Their Limits in Mind

Logs can contain private data. Only selected authorization/cookie header paths are redacted; see [security and privacy](../requirements/security.md). The inspected runtime has no separate metrics backend or automatic paging configuration.

If the problem requires restoring state, use [recovery](recovery.md). For component responsibilities and code entry points, use the [architecture overview](../architecture/overview.md).

## Evidence

[Logger](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/observability/logger.ts), [HTTP instrumentation](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts), [startup](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/server.ts), [configuration](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/app.ts), and [database validation](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/maintenance.ts).

## Related ADRs

- [ADR 0013: Allow private application data in local logs](../decisions/0013-allow-private-data-in-local-logs.md)

## Related documents

- [Security and Privacy](../requirements/security.md)
- [Recovery and Maintenance](recovery.md)
- [Architecture Overview](../architecture/overview.md)
