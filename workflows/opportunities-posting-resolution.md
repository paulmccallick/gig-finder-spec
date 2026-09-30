---
type: workflow
scope: opportunities
summary: Review candidate Gigs before accepting a Scout posting as a new or existing opportunity.
load_when:
  - changing posting identity resolution or promotion handoff
  - diagnosing stale choices or duplicate opportunities
related:
  - capabilities/opportunities.md
  - domain/opportunities-gig.md
  - interfaces/api/opportunities.md
  - architecture/opportunities.md
---
# Resolve an Incoming Posting

## Purpose
Accept an incoming official posting without silently conflating opportunities or overwriting candidate-managed pipeline information.

## Actors
Candidate, Scout promotion flow, and Gig domain service.

## Trigger
The [Scout promotion flow](gig-scout-review-processing.md) hands a normalized posting to opportunity acceptance.

## Preconditions
Posting company, title, and a valid canonical URL exist. Creating a posting-based Gig requires an explicit change identity. Optional input includes external requisition ID, location, work arrangement, and description/source evidence.

## Inputs
Normalized posting; optionally a reviewed fingerprint and either create-new choice or an existing Gig ID with expected revision.

## Normal Flow
1. Find Gigs in the same normalized company matching requisition ID, exact trimmed canonical URL, or normalized title. Include closed candidates.
2. If none match and no prior choice needs review, create a new Gig. If any match, return candidates and a fingerprint without mutation, even for an exact requisition match.
3. The user reviews candidate identity and pipeline details and explicitly chooses a separate new Gig or one existing candidate.
4. Recompute the candidate snapshot. Reject a stale fingerprint or existing-Gig revision; reject a chosen Gig outside the candidate set.
5. Create the new Gig or update the selected existing Gig's posting-owned fields: title and source URL, plus nonblank supplied external ID, location, and work arrangement.
6. Return the created/updated Gig to Scout, which owns managed-description promotion and subsequent processing.

## Alternate Flows
A confirmed separate opportunity can reuse company/title or requisition identity; this route intentionally differs from ordinary duplicate-rejecting creation. A new posting-derived Gig starts identified/pending, unknown availability, TBD fit, no next action/pay range, empty tags, and status “Promoted from Gig Scout”; last activity is the change date in Pacific time.

An existing-Gig update preserves company, stage/outcome, status, last activity, next action, fit, compensation, tags, availability, other role details, and related records. Blank/missing optional posting fields preserve stored values rather than clearing them.

## Failure Behavior
Stale review returns a refreshed candidate list/fingerprint for renewed review. Invalid selection returns no mutation. Job-description version changes can stale a choice even when the Gig revision is unchanged. A replay with the same recorded posting/change fingerprint can return the accepted result if posting-owned fields still match; later candidate-owned pipeline edits are allowed, but posting-field drift rejects replay.

## Completion / Postconditions
The result identifies a created or updated Gig, or explicitly requests fresh identity resolution. Acceptance alone does not create/update managed job-description content or mark availability available; those are separate operations in the Scout flow.

## Nonfunctional Requirements
Reviewed choice must match current candidate state. Implementation details and replay limitations are in [architecture](../architecture/opportunities.md).

## Related Documentation
- [Opportunity behavior](../capabilities/opportunities.md)
- [Domain concepts](../domain/opportunities-gig.md)
- [Interface contract](../interfaces/api/opportunities.md)
