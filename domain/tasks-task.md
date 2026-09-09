---
type: domain
scope: tasks
summary: Task identity, relationship scope, status dates, categories, and priority semantics.
load_when:
  - reasoning about task state or related objects
  - interpreting task dates and ordering
related:
  - capabilities/tasks.md
  - interfaces/api/tasks.md
---
# Task

## Definition
A Task is one candidate action with its own identity and lifecycle. It can relate to a single opportunity, a person, or the general job search. It is distinct from the next-action field embedded in a Gig.

## Attributes
A task carries stable ID, title, type, status, priority, optional due date/notes, related scope and saved display label, creation/update dates, and optional completion date. Public task records express dates as calendar days, not instants, and do not expose persistence revision metadata.

## Relationships
The related scope is `gig`, `person`, or `general`. A Gig label is its company plus title; a Person label is its name; general label is “General”. Labels reflect the related record when assigned or explicitly reassigned. The task does not acquire a new identity when its relationship changes.

## States
- Status: `open`, `in_progress`, `completed`, `canceled`.
- Priority: `high`, `medium`, `low`.
- Type: `networking_follow_up`, `application`, `interview_prep`, `sourcing`, `resume`, `administrative`, `learning`, `other`.

“Active” means open or in progress. “Overdue” and “due today” are derived timing signals for active tasks, not additional statuses.

## State Transitions
New tasks start open. Completion records the Pacific mutation date. Repeating completed preserves that date; leaving completed clears it. Returning to completed records a new completion date. Updates not explicitly setting status retain both status and completion date.

## Invariants
A completed task has a completion date, and a noncompleted task does not. Relationship scope and ID must agree; related Gig/Person must exist when assigned. Dates/labels are service-owned. The [capability](../capabilities/tasks.md#business-rules) owns validation and timing rules.

## Ordering
Tasks sort by overdue first, then due today, then any other dated tasks, then undated tasks. Within those groups, order is earliest due date, high-to-low priority, then title. Service queries add ID as a final tie-breaker. Completed/canceled dated tasks remain in the other-dated group when included, even if their dates are in the past.

## Related Capabilities
- [Tasks](../capabilities/tasks.md)
- [Opportunities](../capabilities/opportunities.md)
