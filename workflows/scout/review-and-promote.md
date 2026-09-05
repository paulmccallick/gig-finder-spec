---
id: review-and-promote
capability: gig-scout
feature: review-promotion
title: Review and promote Scout positions
summary: Inspect processed positions, decide relevance/timing, and safely create or update the intended canonical Gig.
aliases: [review position, pursue Scout result, promote posting]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md, ../../foundations/managed-document-integrity.md]
related: [run-scout.md, ../opportunities/browse-opportunities.md, ../documents/read-documents.md]
implementation_areas: [src/core/scout/engine/scout-position-service.ts, src/core/gig-domain-service.ts, src/web/client/ScoutPositionReview.tsx]
test_suites: [src/core/scout/engine/test/scout-position-service.test.ts, src/data/test/scout-run-store.test.ts, src/web/e2e/gig-scout.e2e.ts]
---

# Review and promote Scout positions

## Intent

The candidate wants to decide what to do with a fully processed discovered position and, when pursuing it, bind the exact reviewed evidence to a canonical Gig and job description.

## Access points

Gig Scout Positions ledger and review drawer. The description has a standalone read-only view. No agent-tool or supported root-CLI operation exposes Scout review.

## Preconditions

For `pursue`, `irrelevant`, or `defer`, the position must be exactly `needs_user_review`, have no linked Gig, and the drawer must have four separate current values: positive `expectedStateRevision` plus non-null `descriptionId`, `relevanceEvaluationId`, and `candidateMatchEvaluationId`. The reviewed posting also requires nonblank company/title/canonical URL accepted by JavaScript's `new URL` parser; no HTTP/HTTPS scheme restriction is added. Defer additionally requires a browser `datetime-local` value convertible to an ISO timestamp; the service validates it but does not require a future instant.

## Workflow

1. Browse a paginated state view (`actionable`, `processing`, `needs_user_review`, or `deferred`), filter by company/text, and sort by last seen, match score, company, or title.
2. Open a position. Inspect posting metadata, current description, relevance reason, candidate-match score/reason, and prior decision/promotion state.
3. Optionally add a private decision note (trimmed, 1–2,000 characters when present) and, for deferral, a valid review timestamp.
4. Choose `mark irrelevant`, `defer review`, or `pursue position`.
5. The server validates that every reviewed revision/version still matches current durable state.
6. On pursuit, compare posting identity against existing Gigs. If no ambiguity, create/update the target and its authoritative job description. If candidates exist, keep the drawer open and require `Use this Gig` or `Create separate Gig` using the returned reviewed fingerprint and, for an existing Gig, its expected revision.
7. On success, close the drawer, retain ledger scroll/filter/page context, and background-refresh counts/list.

## Decisions and variants

| Decision/result | Durable outcome |
|---|---|
| irrelevant | State becomes `irrelevant` with a revision-bound decision/note. |
| defer | State becomes `deferred` until the supplied timestamp; the next list operation resurfaces a due value to `needs_user_review`, so a past timestamp may resurface immediately. |
| pursue + create | A new Gig and authoritative managed job description are created. |
| pursue + existing | Exact selected Gig is updated only in posting-owned fields; unrelated pipeline, fit, pay, tags, availability, activity, linked interactions, and other details are preserved. |
| resolution stale | Candidate/fingerprint/revision changed; refreshed choices must be reviewed again. |
| promotion failed | State remains `processing` with failure details and retry can reconcile or finish the same persisted promotion intent. |

## State changes

Each new user decision advances the position revision by one: irrelevant/defer enter their named state and pursue enters `processing`; successful promotion completion enters `promoted` and links the Gig without another revision increment. Stale/invalid release advances revision again and clears the current decision. Decisions retain a client-generated change ID, the four reviewed values, optional note, resolution choice, promotion work, and result. Gig/document change IDs derive from that decision ID; completed-retry identity is deterministic over position, linked Gig, observation, and description. Successful promotion sets the single `sourceUrl` field (shown as Apply) to the required current canonical URL and creates/versions the authoritative job description. Scout result persistence alone never mutates Gig availability.

