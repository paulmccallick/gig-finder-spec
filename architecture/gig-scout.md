---
type: architecture
scope: gig-scout
summary: How Scout reads company sources, saves search evidence, evaluates positions in background queues, and coordinates tracked opportunities.
load_when:
  - changing Scout implementation or diagnosing queue failures
  - verifying discovery and processing persistence behavior
---
# Gig Scout Architecture

## Purpose

Scout implements the candidate search in two independent background queues within the server process: one reads official listings across active configured companies, and the other obtains descriptions and evaluates positions. This separation lets Run History report source coverage while candidate evaluation continues. Product behavior belongs in the [capability](../capabilities/gig-scout.md) and [workflows](../workflows/gig-scout-discovery.md).

## Components

| Component | Responsibility |
| --- | --- |
| `ScoutRunService` | Starts or reuses full runs, coordinates company results, and updates matching tracked Gigs' availability through the Gig service. |
| `SqliteScoutRunStore` | Saves companies, runs, observations, positions, evaluations, decisions, and reprocessing work in SQLite. |
| `scanCompany` and source adapters | Read configured JSON or HTML sources, normalize postings, apply search filters, and record coverage evidence. An adapter is the reader for a particular source format. |
| `ScoutPositionProcessor` | Runs observation validation, description acquisition, relevance screening, and candidate scoring. |
| `ScoutPositionService` | Checks reviewed evidence, records user decisions, and coordinates Gig creation/update and managed descriptions. |
| Company and position runtimes | Dispatch saved work to separate embedded BunQueue queues and recover interrupted work. |
| Screening model adapter | Calls the configured model and validates its relevance and candidate-score responses. |

The web application constructs these services, loads the candidate profile from configuration, and starts both runtimes. `src/operations` owns BunQueue dispatch, workers, and process lifecycle. Scout core defines queue-independent services and ports; its [boundary test](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/test/boundary.test.ts) rejects a BunQueue dependency. The [interface document](../interfaces/gig-scout.md) describes the web and operator boundaries.

## Source Configuration and Templates

