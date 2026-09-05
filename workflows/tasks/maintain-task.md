---
id: maintain-task
capability: tasks
feature: task-tracking
title: Create or maintain a task
summary: Create, edit, complete, reopen, or cancel a job-search task.
aliases: [add task, complete task, reschedule follow-up]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md, ../../foundations/dates-time-ordering.md]
related: [browse-tasks.md]
implementation_areas: [src/core/tasks.ts, src/core/task-domain-service.ts, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/tasks.test.ts, src/core/test/input-contracts.test.ts, src/agent/test/gig-finder-tools.test.ts, src/cli/test/cli.test.ts]
---

# Create or maintain a task

## Intent

The candidate wants to establish or change a durable commitment related to a Gig, Person, or the general search.

## Access points

Agent `create_task`/`update_task`; CLI `tasks add|update|complete`. No dashboard editor exists.

## Preconditions

Title, type, and related entity are required. Gig/Person relations require an exact existing ID; general requires null. Agent mutations follow confirmation policy.

## Workflow

1. Resolve the related entity when not general.
2. Supply title; type (`networking_follow_up`, `application`, `interview_prep`, `sourcing`, `resume`, `administrative`, `learning`, `other`); optional priority, due date, and notes.
3. Creation establishes `open`, default priority `medium` when omitted/null, and no completion date.
4. Updates change only explicit mutable fields. Moving to `completed` records the mutation date; leaving completed clears it.
5. Return the complete current task and audit identity.

## Decisions and variants

Status values are `open`, `in_progress`, `completed`, and `canceled`; priorities are high/medium/low. Agent clear operations can clear due date and notes. CLI `complete` is shorthand for a status update with an explicit date.

## State changes

Creates revision 1 or advances the current revision. Related display label is resolved from the referenced record and is not caller-controlled.

## Outputs and observable effects

Dashboard metrics/order reflect the update after refresh. Creation and update results include the record and change identity.

## Safety rules

Completion date, labels, IDs, and timestamps are derived/immutable. General tasks cannot carry an ID; Gig/Person tasks cannot omit one.

## Failure, retry, and recovery

Unknown fields, invalid dates/enums, and missing references fail atomically. Dry-run projects without saving. Reopening a completed task intentionally removes its completion date.

## Current limitations

There is no supported task deletion. Agent creation generates the Task ID rather than exposing caller choice; CLI requires a caller-supplied ID.

## Related specifications

- [Browse tasks](browse-tasks.md)
