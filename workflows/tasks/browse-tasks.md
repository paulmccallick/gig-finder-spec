---
id: browse-tasks
capability: tasks
feature: task-tracking
title: Browse and prioritize tasks
summary: Filter current tasks and inspect due, priority, status, and related context.
aliases: [task list, overdue work, action queue]
requires: [../../foundations/dates-time-ordering.md, ../../foundations/queries-and-pagination.md]
related: [maintain-task.md]
implementation_areas: [src/core/tasks.ts, src/core/task-domain-service.ts, src/web/client/TaskBoard.tsx, src/agent/gig-finder-tools.ts]
test_suites: [src/core/test/tasks.test.ts, src/web/e2e/gig-board.e2e.ts, src/agent/test/gig-finder-tools.test.ts]
---

# Browse and prioritize tasks

## Intent

The candidate wants to determine what work is active, due, overdue, completed, or connected to a specific record.

## Access points

Dashboard Tasks workspace; agent `list_tasks`/`get_task`; CLI `tasks list|get`.

## Preconditions

Readable task storage. Exact detail requires a Task ID.

## Workflow

1. Choose status, priority, type, related entity, overdue-only, or text criteria available on the surface.
2. The system computes overdue/due-today against Pacific today and returns current tasks.
3. Results sort by urgency, due date, priority, title, and stable ID.
4. Open a task to inspect title, related label, type, priority, status, due date, notes, and completion date.

## Decisions and variants

Dashboard defaults to active (`open` and `in_progress`); agent supports exact related entity filters and pagination; CLI list has no filters. Search matches task title, related label, and notes.

## State changes

None.

## Outputs and observable effects

Dashboard metrics show overdue, due today, active, and completed counts. Rows visibly distinguish overdue/today and show priority, type, due, and status.

## Safety rules

Browsing does not complete tasks or advance status.

## Failure, retry, and recovery

Missing exact IDs fail visibly. Dashboard data failure produces the application data-fault view.

## Current limitations

The dashboard is read-only and explicitly directs updates to the CLI, even though agent task mutations are also supported. It does not navigate from a related label to the Gig/Person.

## Related specifications

- [Maintain a task](maintain-task.md)
