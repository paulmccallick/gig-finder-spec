---
type: architecture
scope: gig-scout
summary: Scout implementation boundaries, immutable work bindings, queue recovery, source adapters, and promotion coordination.
load_when:
  - changing Scout implementation or diagnosing queue failures
  - verifying discovery and processing persistence behavior
related:
  - capabilities/gig-scout.md
  - interfaces/gig-scout.md
  - workflows/gig-scout-discovery.md
  - workflows/gig-scout-review-processing.md
---
# Gig Scout Architecture

## Purpose and Components

Scout separates company discovery from position processing. `ScoutRunService` coordinates scan persistence and Gig availability. `SqliteScoutRunStore` implements run, position, screening, backfill, and posting-review repository ports. `ScoutPositionService` coordinates user decisions and promotion through the Gig and managed-document domain services. `ScoutPositionProcessor` executes description and model stages. The web application constructs these services and two independent embedded queue runtimes.

```text
Web / import API → company catalog and run service → company outbox
    → gig-scout-companies queue → source adapters → observations + position outbox
    → gig-scout-positions queue → description → relevance → candidate scoring
    → user review → Gig service + managed-document service → promotion completion
```

## Source Adapters and Data Flow

`scanCompany` validates the request, scans each active source, and applies the configured display company name to normalized results. The adapter registry selects JSON or HTML; JSON templates resolve versioned extraction, request, pagination, and detail-description definitions from the checked-in catalog. Specialized session request hooks exist for providers such as ADP and Avature. Source attempts preserve pagination/record validation, filter decisions, and diagnostics.

Matching normalizes Unicode and whitespace, performs token-sequence title matching, and uses structured locations/work arrangements. Variants apply only to configured title terms. Default profile resolution substitutes built-in terms/locations for empty lists.

The bounded HTTP implementation streams responses while enforcing declared and received byte limits, aborts timed-out requests, and defaults to redirect errors. Current runtime-policy defaults are 2,000 pages, 10,000 records, 2,500 requests, 6,000,000 listing bytes, 1,000,000 detail bytes, two source retries, and 1,800,000 milliseconds per source. These are configurable implementation limits, not throughput or latency commitments.

## Persistence and Processing Identity

Company import fingerprints canonicalized active/source configuration content; names are excluded. Changed imports append configuration versions. Full-run creation is transactional and singleton-guarded for active full runs. Run-company work captures company name and configuration, and outbox records are created with run work. The run stores its resolved search profile and candidate-profile snapshot/cache key when available.

Position IDs hash company, source key, and external-ID-or-URL identity. Observations remain linked to the originating source/run. Description Markdown is stored as a filesystem artifact with database identity and provenance records. Description acquisition and model evaluation inputs retain IDs/hashes so processing can reuse completed work or supersede obsolete work. `reconcile_gig` currently validates observation and schedules description acquisition; it does not resolve or auto-link Gigs.

Explicit backfill captures latest observations/current active configurations and snapshots candidate profile and model identity. A request fingerprint covers normalized IDs, reason, observation IDs, and configuration IDs; repeated identical selections reuse the durable run. Stage input identities include backfill scope to rerun the pipeline. User-owned workflow preservation is specific to this explicit-backfill path. Updating relevance criteria instead requeues all unlinked described positions and changes their state to processing when screening is configured.

## Queue Processing and Recovery

`gig-scout-companies` and `gig-scout-positions` use embedded BunQueue with durable jobs, three attempts, and 1,000 ms backoff. Workers start after initial dispatch reconciliation. Both runtimes retry bootstrap after failure and dispatch every second thereafter. These timers are implementation choices.

Company dispatch reads up to 1,000 nonterminal persisted jobs, checks stable queue IDs `scout:<runCompanyId>`, re-enqueues missing/unknown jobs, and records exhausted failed jobs as `worker_retry_exhausted`. It waits up to five seconds for newly added jobs to be visible before marking dispatch. Position dispatch similarly uses `position:<processingId>` and reads pending work independent of the outbox dispatched flag; it has no matching queue-visibility wait loop. Pending stages are selected in reconcile/description/relevance/score order.

