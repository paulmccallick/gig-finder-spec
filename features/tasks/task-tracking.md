---
id: task-tracking
capability: tasks
title: Task tracking
summary: Track dated or undated job-search commitments and their completion lifecycle.
aliases: [task, follow-up, action item]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md, ../../foundations/dates-time-ordering.md]
workflows: [../../workflows/tasks/browse-tasks.md, ../../workflows/tasks/maintain-task.md]
operational_models: []
quality_scenarios: []
variants: [../../variants/tasks/maintain-task-cli.md]
contracts: [../../contracts/operations/list_tasks.schema.json, ../../contracts/operations/get_task.schema.json, ../../contracts/operations/create_task.schema.json, ../../contracts/operations/update_task.schema.json]
implementation_areas: [src/core/tasks.ts, src/core/task-domain-service.ts, src/web/client/TaskBoard.tsx, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/tasks.test.ts, src/agent/test, src/cli/test]
---

# Task tracking

## Purpose and boundary

A Task is one commitment related to an exact Gig, exact Person, or the general job search. It is distinct from the single next action embedded in a Gig.

## Access points

The dashboard browses and prioritizes Tasks but does not edit. Strict agent tools and the supported CLI read, create, update, complete, reopen, and cancel Tasks.

## Configuration and defaults

There is no independent configuration. Creation always starts status `open`; priority defaults to `medium` when omitted or null, and due date/notes default to null. The supported priorities are `high`, `medium`, and `low`. Pacific today controls overdue display and the system completion date.

## Durable state and lifecycle

Statuses are `open`, `in_progress`, `completed`, and `canceled`. Creation begins `open` with medium priority when those values are omitted. Completion sets the system-maintained Pacific business date; leaving completed clears it. General tasks have null related ID and label General. Each successful mutation advances revision/history.

## Validation and invariants

Title is nonblank; due/completion dates are real calendar dates; status and the `high`/`medium`/`low` priority values validate exactly. A Gig/Person task requires its exact existing ID; a general task requires null. Callers cannot directly set completion date, related label, ID, or metadata.

## Outputs and downstream effects

Dashboard groups active Tasks by due/priority and marks overdue relative to Pacific today. Reads include stable related-entity meaning. Task lifecycle does not mutate its related Gig/Person.

## Failure, retry, and recovery

Invalid relationship/date/status fails atomically. Missing targets return not-found. Reread after uncertain delivery or conflict; CLI dry-run leaves no durable state.

## Current limitations

There is no dashboard editor or supported delete. Cancelled/completed history is not the dashboard's primary working view.

## Detailed specifications

- [Browse and prioritize tasks](../../workflows/tasks/browse-tasks.md)
- [Create or maintain a task](../../workflows/tasks/maintain-task.md)
