---
id: scout-discovery-runs-operational-model
capability: gig-scout
feature: discovery-runs
title: Discovery-run operational model
summary: Coordinate full-run, company, source, queue, trust, aggregation, and availability-reconciliation state.
elements: [work-levels, configuration-binding, status-models, derived-completion, retry-replay-reconciliation, concurrency-ordering, external-trust, durable-evidence, bounds]
requires: [../../features/scout/discovery-runs.md, ../../features/opportunities/posting-availability.md]
implementation_areas: [src/core/scout/engine/runs.ts, src/core/scout/engine/scan-company.ts, src/core/scout/sourcing, src/operations/scout-runtime.ts, src/data/scout-run-store.ts]
test_suites: [src/core/scout/engine/test, src/data/test/scout-run-store.test.ts, src/operations/test/scout-runtime.integration.test.ts]
---

# Discovery-run operational model

## Purpose and boundary

This model governs durable asynchronous full runs from accepted start through independently retried company/source work, trusted result persistence, availability reconciliation, and derived terminal aggregation. Position description/screening begins from accepted observations but follows its own model.

## Governing invariants

Only one full run is queued/running. Run/company/source evidence is append-only or deterministically reconciled. A company becomes terminal only after its prepared source result and any trusted availability effects complete. Position handoff durably creates/reuses separate position work, but that work's pending/completed/failed status never gates company or full-run terminality. Untrusted incompleteness never becomes evidence of posting absence.

## Work levels and coordination

1. **Full run:** owns input snapshots, company set, counts, and aggregate status.
2. **Run-company work:** one durable item per snapshotted active company; owns configuration binding, company result, and terminal status.
3. **Source scan:** the company's one active configured source executes sequential page/request attempts with normalization/filter evidence; inactive configured sources do not participate.
4. **Availability effects:** after a trustworthy complete company result, exact identifiable tracked Gigs are independently audited available/unavailable before company completion.
5. **Position handoff:** each accepted observation deterministically creates/reuses cross-run position and processing outbox work.

## Configuration binding

Run creation snapshots company IDs in stable order, each display name/current immutable configuration ID, resolved title/location profile, and candidate-profile/screening identity. Company jobs read the bound configuration, not the later current pointer. A concurrent start returns the existing active run and its original inputs. Stored batch/concurrency describe the run request; actual workers use process-global values.

## State models

| Full-run state | Entered when | Leaves when |
|---|---|---|
| `queued` | Run and company work are durably created. | Worker startup/claim moves the run to `running`; no companies can complete immediately. |
| `running` | At least one company is still nonterminal. | All run-company rows are terminal. |
| `completed` | No companies, or every company succeeded. | Terminal. |
| `partial` | Terminal aggregation contains a partial company or a mix of success and failure. | Terminal. |
| `failed` | All terminal company work failed with no success/partial. | Terminal. |

| Run-company state | Entered when | Leaves when |
|---|---|---|
| `queued` | Company binding/outbox are created; it remains queued while work executes. | Trusted preparation/effects derive `succeeded`, `partial`, or `failed`. |
| `succeeded` | Every source is `succeeded_with_results` or `succeeded_empty_verified`, and availability reconciliation completes. | Terminal. |
| `partial` | At least one source succeeded/was partial but not all succeeded. | Terminal. |
| `failed` | No source succeeded/was partial, or exhausted company work is projected failed. | Terminal. |

| Source state | Meaning |
|---|---|
| `succeeded_with_results` | Validated listing completed with accepted records. |
| `succeeded_empty_verified` | Verified listing surface proves a genuine empty result. |
| `suspicious_empty` | Empty result lacks sufficient listing evidence. |
| `partial` | Earlier validated positions survive a later bounded failure. |
| `failed` | No usable validated result completed. |

| Attempt validation | Meaning |
|---|---|
| `verified` | Attempt evidence supports its result. |
| `suspicious` | Evidence is insufficient/contradictory for trusted completeness. |
| `failed` | Acquisition/extraction/validation failed. |

Run outbox dispatch is `pending` until deterministic queue-job durability is confirmed, then `dispatched`.

## Completion and aggregation

Company `succeeded` requires its active source to have a `succeeded_` state and availability reconciliation to finish. A usable partial source yields company partial; suspicious/failed with no usable result yields failed. Once accepted observations have durably handed off deterministic position/outbox rows, later position processing is outside company aggregation and may remain pending or fail after the company/run is terminal. A full run remains running while any company is queued. When all terminal: any partial, or success/failure mixture, yields run partial; failures without success/partial yield failed; otherwise completed. `succeededCount` counts only succeeded companies and `failedCount` only failed companies; partial companies appear only through aggregate status. No-company run is completed with zero counts.

## Retry, replay, and reconciliation

Company queue jobs have deterministic IDs, three attempts, and one-second backoff. Startup and one-second sweeps recreate missing/unknown jobs from durable outbox/company state and project exhausted failures. Dispatch waits up to five seconds to verify newly added queue durability before marking outbox dispatched. Prepared persistence uses stable replace/ignore identities, so redelivery does not duplicate attempts, observations, positions, or processing work. Availability writes use deterministic per-run/Gig change IDs; a failure leaves company nonterminal for safe replay.

## Concurrency and ordering

Company outbox reconciliation orders by creation time then ID and processes at most 1,000 per sweep. Worker batch/concurrency are positive process settings (defaults 20/5). Company jobs may run concurrently; within one company, source, term, page, retry, and location enrichment are sequential. No ordering is promised across companies beyond durable creation/selection order.

## External-source trust

Accepted records require normalized identity/title and profile match. HTML verified-empty requires the configured listing surface plus listing nodes or explicit empty-state evidence. Contradictions—reported count without inspectable records, received-but-unnormalizable records, repeated pagination identity, or empty page advertising another page—fail closed. Ordinary HTTP 4xx/abort are not retried; 429/transient failure can retry. Partial/suspicious/failed company evidence never updates Gig availability.

## Durable evidence and observability

History retains run profile/bindings, company/source states, per-attempt counts, reported/received/parsed/evaluable/evaluated totals, page and identity evidence, filter decisions/rejection reasons, diagnostics (`validation`, `extraction`, `network`), failures, observations, first/last seen, and queue projection. UI polling exposes stable historical runs and exact company/source diagnostics. Logs redact authentication-like values and bound large fields; logging failure cannot alter domain outcome.

## Bounds and limits

Start batch size is 1–100; requested concurrency 1–50. Search profile: 25 terms, 25 variant groups × 10 variants, 50 locations. Runtime-policy defaults: 2,000 pages (allowed to 5,000), 10,000 accepted records (allowed to 100,000), 2,500 requests (allowed to 10,000), 6 MB listing, 1 MB detail, 30 minutes/source, 15 seconds/request. Per-page transient policy defaults to two retries/three attempts.
