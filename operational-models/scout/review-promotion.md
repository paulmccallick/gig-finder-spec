---
id: scout-review-promotion-operational-model
capability: gig-scout
feature: review-promotion
title: Review-and-promotion operational model
summary: Bind reviewed evidence, resolve concurrency, and reconcile separate position, Gig, and document commits.
elements: [work-levels, configuration-binding, status-models, derived-completion, retry-replay-reconciliation, concurrency-ordering, durable-evidence]
requires: [../../features/scout/review-promotion.md, ../../foundations/managed-document-integrity.md]
implementation_areas: [src/core/scout/engine/scout-position-service.ts, src/core/gig-domain-service.ts, src/data/scout-run-store.ts]
test_suites: [src/core/scout/engine/test/scout-position-service.test.ts, src/data/test/scout-run-store.test.ts, src/web/e2e/gig-scout.e2e.ts]
---

# Review-and-promotion operational model

## Purpose and boundary

This model governs optimistic review, explicit identity resolution, persisted promotion intent, separate Gig/document side effects, and durable retry/reconciliation. It begins from fully processed current evidence and ends with user decision or completed/failed promotion.

## Governing invariants

No model output auto-pursues. A user decision binds exact current evidence/state. Any candidate Gig requires explicit use-existing or create-separate. Promotion is complete only after the target Gig matches intended posting-owned fields, the selected authoritative job description contains the reviewed content, and the position links that Gig. Exact reviewed source/provenance is additionally required for a document created or versioned by this promotion; a preexisting byte-identical-content no-op retains its prior metadata/provenance.

## Work levels and coordination

1. **Position state/review evidence:** current revision and exact description/relevance/match IDs.
2. **Decision:** durable user/agent/system action, note/review time, resulting revision, and optional reversal.
3. **Promotion intent:** exact observation/description/evaluations, resolution/fingerprint, selected Gig revision, attempt/failure/status.
4. **Gig effect:** deterministic create or posting-owned update.
5. **Document effect:** deterministic create/no-op/version of one selected authoritative job description.
6. **Completion projection:** promotion completed and position promoted/linked only after effects verify.

## Configuration binding

Review binds evidence identifiers rather than mutable “current” values. Resolution fingerprint binds normalized posting company/title/requisition/URL plus every candidate ID, revision, match reason, and selected job-description ID/version. Promotion provenance retains official URL, retrieval instant, source/extracted hashes, source key, configuration version, extraction strategy, and converter version.

## State models

| Position transition | Trigger/result |
|---|---|
| `needs_user_review → irrelevant` | Current user irrelevant decision. |
| `needs_user_review → deferred` | Current defer decision with timestamp. |
| `deferred → needs_user_review` | Next listing after review time is due. |
| `needs_user_review → processing` | Accepted pursue intent is durable. |
| `processing → needs_user_review` | Stale/invalid resolution releases attempt. |
| `processing → promoted` | Promotion completes and links Gig. |
| `processing → processing` | Generic promotion failure remains retryable with details. |

Decision actions are `irrelevant`, `defer`, `restore`, `pursue`, `reverse`; origins are `agent`, `user`, `system`. Promotion status is `pending`, `completed`, or `failed`. Resolution kind is `create_new` or `use_existing`. Pursue response is `created`, `updated`, `resolution_required`, `resolution_stale`, or `resolution_invalid`.

## Completion and aggregation

Pursue is not accepted while candidate resolution is required/stale/invalid. After accepted intent, promotion completes only when deterministic Gig state matches intended posting-owned fields; the selected job description has exact content and any created/versioned effect has exact reviewed source/provenance; promotion stores linked Gig/result; and position is `promoted`. Pursue increments position revision when intent enters `processing`; completion sets `promoted` without a second revision increment. Failure of any later step keeps durable intent/failure and prevents false completion.

## Retry, replay, and reconciliation

Gig/document change IDs derive from decision identity. Create-new uses creation idempotency; use-existing verifies intended posting-owned fields before avoiding/reapplying a write. Document reconciliation chooses the lexicographically first existing job description, accepts byte-identical content as a no-op without changing or verifying prior source/provenance, or appends exactly one deterministic version with exact reviewed provenance. A Gig may commit before document/state failure; retry resumes from durable intent and verifies/repairs instead of duplicating. Completed retry derives a new deterministic identity from position, linked Gig, latest observation, and latest description, can update that still-active Gig/document without a new decision or position revision, and rejects a missing candidate or closed linked Gig. It is an internal service path: current UI only exposes retry for `failed` status and cannot open a promoted position.

## Concurrency and ordering

State revision plus exact three evidence IDs reject a stale drawer. Resolution uses candidate fingerprint and, for use-existing, expected Gig revision. Posting company/requisition/title normalization is trim plus host-default locale lowercase; URL comparison is exact after trim, so locale and URL-spelling differences can change candidates. Candidates order by requisition, URL, title match, non-closed state, then locale-compared Gig ID. Intent is persisted before Gig/document effects. Gig precedes document; document precedes promotion/position completion. Stale/invalid resolution releases to review, clears current decision, and advances revision again; a concurrent change at any guarded boundary returns conflict/stale/invalid rather than silently selecting another target.

## Durable evidence and observability

Retain decision change ID/action/origin/actor/reason/note, four reviewed values, review timestamp, reversal link, resolution choice/fingerprint/candidate revision, promotion attempt/failure/status, exact observation/description/evaluations, linked Gig, deterministic changes, and managed-document provenance when created/versioned. Separate source operations also persist: direct restore is allowed only from `irrelevant` whose current decision origin is `agent`; reverse targets any decision for the same position whose origin is `user`; each requires exact current revision, records a user decision, and advances revision. Restore returns to review. Reverse clears defer and returns to review when unlinked or stays promoted when linked; it does not undo Gig/document effects. A separate 1–2,000-character trimmed note may optionally reference a decision and does not change position state/revision. These three operations have no current dashboard controls. UI exposes current evidence, history, candidates, failure, and failed-promotion retry outcome; state/count refresh preserves ledger context.
