---
id: review-promotion
capability: gig-scout
title: Position review and promotion
summary: Bind exact reviewed evidence to a decision and safely create or refresh one canonical Gig and job description.
aliases: [review position, pursue, promote posting]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md, ../../foundations/managed-document-integrity.md]
workflows: [../../workflows/scout/review-and-promote.md]
operational_models: [../../operational-models/scout/review-promotion.md]
quality_scenarios: [../../quality-scenarios/scout/stale-review.md, ../../quality-scenarios/scout/promotion-partial-recovery.md]
variants: []
contracts: []
implementation_areas: [src/core/scout/engine/scout-position-service.ts, src/core/gig-domain-service.ts, src/data/scout-run-store.ts, src/web/client/ScoutPositionReview.tsx]
test_suites: [src/core/scout/engine/test/scout-position-service.test.ts, src/data/test/scout-run-store.test.ts, src/web/test, src/web/e2e/gig-scout.e2e.ts]
---

# Position review and promotion

## Purpose and boundary

This feature presents current processed positions for human decision, preserves exact evidence/revision binding, resolves likely existing Gigs explicitly, and coordinates promotion across position, Gig, and managed-document state. It does not auto-pursue based on model scores.

## Access points

The Gig Scout Positions ledger/detail UI supports pursue, irrelevant, defer, and retry of failed promotion. It filters cross-run state/company/text, sorts/paginates, and retains view context on refresh. Separate restore/reverse/note service operations exist but have no current UI controls. No supported agent/root-CLI operation reviews positions.

## Configuration and defaults

Default workspace view is `needs_user_review`; actionable comprises processing/review/deferred. Decisions require current state revision and exact description, relevance, and match evaluation IDs. Defer accepts any valid timestamp, including past. Notes are trimmed 1–2,000 characters when present.

## Durable state and lifecycle

User irrelevant/defer records a revision-bound decision; due defer resurfaces on the next listing as a system restore and advances revision. Pursue persists exact intent and enters processing before promotion side effects. Candidate resolution matches same host-locale-lowercased trimmed company plus similarly normalized requisition or title, or exact trimmed canonical URL; any candidate requires explicit use-existing/create-separate. Candidates order by requisition match, URL match, title match, non-closed before closed, then locale-compared Gig ID. Success links the Gig, completes promotion, and projects promoted.

## Validation and invariants

Only exactly `needs_user_review`, unlinked positions accept the primary review submissions `pursue`, `irrelevant`, or `defer`. Restore/reverse use their separately specified eligibility outside that state. Four current review values must match for primary submissions. Resolution fingerprint covers normalized posting identity plus ordered candidate IDs/revisions/reasons and selected job-description version. Existing-Gig promotion changes only title/source URL and supplied nonblank requisition/location/work arrangement; all candidate-managed fields and availability are preserved. A created or versioned job description must exactly match reviewed content/source/provenance. If the selected existing document already has byte-identical content, promotion accepts it as a no-op without validating or changing its prior source description or provenance.

## Outputs and downstream effects

Resolution can require candidates or report stale/invalid choice. Success reports created/updated, changes counts/workspace membership, and creates/updates exactly the lexicographically first Gig job description (or creates one if absent). Identical content is a document no-op that preserves existing metadata/provenance. For created/versioned effects, promotion provenance binds official URL, retrieval instant, hashes, source/configuration/extraction/converter identities.

## Failure, retry, and recovery

Stale review conflicts before decision. Stale/invalid resolution releases a begun attempt back to review. Generic failure retains failed promotion on a processing position. Gig, document, and position completion are separate durable steps: retry verifies/reconciles already-committed work with deterministic identities and does not duplicate it.

## Current limitations

Only four active workspace state views are exposed. An uploaded immutable first job description with differing content causes durable promotion failure; Scout neither skips it nor creates a second document. If that uploaded document has identical content, the no-op succeeds and retains upload provenance. A >50,000-character processed description cannot be promoted. The current dashboard exposes retry only for failed pending promotion; the service can also refresh a completed promotion from newer complete official evidence, but linked/promoted positions are excluded from current detail/UI and therefore have no supported trigger for that completed retry.

## Detailed specifications

- [Review and promote positions](../../workflows/scout/review-and-promote.md)
- [Promotion operational model](../../operational-models/scout/review-promotion.md)
- [Position processing](position-processing.md)
