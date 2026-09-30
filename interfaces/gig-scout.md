---
type: interface
scope: gig-scout
summary: Scout web and HTTP contracts for company search, position review, source configuration, and reprocessing.
load_when:
  - calling Scout endpoints
  - changing Scout request validation or source integration
---
# Gig Scout Interfaces

## Purpose

Scout's web workspace lets a job seeker search configured companies, review evaluated positions, and choose opportunities to track. The HTTP API also exposes company configuration and maintenance actions that have no current web controls. The [capability](../capabilities/gig-scout.md) owns behavior and rules; this document defines inputs, outputs, and boundary errors.

## Current Surfaces

The web workspace at `?workspace=scout` has **Positions** and **Run History**. Run History starts full searches with title and location filters and displays company/source results and accepted observations. A full search selects every active configured company, not a company subset supplied in its request. Positions supports filters, detail, pursue/irrelevant/defer decisions, existing-Gig selection, failed-promotion retry, and relevance settings.

Company import, explicit reprocessing, agent-irrelevance restoration, decision reversal, and independent note append are backend actions without current review controls. Scout is not exposed through the normal conversational-agent tool registry or regular CLI commands.

The operator source harness is `bun run scout:source --config <private.json> --output <ignored.json>`, with optional company, source, template, term, location, and pages selectors. It tests source configuration; it does not start a persisted full search. The maintenance scripts `scout:encoded-description-selection` and `scout:verify-descriptions:live` support description verification.

## HTTP Contract

All routes below are relative to `/api/gig-scout`. The implementation is the current contract; the inspected boundary has no separate versioned Scout OpenAPI specification.

| Method/path | Request and response |
| --- | --- |
| POST `/companies` | One company configuration. Returns `{created, unchanged, versioned, rejected}`; 201 for created/versioned, 200 for unchanged, 400 for rejection. |
| GET `/runs` | Newest-first run summaries, including saved search filters and counts. |
| POST `/runs` | Optional `{batchSize, concurrency, searchProfile}`. Returns 202 `{run, created}`; an active full run is reused with `created:false`. |
| GET `/runs/:id` | Run and per-company/source outcomes, attempts, counters, validation, and diagnostics. |
| GET `/runs/:id/positions` | Historical observations, filtered by `company` and `text`, paged by `offset` and `limit`. |
| GET `/positions` | Review workspace page and state counts, using `text`, `company`, `state`, `sort`, `direction`, `offset`, and `limit`. |
| GET `/positions/:id` | Description Markdown, score explanation, reviewed evidence identifiers, source history, and observations. Ordinary detail excludes irrelevant/rejected positions and positions linked to Gigs. |
| GET, PUT `/settings/relevance` | Read latest settings or append a version using `{criteria, confidenceThreshold}` and schedule re-evaluation. |
| POST `/positions/:id/decision` | Submit reviewed evidence and pursue/irrelevant/defer decision; returns the position or a pursuit outcome. |
| POST `/positions/:id/restore` | `{changeId, expectedStateRevision}` restores agent-marked irrelevance. |
| POST `/positions/:id/reverse` | `{decisionId, changeId, expectedStateRevision}` reverses a user decision. |
| POST `/positions/:id/notes` | `{decisionId?, body}`; returns 201 `{ok:true}`. |
| POST `/positions/:id/promotion/retry` | No required body; returns 202 pursuit outcome, or null if no promotion work exists. |
| POST `/positions/backfill/preview` | Exact-position selection and reason; returns eligibility with accepted/rejected items. |
| POST `/positions/backfill` | Exact-position selection and reason; returns 202 execution status. Legacy query `sourceRunId` with optional `limit` selects run-based backfill. |
| GET `/positions/backfill/:runId` | Explicit-reprocessing progress and position/document outcomes; unknown execution returns 404. |

Pagination uses a nonnegative integer offset and limit 1–100, default 20. Text/company filters are trimmed and limited to 200 characters. State accepts `actionable`, `processing`, `needs_user_review` (default), or `deferred`. Sort accepts `last_seen` (default), `first_seen`, `company`, `title`, `state`, or `score`; direction accepts `asc` or `desc`, default `desc`.

Full-run batch size is 1–100 and concurrency is 1–50; service defaults are 20 and 5 unless overridden at construction. `searchProfile` contains `terms`, `titleVariants`, and `locations`. Omitted or empty lists resolve to built-in defaults. The candidate profile is loaded from application configuration and saved with the run for scoring; it is not a field in the start-run request. See the [discovery workflow](../workflows/gig-scout-discovery.md) for default filters and selection semantics.

## Review and Reprocessing Requests

