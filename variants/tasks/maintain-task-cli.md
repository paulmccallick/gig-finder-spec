---
id: maintain-task-cli
capability: tasks
feature: task-tracking
workflow: ../../workflows/tasks/maintain-task.md
surface: cli
summary: CLI uses flags for creation/completion, JSON patch for updates, caller IDs, and dry run.
aliases: [tasks add, tasks complete]
requires: [../../workflows/tasks/maintain-task.md]
---

# Create or maintain a task via CLI

## Exposure

`gig-finder tasks add|update|complete`.

## Inputs and validation

Add uses flags and requires `--due` (`none` allowed) and related type; update uses one patch source; complete requires explicit date.

## Interaction sequence

Invoke and parse JSON result.

## Outputs or presentation

Complete returns the updated full record.

## Confirmation and authorization

Direct invocation; no prompt.

## Surface-specific failures

General/non-general related-ID mismatch and immutable fields fail before write.

## Refresh and consistency

Optional mutation date defaults to Pacific today except complete's required date.

## Current limitations

No delete command.

## Shared specification

[Canonical behavior](../../workflows/tasks/maintain-task.md)
