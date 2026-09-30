---
type: architecture
scope: tasks
summary: Task service-owned dates and relationships, audited persistence, query defaults, and board refresh behavior.
load_when:
  - modifying task persistence or service contracts
  - diagnosing stale labels, dates, or UI snapshots
---
# Task Architecture

## Purpose
Explain how [Tasks](../capabilities/tasks.md) saves follow-ups, application work, and interview preparation and keeps their status and completion dates consistent. The [Task definition](../domain/tasks-task.md) owns the concepts; [task interfaces](../interfaces/api/tasks.md) describe browser, assistant, and command-line contracts.

## Components
[TaskDomainService](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/task-domain-service.ts) owns creation defaults, relationship resolution, status dates, reads, queries, and updates. [Task schemas and comparators](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/tasks.ts) define editable fields, allowed category/status/priority values, calendar-date validation, and urgency ordering. [ChangeExecutor](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/changes.ts) handles previews (dry runs, which do not save) and committed changes. It converts an internal write-conflict exception into the shared revision_conflict error.

[DataStore](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/store.ts) stores task fields, saved relationship labels, history, timestamps, deletion flags and revisions. A revision is a record version used to detect another write during an update. [Schema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/schema.ts) provides tasks/task_history structures. The conversion to public task records hides those internal version/deletion fields and converts creation/update timestamps to calendar dates.

## Mutation and Date Processing
A mutation is a request to create or change a saved task.

The service chooses the change timestamp once, using context.occurredAt when supplied or the current time otherwise. It derives the calendar day in America/Los_Angeles. createNew validates input, looks up the related record, saves its display name, and starts open regardless of optional input status. Creation history allows the generic change-reversal operation to undo an eligible creation.

Update reads current state and applies supplied fields. A supplied relationship is fully resolved again; an omitted one retains the saved label. Status logic preserves completion date if status is omitted or remains completed, assigns the mutation day on entry to completed, and clears it for any other requested status. It validates the final task and writes using the current persistence revision read internally. Callers cannot specify the version they previously read, and an update still increments the revision when the supplied values equal the current values. Creation, update, and completion dates cannot be set as ordinary task fields; dueDate can.

The read conversion turns stored creation/update timestamps into Pacific calendar days; already valid calendar-day values are kept. Due and completion values remain calendar-day strings. No chronological rule requires due/completion dates to be after creation; only validity and status/date consistency are enforced. The complete helper supplies noon -07:00 only when the context lacks its own timestamp.

## Data Flow and Boundaries
Agent task creation generates a random task ID and an agent-tool change ID. A change ID identifies an operation in saved history. Reusing a committed change ID fails instead of returning the original task creation result. CLI allows explicit task IDs and dry runs. Task changes do not mutate related Gig next-action fields or create communications.

Queries load all current task rows, filter and sort them, then select the requested page in application memory. Unfiltered agent queries select open/in_progress; a meaningful filter without explicit statuses searches all statuses. HTTP and CLI list use unfiltered list instead. [HTTP route](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts) returns all records; [TaskBoard](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/TaskBoard.tsx) filters locally with a default active status and uses the shared comparator. The database does not fetch just the requested page, so each query examines the full current task list. No measured throughput target is established.

[App](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/App.tsx) reloads task/Gig/people lists after agent data changes. TaskBoard keeps a separate copy of the selected task and does not replace it when refreshed lists arrive. Its open detail drawer can therefore display old values while rows update. Reopening the task selects the refreshed record. Related display names also stay as originally saved until reassigned. The drawer's CLI-only guidance is narrower than the supported agent mutations.

## Guarantees and Failure Modes
Schema and final-state checks reject bad input before writing. Missing related records reject reassignment. The task and its history are written in one transaction: both save or neither does. The revision check compares against the raw record fetched just before saving; it does not detect that the user's earlier view is out of date. Generic change reversal can restore an eligible prior task version or undo creation; no task-specific delete service is exposed. See [shared persistence and reversal](persistence.md). Related record changes do not refresh saved labels automatically.

## Evidence and Verification Coverage
- [Service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/services.test.ts): defaults, completion, reopen, relationship resolution, missing person, dry-run.
- [Input contract tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/input-contracts.test.ts): invalid dates, invalid links, immutable dates/labels, empty patches.
- [Task tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/tasks.test.ts): overdue versus due today and ordering.
- [Read-service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/read-services.test.ts): defaults, pagination, list/read parity.
- [Agent tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/test/gig-finder-tools.test.ts): strict task schemas, creation/update delegation and logged metadata.
- [CLI tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/test/cli.test.ts): default creation, completion via update, rejection of caller completion date.
- [Board E2E](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/e2e/gig-board.e2e.ts): Tasks workspace and drawer.

Test sources were inspected; no fresh application test execution is claimed for this documentation task. The implementation does not establish design rationale or numerical service-quality targets.

## Related ADRs

- [ADR 0004: Share one domain input contract across create and update](../decisions/0004-share-domain-input-contracts.md)
- [ADR 0005: Store mutations as revisioned, audited transactions](../decisions/0005-revisioned-audited-change-transactions.md)
- [ADR 0016: Mutate domain-owned tables through the owning domain service](../decisions/0016-own-domain-table-mutations.md)

## Related documents

- [Tasks](../capabilities/tasks.md)
- [Task](../domain/tasks-task.md)
- [Task Interfaces](../interfaces/api/tasks.md)
