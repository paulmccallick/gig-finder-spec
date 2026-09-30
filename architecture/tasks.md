---
type: architecture
scope: tasks
summary: Task service-owned dates and relationships, audited persistence, query defaults, and board refresh behavior.
load_when:
  - modifying task persistence or service contracts
  - diagnosing stale labels, dates, or UI snapshots
related:
  - capabilities/tasks.md
  - domain/tasks-task.md
  - interfaces/api/tasks.md
---
# Task Architecture

## Purpose
Explain the implementation of [Tasks](../capabilities/tasks.md), especially service-owned state/date handling and the different UI/agent read surfaces.

## Components
[TaskDomainService](../../gig-finder/src/core/task-domain-service.ts) owns creation defaults, relationship resolution, status dates, reads, queries, and updates. [Task schemas and comparators](../../gig-finder/src/core/tasks.ts) define mutable fields, enum values, calendar-date validation, and urgency ordering. [ChangeExecutor](../../gig-finder/src/core/changes.ts) handles dry-run versus committed change execution and concurrency translation.

[DataStore](../../gig-finder/src/data/store.ts) stores task fields, saved relationship labels, history, timestamps, deletion flags and revisions. [Schema](../../gig-finder/src/data/schema.ts) provides tasks/task_history structures. Public task mapping removes persistence revision/deletion metadata and maps created/updated timestamps to calendar dates.

## Mutation and Date Processing
The service resolves the effective change timestamp once and derives its business day in America/Los_Angeles. createNew validates input, looks up the related record, stores its label, and starts open regardless of optional input status. It creates the task with reversible-creation history enabled.

Update reads current state and applies supplied fields. A supplied relationship is fully resolved again; an omitted one retains the saved label. Status logic preserves completion date if status is omitted or remains completed, assigns the mutation day on entry to completed, and clears it for any other requested status. It validates the final task and writes using the current persistence revision read internally. No caller expected revision is exposed; equal-value updates still create a revision. Mutation dates are not independently writable task fields.

Persistence created/updated instants are projected to Pacific dates; existing valid calendar-day values are retained by the read mapper. Due and completion values remain calendar-day strings. No chronological rule requires due/completion dates to be after creation; only validity and status/date consistency are enforced. The complete helper supplies noon -07:00 only when the context lacks its own timestamp.

## Data Flow and Boundaries
Agent task creation generates a random task ID and an agent-tool change ID. Duplicate committed change IDs are rejected by shared persistence, rather than replaying a task creation result. CLI allows explicit task IDs and dry runs. Task changes do not mutate related Gig next-action fields or create communications.

Queries load all current task rows, apply filters, sort, then page in memory. Unfiltered agent queries select open/in_progress; a meaningful filter without explicit statuses searches all statuses. HTTP and CLI list use unfiltered list instead. [HTTP route](../../gig-finder/src/web/request-handler.ts) returns all records; [TaskBoard](../../gig-finder/src/web/client/TaskBoard.tsx) filters locally with a default active status and uses the shared comparator. No index-backed pagination or throughput guarantee is inferred.

[App](../../gig-finder/src/web/client/App.tsx) reloads task/Gig/people lists after agent data changes. TaskBoard stores the selected task object separately and does not synchronize it with new props, so its open drawer can remain stale while rows refresh. Relationship labels likewise remain stored snapshots until reassigned. The drawer's CLI-only guidance is narrower than the supported agent mutations.

## Guarantees and Failure Modes
Schema and final-state checks reject bad input before writing. Missing related records reject reassignment. Audit/task writes share the change transaction. Task revisions protect the service read/write interval but do not detect that a user's prior read is stale. Generic eligible change reversal can restore task history or reverse creation; no task-specific delete service is exposed. Related record changes do not refresh saved labels automatically.

## Evidence and Verification Coverage
- [Service tests](../../gig-finder/src/core/test/services.test.ts): defaults, completion, reopen, relationship resolution, missing person, dry-run.
- [Input contract tests](../../gig-finder/src/core/test/input-contracts.test.ts): invalid dates, invalid links, immutable dates/labels, empty patches.
- [Task tests](../../gig-finder/src/core/test/tasks.test.ts): overdue versus due today and ordering.
- [Read-service tests](../../gig-finder/src/core/test/read-services.test.ts): defaults, pagination, list/read parity.
- [Agent tests](../../gig-finder/src/agent/test/gig-finder-tools.test.ts): strict task schemas, creation/update delegation and logged metadata.
- [CLI tests](../../gig-finder/src/cli/test/cli.test.ts): default creation, completion via update, rejection of caller completion date.
- [Board E2E](../../gig-finder/src/web/e2e/gig-board.e2e.ts): Tasks workspace and drawer.

Test sources were inspected; no fresh application test execution is claimed for this documentation task. No design rationale or numeric NFR is inferred from implementation.