A decision body permits only `changeId`, `action` (`irrelevant`, `defer`, `pursue`), optional `note`, optional `reviewAt`, `expectedStateRevision`, `descriptionId`, `relevanceEvaluationId`, `candidateMatchEvaluationId`, and optional `resolution`. Notes contain 1–2,000 characters. Defer requires a valid timestamp. The handler supplies actor `User` and rejects a client-supplied actor.

The revision and evaluation identifiers identify exactly what the user reviewed. Pursuit can return `created`, `updated`, `resolution_required`, `resolution_stale`, or `resolution_invalid`. A required/stale resolution includes possible Gigs and a fingerprint identifying that candidate set. The subsequent choice is `{kind:"create_new", reviewedFingerprint}` or `{kind:"use_existing", reviewedFingerprint, gigId, expectedGigRevision}`. These outcomes are response bodies, not uniformly HTTP errors. See [posting resolution](../workflows/opportunities-posting-resolution.md).

Explicit reprocessing accepts only `{positionIds, reason}`: 1–1,000 unique identifiers matching `spos_` followed by 32 lowercase hexadecimal digits, plus a trimmed 1–500-character reason. Duplicate identifiers are removed and the selection sorted. Query filters are rejected for explicit requests. Preview can report ineligible items; start rejects the entire selection if any item is ineligible. Status identifiers must be UUID-shaped `srun_...` values.

Relevance settings require criteria of 10–4,000 characters and a numeric confidence threshold from 0 to 1. Stored thresholds are rounded to thousandths. The [processing workflow](../workflows/gig-scout-review-processing.md) explains how changing criteria differs from explicit reprocessing.

## Company Import and Source Contract

The core bulk import accepts `{version:1, companies:[...]}` with at most 10,000 companies. Each strict company object supplies `id` (1–100 characters), `name` (1–200), `active` (default true), and 1–50 sources. Company IDs must be unique within the import, and each company must have exactly one active source. The HTTP endpoint wraps one company in this bulk schema.

Sources use HTTPS and type `json` or `html`. A JSON source either supplies extraction and pagination settings or references a versioned template `{id, version}` with variables and overrides. An HTML source supplies selectors and pagination. Description retrieval can use a JSON detail endpoint, HTML elements, or embedded JSON-LD metadata. JSON and HTML-element description plans require evidence that retrieved content belongs to the expected posting. Declared HTML-entity encoding requires HTML content format. Templates are resolved and validated before import writes.

The outbound `GigScoutHttpPort.request` contract accepts URL, GET/POST, optional headers/body, timeout, response-byte limit, optional redirect policy, and abort signal. Its response provides status, final URL, headers, and body. The relevance model receives validated posting content and criteria. Candidate scoring additionally receives the saved candidate profile and rubric. Both model responses must satisfy strict schemas; [architecture](../architecture/gig-scout.md) identifies the implementations.

## Authentication and Errors

Scout routes do not authenticate a distinct Scout identity themselves. The [application security boundary](../requirements/security.md) describes the surrounding access model.

Unsupported methods return 405. Most unavailable Scout dependencies return 503, and unknown individual runs, positions, or reprocessing executions return 404. The mutation wrapper maps exceptions containing “revised” to 409 and other mutation exceptions to 422. Invalid decision JSON or unknown fields also return 422. Explicit-backfill validation errors return 400. Other endpoint errors follow shared handling rather than that mutation wrapper.

## Compatibility and Guarantees

There is no declared independent Scout API version. Strict request schemas reject unsupported fields. Reusing an active full run retains its original saved settings. Review requests must identify current evidence, and explicit reprocessing starts only for a wholly eligible selection. Source failures remain visible instead of implying that a company has no positions.

## Related Documentation

- [Gig Scout behavior](../capabilities/gig-scout.md)
- [Search workflow](../workflows/gig-scout-discovery.md)
- [Evaluation, review, and reprocessing workflow](../workflows/gig-scout-review-processing.md)
- [Implementation and recovery](../architecture/gig-scout.md)

## Source Evidence

- [HTTP routing, input parsing, response/error mapping](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts)
- [Run service validation](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/runs.ts) and [position-service validation](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/scout-position-service.ts)
- [Company import schema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/company-import.ts), [source contracts](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/sourcing/contracts.ts), [HTTP port](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/sourcing/ports.ts)
- [Run-history UI](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/GigScoutPage.tsx), [review UI](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/ScoutPositionReview.tsx), [workspace route](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/App.tsx)
- [Source harness entrypoint](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/scripts/scout-source.ts), [package scripts](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/package.json), [agent tool registry](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts)

## Related documents

- [Gig Scout](../capabilities/gig-scout.md)
- [Evaluate Positions, Review Results, and Pursue Opportunities](../workflows/gig-scout-review-processing.md)
- [Gig Scout Architecture](../architecture/gig-scout.md)