Reusable JSON template definitions are tracked, versioned artifacts under `config/scout/templates/`, loaded by the [operations catalog](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/operations/scout-template-catalog.ts). The [template resolver](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/sourcing/adapters/templates/definitions.ts) validates the selected template version, variables, and permitted overrides. Private company selections and source settings enter through [configuration import](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/company-import.ts) and are versioned in the application database. Runs snapshot those configurations so later edits do not replace the inputs of an existing run. Source-contract limits and import validation belong to the [interface document](../interfaces/gig-scout.md#company-import-and-source-contract).

## Processing Model

Full-run creation is transactional and allows only one queued/running full run. It snapshots every company whose active flag is set, that company's current configuration and display name, the resolved search profile, and candidate-profile context when screening is configured. Configuration imports fingerprint active/source settings; the company name is excluded, which explains why a name-only import is unchanged.

Company jobs read each active source through the JSON or HTML adapter. JSON templates supply versioned request, extraction, pagination, and description settings; provider-specific session hooks support sources such as ADP and Avature. Matching normalizes Unicode and whitespace, compares title token sequences, and uses structured locations and work arrangements. Full-run profile resolution supplies built-in filters for empty lists; it does not derive them from the candidate profile.

Position processing has four stored stages: `reconcile_gig`, `acquire_description`, `screen_relevance`, and `score_candidate_match`. Despite its name, `reconcile_gig` validates the observation and schedules description retrieval; it does not find and attach a Gig. Relevance evaluation receives criteria and posting evidence. Candidate scoring receives the saved candidate profile and rubric in addition to posting evidence.

## Data Flow

```text
Company configurations + search filters
  → full run with saved active-company settings
  → company queue → source readers → accepted observations
  → position queue → description → relevance → candidate score
  → user review → Gig service + managed-document service
  → completed promotion
```

Position IDs hash company, source key, and external-ID-or-URL identity. Observations keep their original run/source links. Description Markdown is stored as a filesystem artifact with database identity and retrieval/conversion history. Processing inputs retain identifiers and content hashes so completed evaluations can be reused and obsolete work can be superseded.

Explicit backfill snapshots latest observations, current active source configurations, candidate profile, and model identity. A fingerprint of normalized position IDs, reason, observation IDs, and configuration IDs lets identical requests reuse one execution. Stage identities include the backfill scope so the pipeline can run again. This path preserves user decisions. Updating relevance criteria instead requeues all unlinked described positions and sets them to processing when screening is configured.

## Guarantees

Each company job is saved with an outbox record: a database record saying work still needs delivery to a queue. Stable queue identifiers and persisted status support retries without depending on one successful dispatch. Completed or nonpending stages become no-ops when delivered again.

Discovery first saves observations while company work remains unfinished. The run service then applies availability changes through the Gig service and completes the company result. These Gig mutations are not part of one shared transaction. Stable change identities and terminal-state checks support retries.

Promotion saves the exact reviewed observation, description, and resolution intent before creating/updating the Gig. It then uses `ManagedDocumentService` to save the description, checks ownership/content/source history and replayed versions, and only then marks promotion complete. A failure can leave a committed Gig or document before that final marker. Retry uses the saved intent and change identities to reconcile existing results. Completed-promotion retry reconstructs current evidence, requires a linked nonclosed Gig, and verifies posting-owned fields on replay.

Refreshing a promoted description also goes through the managed-document service and records whether the linked document update completed. Scout storage does not directly mutate managed-document tables or tracked Gig availability.

## Failure Modes

Both queues use durable BunQueue jobs with three attempts and a 1,000 ms backoff. Their runtimes retry failed bootstrap and reconcile dispatch every second after startup.

Company dispatch checks up to 1,000 nonterminal saved jobs against stable queue IDs `scout:<runCompanyId>`. Missing or unknown jobs are re-enqueued; exhausted jobs become `worker_retry_exhausted`. Newly added company jobs have a visibility wait of up to five seconds before dispatch is marked. Position dispatch uses `position:<processingId>` and finds pending stages independently of the outbox's dispatch marker; it has no equivalent visibility wait. It selects pending work in observation/description/relevance/score order.

Workers disable embedded locks and use the queue's worker mechanism; the company runtime also exposes heartbeat and stall options. Exhausted position failures mark the stage failed and bound diagnostic text lengths. Explicit-backfill description requests returning 404/410 produce unavailable outcomes. A failed stage can leave the position processing, while the originating company search has already finished.

Partial source coverage and suspicious emptiness cannot trigger availability reconciliation. Invalid model output fails processing rather than creating a relevance decision. New overlapping backfill requests supersede earlier unfinished work for the same positions.

## Scaling Characteristics

The bounded HTTP adapter enforces declared and received response-byte limits while streaming, aborts timed-out requests, and rejects redirects by default. Current per-source policy defaults are 2,000 pages, 10,000 records, 2,500 requests, 6,000,000 listing bytes, 1,000,000 detail bytes, two source retries, and 1,800,000 milliseconds. These are configurable execution bounds, not performance commitments.

Company and position queues progress independently. Their separation means discovery counts cannot be used as a count of review-ready positions. Stored relevance confidence is rounded to thousandths.

## Constraints

The implementation relies on configured official sources and their validation rules; it cannot establish complete coverage when a source fails or returns a partial result. Coordinated Gig/document changes are recoverable operations across service boundaries, not a single atomic write. No latency, throughput, or availability target is inferred from the current constants.

## Used By

- [Gig Scout](../capabilities/gig-scout.md)
- [Search configured companies](../workflows/gig-scout-discovery.md)
- [Evaluate, review, and pursue positions](../workflows/gig-scout-review-processing.md)
- [Resolve a posting into a Gig](../workflows/opportunities-posting-resolution.md)

## Related Requirements

- [Reliability and recovery constraints](../requirements/reliability.md)
- [Application security boundary](../requirements/security.md)

## Reading the Earlier Decisions

[ADR 0014](../decisions/0014-separate-scout-discovery-from-position-processing.md) records the initial split and describes later description/review stages as future work. Those stages now exist. The current `reconcile_gig` stage validates observation bindings and schedules description retrieval; it does not automatically link a Gig. [ADR 0010](../decisions/0010-use-bunqueue-for-background-work.md) describes the original queue design; current discovery availability changes and promotion span the separate save boundaries documented above. [ADR 0012](../decisions/0012-use-templates-for-reusable-json-sources.md) uses the historical phrase “stored as a configuration”; the current catalog/private-company split is described in [Source Configuration and Templates](#source-configuration-and-templates).

## Related ADRs

- [ADR 0010: Use BunQueue for durable background work](../decisions/0010-use-bunqueue-for-background-work.md)
- [ADR 0011: Structure Scout as a core capability with uniform adapters](../decisions/0011-use-uniform-source-adapters-for-scout.md)
- [ADR 0012: Use templates for reusable JSON sources](../decisions/0012-use-templates-for-reusable-json-sources.md)
- [ADR 0014: Separate Scout discovery from position processing](../decisions/0014-separate-scout-discovery-from-position-processing.md)
- [ADR 0015: Keep business logic out of operations](../decisions/0015-keep-business-logic-out-of-operations.md)
- [ADR 0016: Mutate domain-owned tables through the owning domain service](../decisions/0016-own-domain-table-mutations.md)
- [ADR 0017: Own Gig posting identity resolution in the Gig domain](../decisions/0017-own-gig-posting-identity-resolution.md)

## Source Evidence and Verification Anchors

- [Composition](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/local-application.ts), [web runtime composition](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/app.ts)
- [Run coordination](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/runs.ts), [SQLite Scout repository](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/scout-run-store.ts), [schema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/schema.ts)
- [Company import](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/company-import.ts), [scan engine](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/scan-company.ts), [adapter registry](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/sourcing/adapters/registry.ts), [matching](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/sourcing/matching.ts)
- [Policy/source contracts](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/sourcing/contracts.ts), [HTTP port](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/sourcing/ports.ts), [detail acquisition](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/sourcing/detail-descriptions.ts), [template catalog](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/operations/scout-template-catalog.ts)
- [Company runtime](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/operations/scout-runtime.ts), [position runtime](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/operations/scout-position-runtime.ts), [processor](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/screening.ts), [model adapter](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/scout-position-screening.ts)
- [Promotion service](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/scout-position-service.ts)
- [Repository tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/test/scout-run-store.test.ts): singleton/snapshots, replay, exact reviewed intent, explicit selection eligibility/idempotency, complete pipeline, immutable screening snapshot, and document crash reconciliation.
- [Run-service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/test/runs.test.ts), [promotion-service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/test/scout-position-service.test.ts), [screening tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/test/screening.test.ts), [runtime integration tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/operations/test/scout-runtime.integration.test.ts)

## Related documents

- [Gig Scout](../capabilities/gig-scout.md)
- [Gig Scout Interfaces](../interfaces/gig-scout.md)
- [Search Configured Companies for Relevant Positions](../workflows/gig-scout-discovery.md)
- [Evaluate Positions, Review Results, and Pursue Opportunities](../workflows/gig-scout-review-processing.md)
