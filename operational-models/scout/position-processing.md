---
id: scout-position-processing-operational-model
capability: gig-scout
feature: position-processing
title: Position-processing operational model
summary: Coordinate durable semantic work for observation binding, description acquisition, relevance, and candidate match.
elements: [work-levels, configuration-binding, status-models, retry-replay-reconciliation, concurrency-ordering, external-trust, durable-evidence, bounds]
requires: [../../features/scout/position-processing.md]
implementation_areas: [src/core/scout/engine/positions.ts, src/core/scout/engine/screening.ts, src/core/scout/sourcing/detail-descriptions.ts, src/operations/scout-position-runtime.ts, src/data/scout-run-store.ts]
test_suites: [src/core/scout/engine/test, src/data/test/scout-run-store.test.ts, src/agent/test/scout-position-screening.test.ts]
---

# Position-processing operational model

## Purpose and boundary

This model owns asynchronous cross-run position work from an accepted observation to durable description/evaluations and current review state. Human decisions/promotion and operator backfill coordination are separate models.

## Governing invariants

Each processing row represents one semantic input identity. Exact work reuses its evidence; changed inputs supersede obsolete unfinished work. A downstream stage binds the exact upstream result. Only explicit position-backfill processing preserves a current user-origin decision/projection. Ordinary discovery processing may later replace it when relevance/match completes, and relevance-configuration save immediately returns every described unlinked position—including user-owned states—to `processing`.

## Work levels and coordination

The cross-run **position projection** owns current posting fields, first/last seen, state, revision, and linked Gig. A new position starts `processing` at revision 1. Ordered **processing work** owns four semantic stages. Scheduling or completing reconciliation/description, completing a relevance pass that continues to matching, and merely receiving a later observation do not change position revision/state. A projected confident irrelevance or candidate-match completion advances revision by one; explicit position backfill suppresses that projection/increment when preserving a current user-origin decision. The **queue/outbox** owns durable dispatch/retry. **Evidence records** own immutable description artifacts/acquisitions, relevance evaluations, and candidate-match evaluations. Completion of one stage schedules/binds the next; it does not rewrite older evidence.

## Configuration binding

Description work binds the exact observation, listing content hash, official URL/title/location, source configuration/settings, and converter identity. Relevance binds description plus criteria/threshold/prompt/model configuration. Candidate match binds relevance plus exact candidate-profile artifact/hash/version, rubric/prompt, provider/model configuration. Later edits create new semantic work; they never alter old evidence.

## State models

| Position state | Entered when | Leaves when |
|---|---|---|
| `processing` | New position initialization at revision 1; criteria save for any described unlinked position; or pursue promotion. Ordinary later observations can have active work without changing an existing projection to processing. | Screening projects review/irrelevant, user workflow changes, or promotion completes. |
| `needs_user_review` | Candidate-match scoring completes for an unlinked position, or due defer/restore returns it. | User decision; criteria save; or a later unprotected screening projection. |
| `irrelevant` | Confident relevance failure (agent origin) or user decision. | Direct restore where allowed, criteria save, or later unprotected processing projection; only explicit position backfill preserves a current user-origin state. |
| `rejected` | Reserved/legacy persisted state. | No user transition; relevance configuration save can move an unlinked described record to `processing`; otherwise excluded from workspace/detail reads. |
| `deferred` | User supplies a review timestamp. | Next list after due time returns it to review. |
| `promoted` | Promotion links a canonical Gig after exact document work. | Remains promoted; completed retry may refresh linked Gig/document. |

| Processing stage | Responsibility |
|---|---|
| `reconcile_gig` | Validate/bind observation and schedule description work; does not choose an existing Gig. |
| `acquire_description` | Reuse listing description or acquire/convert authoritative detail. |
| `screen_relevance` | Produce bounded exclusion decision/reason/confidence/evidence/ambiguities. |
| `score_candidate_match` | Produce separate integer 1–10 score/explanation with no action recommendation. |

Every stage status is `pending`, `completed`, `failed`, or `superseded`. Document projection status is `pending`, `updated`, `unchanged`, or `failed`. Relevance decision is exactly `fails_relevance` or `passes_relevance`.

| Position outbox state | Entered when | Leaves when |
|---|---|---|
| `pending` | A semantic stage is first created, or an exact failed/superseded stage is revived and its dispatch marker reset. | A dispatch sweep examines its still-pending processing row, creates/reuses the deterministic durable queue job, and marks the outbox dispatched. |
| `dispatched` | The sweep has completed queue add/existence handling for that processing row. | Revival resets it to pending; processing completion/failure leaves the outbox marker dispatched. |

Outbox dispatch is a projection, not stage completion or a running state. Every sweep selects up to 1,000 `pending` processing rows regardless of outbox marker, checks the deterministic queue ID, recreates missing/unknown jobs, and projects a queue job already exhausted as processing `failed` with attempt count 3. Queue delivery owns up to three attempts; intermediate delivery attempts do not create another outbox state.

Position revision changes are exact: initialization writes 1; confident relevance projection, candidate-match review projection, criteria-save reset, user/system restore, user decision/reverse, and stale/invalid promotion release each add one. Candidate-match completion adds one even when the position already projects `needs_user_review`. Reconcile/description work, relevance continuation, queue retry/failure, promotion failure, promotion completion, completed-promotion retry, and standalone note do not change it.

## Retry, replay, and reconciliation

Position jobs use deterministic processing IDs/job IDs, three attempts, and one-second backoff. Startup/periodic sweeps examine at most 1,000 ordered pending items and recreate missing/unknown jobs; exhaustion changes only that work row to failed and creates no downstream row. The position remains at its pre-failure projection. Reconciliation alone does not revive failure. A later observation, criteria save, or backfill that ensures the exact semantic stage changes failed/superseded back to pending, clears attempts/failure, and resets the outbox; replacement inputs supersede prior pending/failed work. Immutable evidence/input identities prevent duplicate description/evaluation rows on redelivery.

## Concurrency and ordering

Work selection is stage-first (`reconcile_gig`, description, relevance, match), then outbox creation time and ID. Worker batch/concurrency are process-wide (defaults 20/5). Different positions may progress concurrently; one position cannot use a downstream result not explicitly bound to its upstream identity.

## External-source trust

Normal processing reuses a captured listing description; otherwise only the configured official detail plan may fetch. Detail is HTTPS, no redirect, at most 1 MB/15 seconds, acceptable content type, nonempty, and matches exact ID and/or title evidence. Ambiguous or mismatched content fails. HTML conversion has immutable identity; plain text is preserved. Backfill always refetches authoritative detail.

## Durable evidence and observability

Persist description source/content hashes, artifact identity/path/size/media/provenance, acquisition inputs/result, processing/outbox/failure/attempt state, criteria/rubric/profile/prompt/model identities, structured relevance evidence/ambiguities/confidence, candidate score/explanation, token/cache counts, and latency. Workspace detail exposes current stage/status/failure and exact review evidence; historical rows remain for diagnosis.

## Bounds and limits

Authoritative detail: HTTPS, no redirect, 1 MB, 15 seconds. Normalized description: nonempty and at most 200,000 JavaScript characters. Relevance reason ≤255, up to eight evidence and eight ambiguity strings; confidence 0–1. Candidate score 1–10 and explanation ≤310 characters. Reconciliation sweep ≤1,000 work items; queue attempts 3.