Exact Scout document provenance is: official URL; offset timestamp retrieved-at; 64-lowercase-hex SHA-256 hashes for source and extracted content; nonblank source key; positive configuration version; nonblank extraction strategy; and nonblank converter version. Source description is nonblank and accompanies provenance.

## Outputs and observable effects

The ledger state/count changes after refresh. Successful promotion reports created/updated. Resolution candidates show company/title/stage/outcome/location/source and stored job-description link when present. Promotion selects the first Gig job description by lexicographic document ID: create version 1 if absent, create no version for identical content, or append a Scout-provenance version otherwise. An identical-content no-op accepts and retains the existing document's source description, source provenance, and upload provenance; exact reviewed provenance is required only for a version created by this promotion. Other job descriptions remain untouched. Scout-created/versioned documents have null upload provenance and are not subject to uploaded-source immutability. Retry may repair an incomplete description or source link without duplicating completed work.

## Safety rules

Company, title, and requisition normalization is exactly trim then locale lowercase; punctuation/internal whitespace are retained and Unicode is not normalized. Canonical URL identity is the exact trimmed string, without URL canonicalization. Candidate detection first requires normalized company equality, then matches any normalized nonblank requisition ID, exact canonical URL, or normalized title. Requisition matches sort before URL before title, with Gigs whose pipeline stage is exactly `closed` last. The fingerprint covers normalized posting company/title/requisition/URL plus candidate IDs, revisions, match reasons, and selected job-description ID/current version. Any candidate requires explicit resolution; title alone never auto-merges and `Create separate Gig` remains available.

For an existing Gig, posting-owned fields are `title` and `sourceUrl` always, plus `externalJobId`, `location`, and `workArrangement` only when Scout supplies a nonblank value. Preserve all other fields. A new Gig starts `identified`/`pending`, status `Promoted from Gig Scout`, Pacific promotion activity date, fit `tbd`, and otherwise empty optional candidate-maintained fields. Do not close the drawer while submission is active.

## Failure, retry, and recovery

HTTP conflict means reviewed state was revised or no longer needs review: reload details and re-decide. Invalid/stale resolution stays in the drawer; stale/invalid resolution releases a begun attempt to `needs_user_review`, clears its current decision, and advances revision. Promotion uses separate durable steps: the Gig can commit before document creation/versioning or Scout completion fails. Empty/over-50,000-character Markdown, invalid new-version provenance, or other document validation marks promotion failed in `processing`; retry repeats the exact intent and continues failing until newly processed/reviewed evidence yields a new decision. If the lexicographically first existing job description has upload provenance and differing content, its immutability makes promotion fail; Scout does not skip it or create a second description, and retry continues to fail while it remains the selected differing document. Identical content succeeds as a no-op even on an uploaded document. Otherwise retry verifies committed posting-owned Gig fields, repairs/verifies the exact document, and completes without duplicating a Gig.

## Current limitations

- Only the four listed position-state views are offered; completed/irrelevant history is not a general ledger view.
- The description may be unavailable when acquisition failed; such positions cannot satisfy the full pursue preconditions until processing/backfill succeeds.
- Separate restore/reverse/note service operations exist but are not exposed by current dashboard controls. Direct restore requires current agent-origin irrelevance; reverse requires a same-position user-origin decision; both require exact current revision and advance it. Reverse leaves linked promotion effects intact. A separate trimmed 1–2,000-character note optionally links a decision and changes no state/revision. The current textarea instead saves a note on the submitted decision.
- The service supports completed-promotion refresh from latest complete official evidence with a deterministic retry identity and no new decision/revision. Current detail hides promoted positions and the UI only offers retry for `failed`, so no supported dashboard route invokes that path.

## Related specifications

- [Run Scout](run-scout.md)
- [Browse opportunities](../opportunities/browse-opportunities.md)
- [Read documents](../documents/read-documents.md)
