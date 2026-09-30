---
type: capability
scope: gig-scout
summary: Current discovery, screening, review, promotion, and reprocessing behavior for official job postings.
load_when:
  - understanding Gig Scout behavior
  - changing discovery or position review rules
related:
  - workflows/gig-scout-discovery.md
  - workflows/gig-scout-review-processing.md
  - domain/gig-scout.md
  - interfaces/gig-scout.md
  - architecture/gig-scout.md
---
# Gig Scout

## Purpose

Discover positions from configured company career sources, screen them against relevance criteria and a candidate profile, and let the user choose which postings become tracked Gigs.

## Actors

- User: starts discovery, reviews positions, changes relevance criteria, and chooses postings to pursue.
- Operator: imports company source configurations and requests controlled reprocessing.
- Official career sources and screening model: supply posting evidence and evaluations.

## Functional Behavior

Scout maintains a company source catalog. Imports create companies or version changed source configurations. Full discovery scans active companies and retains run-specific observations, source diagnostics, and counters. Run history supports company/text filtering and pagination.

Discovered positions enter a separate processing pipeline: establish observation bindings, acquire the official description, screen relevance, and score candidate match. Passing relevance and uncertain rejection results proceed to candidate scoring. Scores are integers from 1 through 10 with a short explanation. A completed discovery run does not imply that its positions have finished processing.

The review workspace defaults to positions needing user review. It supports actionable, processing, needs-review, and deferred views, company/text filters, sorting, and position detail with official posting evidence. The user can pursue, mark irrelevant, or defer a reviewed position. Pursuit creates a Gig or updates a user-selected existing Gig and coordinates its managed job-description document. Possible existing Gigs require a posting-resolution choice; an exact requisition or URL match does not silently promote the position.

Explicit reprocessing selects exact positions, previews eligibility, and reports per-position processing and document outcomes. A legacy run-based backfill remains available. Details are in the [processing workflow](../workflows/gig-scout-review-processing.md).

## Business Rules

- Each imported company has exactly one active official source. Source URLs use HTTPS. Supported source configurations are JSON and HTML; reusable JSON templates are versioned.
- Full-run creation reuses an existing queued/running full run. New request settings do not replace its saved settings.
- Search filtering checks title terms and structured locations/work arrangements. Omitted or empty full-run term/location lists resolve to built-in defaults; they do not mean an unrestricted scan.
- Relevance rejection becomes agent-marked irrelevance only when the model says `fails_relevance` at or above the configured confidence threshold. Candidate score alone does not promote or reject a position.
- Review decisions bind the state revision and exact description, relevance, and candidate-match evaluation IDs. Stale review evidence requires review again.
- Defer requires a valid review timestamp. Due positions resurface when the workspace list is requested.
- Only a completely successful company result updates matching tracked Gigs' posting availability. Partial, suspicious-empty, and failed company results do not mark Gigs unavailable. Matching uses company name and source URL or external job ID.

## State and Lifecycle

See [Scout domain states](../domain/gig-scout.md) for the separate run, source, position, and processing lifecycles. Promoted positions leave the ordinary Scout workspace; discovery history remains available.

## Capability-Specific Nonfunctional Requirements

No independently specified Scout service-level targets were established by the inspected implementation/tests. Current processing bounds and retry policies are [implementation details](../architecture/gig-scout.md), not asserted performance guarantees.

## Related Workflows

- [Import and discovery](../workflows/gig-scout-discovery.md)
- [Processing, review, and reprocessing](../workflows/gig-scout-review-processing.md)

## Related Domain Objects

- [Company configuration, observation, evaluation, and decision](../domain/gig-scout.md)

## Related Interfaces

- [HTTP and operator surfaces](../interfaces/gig-scout.md)

## Related Architecture

- [Sourcing, persistence, queues, and screening](../architecture/gig-scout.md)

## Known Constraints

The workspace API does not accept `irrelevant`, `rejected`, or `promoted` as list filters, even though those states exist. Agent-irrelevant restoration, user-decision reversal, and independent note append are backend endpoints without corresponding current review controls. Promotion retry does have a UI control.

A company import that changes only its display name is treated as unchanged. Import omission does not remove companies. Updating relevance criteria requeues all unlinked positions with descriptions when screening is configured, including user-deferred or user-irrelevant positions; this is broader than explicit backfill's preservation of user workflow.