Workers disable embedded locks and use the queue's worker mechanism; company runtime exposes heartbeat/stall options. Exhausted position failures mark the stage failed and bound diagnostic lengths. Explicit-backfill description 404/410 failures become unavailable outcomes. Superseded work is a persisted status, and stage reads make completed/nonpending processing a no-op.

## Transaction Boundaries and Guarantees

Discovery persistence first prepares observations/results while company work stays nonterminal, then `ScoutRunService` applies availability changes via the Gig service, then completes the company/run result. Retried terminal delivery is handled by persisted state and stable change identities. This coordination is not a single transaction across all Gig mutations.

Promotion saves exact reviewed observation/description and resolution intent before invoking the Gig service. It then creates or updates the Gig's managed job description through `ManagedDocumentService`, verifies document ownership/content/provenance and replayed versions, and only then records promotion completion. Partial success can leave a Gig/document committed before the promotion is complete. Retry reconciles durable intent and change IDs. A completed-promotion retry reconstructs current complete evidence, uses the linked nonclosed Gig, and verifies replayed posting-owned fields.

Promoted-description backfill similarly uses the managed-document service and persists document projection status. Scout persistence does not directly mutate managed-document tables or tracked Gig availability; these boundaries have focused regression tests.

## Failure Modes and Constraints

Source partial coverage and suspicious emptiness remain explicit source/company outcomes; they cannot trigger availability reconciliation. Queue infrastructure exhaustion and malformed model output fail processing, rather than producing a relevance decision. Relevance confidence is quantized to thousandths in persistence. A failed stage can leave a position in processing; run completion and review readiness are independent.

No architectural rationale or service-level targets are inferred from these mechanisms. Historical decision documents are not required to understand current operation.

## Used By

[Gig Scout](../capabilities/gig-scout.md), [discovery](../workflows/gig-scout-discovery.md), and [processing/review](../workflows/gig-scout-review-processing.md). Posting-resolution details belong to [the opportunity workflow](../workflows/opportunities-posting-resolution.md).

## Source Evidence and Verification Anchors

- [Composition](../../gig-finder/src/data/local-application.ts), [web runtime composition](../../gig-finder/src/web/app.ts)
- [Run coordination](../../gig-finder/src/core/scout/engine/runs.ts), [SQLite Scout repository](../../gig-finder/src/data/scout-run-store.ts), [schema](../../gig-finder/src/data/schema.ts)
- [Company import](../../gig-finder/src/core/scout/engine/company-import.ts), [scan engine](../../gig-finder/src/core/scout/engine/scan-company.ts), [adapter registry](../../gig-finder/src/core/scout/sourcing/adapters/registry.ts), [matching](../../gig-finder/src/core/scout/sourcing/matching.ts)
- [Policy/source contracts](../../gig-finder/src/core/scout/sourcing/contracts.ts), [HTTP port](../../gig-finder/src/core/scout/sourcing/ports.ts), [detail acquisition](../../gig-finder/src/core/scout/sourcing/detail-descriptions.ts), [template catalog](../../gig-finder/src/operations/scout-template-catalog.ts)
- [Company runtime](../../gig-finder/src/operations/scout-runtime.ts), [position runtime](../../gig-finder/src/operations/scout-position-runtime.ts), [processor](../../gig-finder/src/core/scout/engine/screening.ts), [model adapter](../../gig-finder/src/agent/scout-position-screening.ts)
- [Promotion service](../../gig-finder/src/core/scout/engine/scout-position-service.ts)
- [Repository tests](../../gig-finder/src/data/test/scout-run-store.test.ts): singleton/snapshots, replay, exact reviewed intent, explicit selection eligibility/idempotency, complete pipeline, immutable screening snapshot, and document crash reconciliation.
- [Run-service tests](../../gig-finder/src/core/scout/engine/test/runs.test.ts), [promotion-service tests](../../gig-finder/src/core/scout/engine/test/scout-position-service.test.ts), [screening tests](../../gig-finder/src/core/scout/engine/test/screening.test.ts), [runtime integration tests](../../gig-finder/src/operations/test/scout-runtime.integration.test.ts)
