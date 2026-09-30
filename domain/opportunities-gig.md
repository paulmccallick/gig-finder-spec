---
type: domain
scope: opportunities
summary: Define a tracked role, its application progress, fit assessment, next action, and posting availability.
load_when:
  - reasoning about opportunity state or posting identity
  - interpreting stage, outcome, fit, or availability
---
# Gig

## Definition
A **Gig** is a role the candidate has chosen to track in their job search. It holds the candidate's progress and assessment over time, from identifying the role to recording an outcome. A Scout posting is a discovered listing; accepting it can create a Gig or update an existing one after review.

## Attributes
| Information | Meaning |
| --- | --- |
| Identity | A stable Gig ID, company, title, optional employer job/requisition ID, and saved posting URL. |
| Progress | Application stage, outcome, current status summary, and last-activity date. |
| Next action | What the candidate should do next, with an optional due date. |
| Fit | A recorded rating and optional explanation of how well the role suits the candidate. |
| Compensation | Optional USD hourly or annual range and notes, plus optional bonus, equity, and other compensation details. |
| Role details | Optional location, working arrangement, posted date, team, recruiter source, and tags. |
| Availability | Whether Scout has observed the posting as available or unavailable, or has not established either; includes the time this state last changed. |

Availability describes the posting, while stage and outcome describe the candidate's search. An unavailable posting can still have an interview in progress and a next action.

## Relationships
A Gig can have linked [people](networking.md), [tasks](tasks-task.md), [interactions](interactions.md), and [managed documents](documents-profile.md). A managed document is content saved and versioned by the application, such as a job description. The Gig refers to that document; the description is not a text field on the Gig itself.

The [opportunity interface](../interfaces/api/opportunities.md) describes record revisions used to detect changes. A Gig revision and a document version track different records and can change independently.

## States
| Dimension | Supported values |
| --- | --- |
| Stage | Identified, Applied, Recruiter Contact, Screening, Technical Interview, Final Round, Offer, Monitoring, Closed. |
| Outcome | Pending, Accepted, Rejected, Withdrawn, Not Pursuing, Role Pulled, No Response, Position Filled, On Hold, Stale / Unverified. |
| Fit | Strong, Good, Stretch, Long Shot, Weak, Poor, Support, TBD, N/A. |
| Availability | Unknown, Available, Unavailable. |

The [interface contract](../interfaces/api/opportunities.md) links to the exact machine-readable values. The application accepts these fit labels without defining a scoring rubric for each one.

## State Transitions
Stages can be changed directly without passing through earlier steps. Closing requires a non-Pending outcome and removal of the next action; reopening requires Pending. Outcomes such as On Hold still require Closed in the current model.

Availability can change between Available and Unavailable independently of stage. The observation operation does not reset it to Unknown.

## Invariants
[Opportunity business rules](../capabilities/opportunities.md#business-rules) govern valid records. A possible match on company and requisition ID, posting URL, or title does not establish that two postings are the same opportunity. Several Gigs, including closed ones, can be candidates for review.

## Related Capabilities
- [Opportunities](../capabilities/opportunities.md)

## Related Workflows
- [Review a posting before adding or updating a Gig](../workflows/opportunities-posting-resolution.md)

## Related documents

- [Opportunities](../capabilities/opportunities.md)
- [Review a Posting Before Adding or Updating a Gig](../workflows/opportunities-posting-resolution.md)
- [Documents and Candidate Context](documents-profile.md)
