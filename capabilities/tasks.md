---
id: tasks
title: Tasks
aliases: [task, action item, follow-up]
---

# Tasks

## Purpose and boundary

Lets the candidate track dated or undated job-search commitments related to a Gig, Person, or the general search. A Gig's single next action is part of the Gig, not a Task.

## Vocabulary

| Term | Meaning here |
|---|---|
| active | Status `open` or `in_progress`. |
| related entity | One Gig, one Person, or `general`. |
| completion date | System-maintained calendar date when status becomes `completed`. |

## Features

| Feature | Use when | Document |
|---|---|---|
| Task tracking | Browse, create, edit, complete, reopen, or cancel commitments | [Open](../features/tasks/task-tracking.md) |

## Shared foundations

- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)
- [Dates and ordering](../foundations/dates-time-ordering.md)

## Evidence pointers (optional)

- Implementation areas: `src/core/tasks.ts`, `src/core/task-domain-service.ts`, `src/web/client/TaskBoard.tsx`
- Test suites: `src/core/test/tasks.test.ts`, `src/agent/test/`, `src/cli/test/`
