---
type: architecture
scope: opportunities
summary: Gig state validation, posting identity snapshots, record persistence, and opportunity board data flow.
load_when:
  - modifying Gig persistence, identity resolution, or board behavior
  - investigating opportunity revision and source authority
related:
  - capabilities/opportunities.md
  - interfaces/api/opportunities.md
  - workflows/opportunities-posting-resolution.md
---
# Opportunity Architecture

## Purpose
Describe the implementation of [Opportunities](../capabilities/opportunities.md), including boundaries with Scout and managed documents.

## Components and Data Flow
[GigDomainService](../../gig-finder/src/core/gig-domain-service.ts) owns business validation, partial updates, queries, availability changes, and posting resolution. [Gig schemas](../../gig-finder/src/core/gigs.ts) define complete entities and mutable field paths. [ChangeExecutor](../../gig-finder/src/core/changes.ts) wraps dry-run/transaction behavior and translates concurrency errors.

[DataStore](../../gig-finder/src/data/store.ts) maps nested domain values to scalar SQLite fields and JSON tags, supplies current/nondeleted reads, audited history, revisions, and creation fingerprints. A read builds a GigRecord from the current Gig, managed-document summaries, and interaction references sorted newest first. Thus source URL and managed documents come from authoritative state, not file existence flags. [Migration 0041](../../gig-finder/src/data/migrations/0041_authoritative_gig_documents.sql) removes legacy description/interview-preparation presence columns.

[HTTP routing](../../gig-finder/src/web/request-handler.ts) returns all Gig records. [React App](../../gig-finder/src/web/client/App.tsx) loads them with people/tasks, gates initial dashboard rendering on all three, then filters/groups using [board domain functions](../../gig-finder/src/web/client/domain/board.ts). Agent data-change notifications refresh those lists. There is no opportunity polling loop. A selected dossier is refreshed from the new list or closed if its Gig disappears.

## Mutation and Concurrency
Ordinary createNew validates a complete entity with unknown availability and rejects duplicates by exact nonnull externalJobId across all companies or normalized company/title pair. It can replay an explicit change ID only when the stored creation fingerprint matches entity type, ID, payload, and an existing record. CLI creation and conversational creation use this path. The lower-level create helper exists for direct complete records and does not perform these duplicate checks.

Partial updates deep-merge validated input into current state, validate lifecycle/compensation, and write using the revision read internally. Ordinary update has no caller-supplied expected revision: it protects the service read-to-write interval, not a user's earlier read. An ordinary equal-value update still writes a revision; it has no document-style content-equality fast path. Availability uses the same persistence mechanism but writes only availability and its timestamp, and skips equal-state changes. Audit/persistence details belong in shared architecture documentation.

## Posting Identity Snapshot
Company/title/requisition matching trims and lowercases; URL matching trims but preserves case-sensitive paths. Candidates require same company and at least one requisition/URL/title match. Ordering prioritizes requisition, then URL, then title evidence, then nonclosed over closed, then ID. The selected job description is the first managed description by ID.

A SHA-256 fingerprint covers normalized incoming identity and the ordered candidate IDs/revisions/match reasons/selected job-description IDs and versions. Any such snapshot change stales a reviewed choice. Explicit acceptance distinguishes a new Gig from an existing candidate; it does not silently pick the strongest match.

Posting creation derives a stable ID from change identity. Mutation fingerprints include normalized posting inputs, selected resolution, and source metadata. Replay returns the recorded target only if posting-owned fields still match; candidate pipeline drift is tolerated. This is separate from managed-document content promotion, which Scout orchestrates after acceptance; the two are not presented as a single Gig-domain transaction.

## Availability and Presentation
[Scout run completion](../../gig-finder/src/core/scout/engine/runs.ts) updates availability only after a successful prepared company result, skips Gigs without URL and external ID, and matches observed exact URL or ID within the same case-insensitive company. The domain mutation preserves pipeline state, including for closed Gigs. Scout owns the evidence and reconciliation conditions.

Board Active/Unavailable/Archive rules are client-specific and differ from default service query stages. Unavailable ordering compares parsed timestamps, placing invalid/missing values last. Dates display in America/Los_Angeles. The dossier's Apply link is the current sourceUrl regardless of availability; click does not mutate state. Its description loader pins the version from the refreshed document summary and discards obsolete load results when the selected location changes.

## Failure Modes and Constraints
A missing managed description remains visibly missing; a failed description read does not erase the Gig. More than one linked job description is legal, so lexical selection determines the dossier and identity-review description. The dashboard has a global data-load failure screen if any initial Gig/people/task request fails. Ordinary queries assemble complete records and filter/page in memory; no scalability guarantee is inferred from this implementation.

## Evidence and Verification Coverage
- [Core service tests](../../gig-finder/src/core/test/services.test.ts): availability independence, ordinary-input exclusion, deterministic posting IDs, candidate ordering, stale/invalid choices, preserved fields, document-version fingerprint invalidation, and replay drift.
- [Read-service tests](../../gig-finder/src/core/test/read-services.test.ts): query defaults, filters, ordering, and pagination.
- [Input contract tests](../../gig-finder/src/core/test/input-contracts.test.ts): shared entity schemas.
- [Board tests](../../gig-finder/src/web/test/client/domain/board.test.ts): view partition, filters, unavailable ordering, Pacific dates, archive grouping.
- [Board end-to-end tests](../../gig-finder/src/web/e2e/gig-board.e2e.ts): dossier, unavailable view, and managed content.
- [Scout end-to-end tests](../../gig-finder/src/web/e2e/gig-scout.e2e.ts): reviewed posting identity and authoritative Apply/document repair.

Test source was inspected; this documentation task does not claim a fresh application test run. No ADR rationale is inferred from code.
