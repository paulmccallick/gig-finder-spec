---
type: workflow
scope: opportunities
summary: Review possible existing roles before accepting a Scout posting, preserving application progress and notes.
load_when:
  - changing posting identity resolution or promotion handoff
  - diagnosing stale choices or duplicate opportunities
---
# Review a Posting Before Adding or Updating a Gig

## Purpose
Help the candidate decide whether a discovered posting belongs to a role they already track. Updating a matching Gig keeps its application progress and notes; choosing a separate role keeps two opportunities distinct.

## Actors
The candidate, [Gig Scout](../capabilities/gig-scout.md), and the opportunity service that saves Gigs.

## Trigger
The [Scout review and promotion workflow](gig-scout-review-processing.md) submits a posting for acceptance into the candidate's tracked opportunities.

## Preconditions
The posting has a company, title, and valid posting URL. Creating a new Gig from it also requires a unique change ID, which identifies the save operation and allows a repeated request to be recognized.

## Inputs
The posting can include an employer requisition ID, location, working arrangement, and source description. After review, the input also includes the candidate's choice and a **review fingerprint**: a value identifying the incoming posting and matching records as they appeared at review time. Choosing an existing Gig includes its saved revision, a number that changes when that record is updated.

## Normal Flow
1. Find tracked Gigs at the same company with a matching requisition ID, posting URL, or title. Closed Gigs are included.
2. If there are no matches and no earlier reviewed choice, create a new Gig. Otherwise, return the matches for review without changing them—even when the requisition ID matches exactly.
3. The candidate reviews the roles and their recorded progress, then chooses a separate new Gig or one of the existing matches.
4. Check that the reviewed matches and selected Gig revision are still current. If they have changed, request another review.
5. Create the new Gig or update the selected Gig's title and posting URL. Update requisition ID, location, and working arrangement only when the posting supplies nonblank values.
6. Return the saved Gig to Scout, which handles saving the job description and continuing promotion.

## Alternate Flows
Choosing a separate opportunity explicitly allows the new Gig to share a company/title or requisition identity with an existing one. Ordinary Gig creation would reject such duplicates.

A new Gig starts at Identified with outcome Pending, availability Unknown, fit TBD, and status “Promoted from Gig Scout.” Its last-activity date is the save date in Pacific time. It starts without a next action or pay range and with an empty tag list.

Updating an existing Gig preserves company, stage, outcome, status, last activity, next action, fit, compensation, tags, availability, other role details, and related records. Missing or blank optional posting values do not erase saved information.

## Failure Behavior
If the review fingerprint or selected revision is stale, return the current matches for another review without accepting the choice. Selecting a Gig outside the matching set is invalid and makes no change. Updating the selected job description can invalidate a review even when the Gig itself has not changed.

A repeated request can return its earlier accepted result when its change ID, posting data, and reviewed choice match the recorded operation. The posting fields on the Gig must still agree with that request. Later edits to application progress do not by themselves prevent this replay. The [implementation](../architecture/opportunities.md#posting-review-and-repeated-requests) explains the checks.

## Completion / Postconditions
Successful acceptance returns a newly created or updated Gig. Other results request a fresh review or reject an invalid choice. Acceptance alone does not save job-description content or mark the posting available; Scout performs those operations separately.

## Nonfunctional Requirements
A reviewed choice must still match the current records when accepted. There is no documented numeric time or throughput target for this workflow.

## Related Documentation
- [Opportunity behavior](../capabilities/opportunities.md)
- [Gig concepts](../domain/opportunities-gig.md)
- [Posting-acceptance contract](../interfaces/api/opportunities.md#internal-posting-and-availability-ports)
- [Implementation and repeat-request handling](../architecture/opportunities.md)

## Related documents

- [Opportunities](../capabilities/opportunities.md)
- [Gig](../domain/opportunities-gig.md)
- [Opportunity Interfaces](../interfaces/api/opportunities.md)
- [Opportunity Architecture](../architecture/opportunities.md)
