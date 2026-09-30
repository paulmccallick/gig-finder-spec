---
type: domain
scope: tasks
summary: Task identity, relationship scope, status dates, categories, and priority semantics.
load_when:
  - reasoning about task state or related objects
  - interpreting task dates and ordering
---
# Task

## Definition
A Task is one action the job seeker wants to track, such as contacting a recruiter or preparing interview examples. It has its own status, priority, and optional deadline. It is separate from the next-action reminder on an [opportunity](../capabilities/opportunities.md).

## Attributes
Each task has a stable identifier (ID), title, category, status, priority, optional due date, optional notes, and a choice of related opportunity, contact, or general search. Creation and last-update dates show when it was recorded or changed. A completion date is present only while the task is Completed.

Dates on returned task records are calendar days rather than times of day. The [task interfaces](../interfaces/api/tasks.md) define the field names used by software callers.

## Relationships
The relationship type is `gig` for an opportunity, `person` for a contact, or `general` for the overall search. An opportunity or contact relationship includes that saved record's ID; general search has no related ID.

The display label is the opportunity's company plus role title, the contact's name, or “General”. It captures the name at assignment time and changes only when the relationship is explicitly reassigned. Reassigning a task preserves the task's own ID.

## States
| Concept | Supported values | Meaning |
| --- | --- | --- |
| Status | `open`, `in_progress`, `completed`, `canceled` | Work to do, work underway, work done, or work no longer being pursued. |
| Priority | `high`, `medium`, `low` | Relative importance; new tasks default to medium. |
| Category (`type`) | `networking_follow_up`, `application`, `interview_prep`, `sourcing`, `resume`, `administrative`, `learning`, `other` | The kind of job-search action. |

“Active” means Open or In progress. “Overdue” and “due today” describe an active task's deadline; they are not statuses. Categories classify work and do not perform it automatically.

## State Transitions
New tasks start Open. Any status can be changed directly to any other status. Entering Completed records the change's calendar day in America/Los_Angeles. Keeping Completed preserves its date, including when other fields change. Leaving Completed clears that date; returning to Completed assigns a new one.

## Invariants
A completed task has a completion date, and every other status has none. An opportunity or contact must exist when linked. The application chooses the related label and creation, update, and completion dates; the job seeker chooses the optional due date. The [task business rules](../capabilities/tasks.md#business-rules) define validation and timing behavior.

## Ordering
Tasks sort by overdue first, then due today, then other dated tasks, then undated tasks. Within each group, earlier due dates come first, followed by higher priority and then title. Assistant queries use the task ID to resolve a remaining tie; the board does not add that final comparison.

Completed and canceled tasks with due dates fall in the other-dated group, even when those dates are in the past. An overdue Low-priority task therefore appears before a High-priority task due in the future.

## Related Capabilities
- [Tasks](../capabilities/tasks.md): planning work and recording completion.
- [Opportunities](../capabilities/opportunities.md): the role a task can support.

## Related documents

- [Tasks](../capabilities/tasks.md)
- [Task Interfaces](../interfaces/api/tasks.md)
