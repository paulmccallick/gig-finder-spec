---
type: capability
scope: tasks
summary: Task creation, editing, completion, related records, prioritization, and read-only task board behavior.
load_when:
  - understanding task behavior and completion dates
  - changing task defaults, relationships, or board features
related:
  - domain/tasks-task.md
  - interfaces/api/tasks.md
  - architecture/tasks.md
---
# Tasks

## Purpose
Track candidate actions for a Gig, a Person, or the general job search, with priority, deadlines, status, and completion history.

## Actors
The candidate viewing the board, conversational agent using task tools, and CLI user.

## Functional Behavior
Users can create, discover, read, and update tasks, including completing, canceling, or reopening them. Each task has a title, category, priority, status, optional due date/notes, and exactly one relationship scope. Related Gigs/People must exist when the relationship is assigned. The system generates the friendly relationship label from the selected record.

New tasks start open with medium priority unless priority is supplied. Due date and notes default to null. Task creation requires title, category, and relationship; it does not require a future deadline or automatically create related records.

The Tasks board is a read-only ledger, initially showing active tasks (open/in progress). It supports status, priority, category, and text filters; text searches title, saved related-record label, and notes. Clicking a row opens details with status, priority, category, dates, related scope, and notes. Clear restores the initial active/all-priorities/all-types/empty-search filters.

Board metrics count overdue active tasks, active tasks due today, all active tasks (labeled “Open tasks”), and completed tasks. Metrics do not narrow with filters. Completing a task is available through agent update or CLI, not a board control.

## Business Rules
- Title is trimmed and nonblank. Type, status, and priority must be supported values listed in the [domain](../domain/tasks-task.md).
- A task relates to one Gig, one Person, or general search. Gig/Person links require an exact nonnull ID; general scope requires null ID and label “General”. Callers cannot supply their own label.
- Due dates are null or valid calendar dates in YYYY-MM-DD form.
- Created, updated, and completion dates are service-owned. Completion assigns the mutation's Pacific calendar date. A completed task requires a completion date; every other status requires null completion date.
- Updating unrelated fields on a completed task preserves completion date. Setting completed again also preserves its original completion date. Changing to open, in progress, or canceled clears completion date; completing again establishes a new date.
- Partial updates preserve omitted fields. Relationship replacement must provide its complete type/ID pair. Due date and notes can be explicitly cleared.
- A task is overdue only when open/in progress with due date before today; due today is distinct. Today uses America/Los_Angeles.

## State and Lifecycle
Creation starts open. Subsequent changes can move between open, in progress, completed, and canceled without an enforced sequential progression, subject to completion-date rules. There is no task deletion control in the normal board, task tools, or supported CLI task commands. General audited change reversal can separately revert eligible task changes.

## Capability-Specific Nonfunctional Requirements
Task mutations are audited and persisted with revision checks. No numeric latency, availability, or capacity objective was established by inspected contracts.

## Related Workflows
Creation and status changes are specified here and in the domain; no separate workflow is needed for these short operations.

## Related Domain Objects
- [Task](../domain/tasks-task.md)

## Related Interfaces
- [Task interfaces](../interfaces/api/tasks.md)

## Related Architecture
- [Task implementation](../architecture/tasks.md)

## Known Constraints
Related labels are saved snapshots, so later Person/Gig renaming does not automatically refresh task text. Task completion does not send a message, submit an application, or change an associated Gig's next action. The drawer text mentions CLI updates but agent task mutations are also supported. An open drawer retains its selected task snapshot across list refreshes until reopened.
