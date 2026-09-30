---
type: interface
scope: gig-scout
summary: Current Scout HTTP contracts, UI availability, source import schema, and external boundaries.
load_when:
  - calling Scout endpoints
  - changing Scout request validation or source integration
related:
  - capabilities/gig-scout.md
  - workflows/gig-scout-review-processing.md
  - architecture/gig-scout.md
---
# Gig Scout Interfaces

## HTTP Contract

All paths below are relative to `/api/gig-scout`. The implementation is the contract; there is no separate versioned Scout OpenAPI specification in the inspected boundary. Unsupported methods return 405. Most absent Scout dependencies return 503; individual missing run/position/backfill detail returns 404.

| Method/path | Input and response |
| --- | --- |
| POST `/companies` | Single company object; returns `{created, unchanged, versioned, rejected}`. Rejection 400; creation/versioning 201; unchanged 200. |
| GET `/runs` | Array of run summaries, newest first; includes saved search profile and counts. |
| POST `/runs` | Optional `{batchSize, concurrency, searchProfile}`; 202 `{run, created}`. Existing active full run returns `created:false`. |
| GET `/runs/:id` | Summary plus per-company sources, attempts, counters, validation status, failure details, diagnostics. |
| GET `/runs/:id/positions` | Query `company`, `text`, `offset`, `limit`; historical observation page. |
| GET `/positions` | Query `text`, `company`, `state`, `sort`, `direction`, `offset`, `limit`; workspace page and state counts. |
| GET `/positions/:id` | Review detail with Markdown, evaluation IDs, score explanation, source provenance, and observations; promoted/irrelevant/rejected positions are unavailable through ordinary detail. |
| GET, PUT `/settings/relevance` | Read latest criteria; PUT `{criteria, confidenceThreshold}` appends criteria version and schedules relevant re-evaluation work. |
| POST `/positions/:id/decision` | Reviewed decision body described below; position result or pursuit outcome. |
| POST `/positions/:id/restore` | `{changeId, expectedStateRevision}` restores agent irrelevance. |
| POST `/positions/:id/reverse` | `{decisionId, changeId, expectedStateRevision}` reverses user decision. |
| POST `/positions/:id/notes` | `{decisionId?, body}`; 201 `{ok:true}`. |
| POST `/positions/:id/promotion/retry` | No required body; 202 pursuit outcome, or null when no promotion work exists. |
| POST `/positions/backfill/preview` | Exact-position body described below; accepted/rejected eligibility report. |
| POST `/positions/backfill` | Exact-position body; 202 execution status. Legacy query `sourceRunId` and optional `limit` selects run-based backfill instead. |
| GET `/positions/backfill/:runId` | Explicit-backfill stage/item/document outcomes; unknown execution 404. |

Pagination requires nonnegative integer offset and limit 1–100 (default 20). Text/company filters trim and truncate to 200 characters. Position state accepts only `actionable`, `processing`, `needs_user_review` (default), or `deferred`. Sort accepts `last_seen` (default), `first_seen`, `company`, `title`, `state`, or `score`; direction defaults descending and accepts asc/desc. Full-run batch size is 1–100, concurrency 1–50; service defaults are 20 and 5 unless injected defaults override them.

Decision bodies accept only `changeId`, `action` (`irrelevant`, `defer`, `pursue`), optional `note`, optional `reviewAt`, `expectedStateRevision`, `descriptionId`, `relevanceEvaluationId`, `candidateMatchEvaluationId`, and optional `resolution`. Notes contain 1–2,000 characters; defer requires a valid timestamp. The HTTP handler assigns actor `User`, and rejects a client-supplied actor in the strict decision body. It does not authenticate a distinct Scout identity itself; use the application security documentation for the overall boundary.

Pursuit can return `created`, `updated`, `resolution_required`, `resolution_stale`, or `resolution_invalid`. Required/stale results carry a fingerprint and candidate list. The resolution is either `{kind:"create_new", reviewedFingerprint}` or `{kind:"use_existing", reviewedFingerprint, gigId, expectedGigRevision}`. These are domain outcome bodies, not all HTTP errors. Mutation exceptions containing “revised” map to 409; other exceptions in the Scout mutation wrapper map to 422. Decision JSON/unknown-field validation also returns 422. Other endpoint errors follow the shared handler and are not uniformly converted by that wrapper.

Explicit-backfill body accepts only `{positionIds, reason}`: 1–1,000 unique IDs matching `spos_` plus 32 lowercase hex digits, and a trimmed 1–500-character reason. Duplicate IDs are normalized away and sorted. Query filters are rejected for explicit requests. Preview may contain rejected entries; start is all-or-nothing. Validation errors map to 400. Status IDs must be UUID-shaped `srun_...` values.

Relevance criteria require 10–4,000 characters and numeric confidence threshold 0–1. Persistence quantizes confidence thresholds to thousandths; no readback precision beyond that is promised.

## Company Import and External Source Contract

The bulk core import accepts `{version:1, companies:[...]}` with at most 10,000 companies. Each strict company object supplies `id` (1–100 characters), `name` (1–200), `active` (default true), and 1–50 sources. Company IDs are unique within the import, and exactly one source per company is active. The HTTP endpoint wraps a single company into this bulk schema.

Sources use HTTPS and type `json` or `html`. JSON can specify extraction/pagination directly or reference a template `{id, version}` with variables and overrides. HTML specifies selectors and pagination. Description plans support JSON detail endpoints or HTML DOM/JSON-LD extraction. JSON and DOM description plans require identity evidence, and declared HTML-entity encoding requires HTML content format. Template resolution validates inputs before import writes.

Outbound `GigScoutHttpPort.request` takes URL, GET/POST, optional headers/body, timeout, response-byte bound, optional redirect mode, and abort signal. Responses provide status, final URL, headers, and body. Screening takes validated posting content plus criteria/profile/rubric bindings; model results must satisfy strict relevance and candidate-score schemas. See architecture for adapter implementations.

## Current Surfaces

The web workspace `?workspace=scout` exposes Positions and Run History. Positions supports detail/review, defer/irrelevant/pursue, candidate resolution, failed-promotion retry, and relevance settings. Run History starts scans and displays source diagnostics and observations. No current review controls were found for company import, explicit backfill, direct agent-irrelevance restore, reversal, or independent note append.

The source harness is `bun run scout:source --config <private.json> --output <ignored.json>` with optional company, source, template, term, location, and pages selectors. It tests configured sourcing; it is not the persisted full-run API. `scout:encoded-description-selection` and `scout:verify-descriptions:live` are maintenance/verification scripts. No Scout tools were found in the normal agent tool registry or regular CLI commands.

## Source Evidence

- [HTTP routing, input parsing, response/error mapping](app::src/web/request-handler.ts)
- [Run service validation](app::src/core/scout/engine/runs.ts) and [position-service validation](app::src/core/scout/engine/scout-position-service.ts)
- [Company import schema](app::src/core/scout/engine/company-import.ts), [source contracts](app::src/core/scout/sourcing/contracts.ts), [HTTP port](app::src/core/scout/sourcing/ports.ts)
- [Run-history UI](app::src/web/client/GigScoutPage.tsx), [review UI](app::src/web/client/ScoutPositionReview.tsx), [workspace route](app::src/web/client/App.tsx)
- [Source harness entrypoint](app::scripts/scout-source.ts), [package scripts](app::package.json), [agent tool registry](app::src/agent/gig-finder-tools.ts)
