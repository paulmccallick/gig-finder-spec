---
type: domain
scope: opportunities
summary: Gig attributes, related objects, and independent pipeline and availability state.
load_when:
  - reasoning about opportunity state or posting identity
  - interpreting stage, outcome, fit, or availability
related:
  - capabilities/opportunities.md
  - workflows/opportunities-posting-resolution.md
  - domain/documents-profile.md
---
# Gig

## Definition
A Gig is a durable opportunity in the candidate's search. A Scout posting is observed source material that can become a new Gig or refresh an existing one after identity review.

## Attributes
Identity includes durable ID, company, title, optional external job/requisition ID, and captured canonical source URL. Search management includes stage/outcome, status narrative, last-activity date, next action, fit assessment, tags, and optional compensation. Role details can include location, work arrangement, posted date, team, recruiter source, bonus, equity, and other compensation.

Availability and its state-change timestamp describe observed posting availability. They do not describe the candidate's decision or pipeline progress. A revision identifies the current saved record; it is separate from managed-document version.

## Relationships
A Gig can have managed documents, links to canonical People, associated Tasks, and Interactions. Its record includes document summaries and interaction references. Linked job-description content belongs to the [document domain](documents-profile.md), not a body field or file-presence flag on the Gig.

## States
- Stages: `identified`, `applied`, `recruiter_contact`, `screening`, `technical_interview`, `final_round`, `offer`, `monitoring`, `closed`.
- Outcomes: `pending`, `accepted`, `rejected`, `withdrawn`, `not_pursuing`, `role_pulled`, `no_response`, `position_filled`, `on_hold`, `stale_or_unverified`.
- Fit ratings: `strong`, `good`, `stretch`, `long_shot`, `weak`, `poor`, `support`, `tbd`, `not_applicable`.
- Availability: `unknown`, `available`, `unavailable`.

## State Transitions
Stage changes are not constrained to adjacent steps. Closing requires a terminal/nonpending outcome and removal of next action; reopening requires pending outcome. Availability can change independently between available and unavailable after an initially unknown state. The dedicated observation mutation does not reset availability to unknown.

## Invariants
Lifecycle, compensation, and partial-update rules are defined in [Opportunities](../capabilities/opportunities.md#business-rules). A potential identity match is not itself authorization to merge postings. Company-scoped requisition, URL, and title evidence can yield several candidates, including closed Gigs.

## Related Capabilities
- [Opportunities](../capabilities/opportunities.md)

## Related Workflows
- [Resolve an incoming posting](../workflows/opportunities-posting-resolution.md)
