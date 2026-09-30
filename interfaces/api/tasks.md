---
type: interface
scope: tasks
summary: HTTP task reads, agent mutations and query defaults, CLI completion, and shared input errors.
load_when:
  - integrating task reads, creation, or updates
  - comparing board, agent, and CLI task support
---
# Task Interfaces

## HTTP and Board
These interfaces let the job seeker review scheduled work and record progress through the browser, assistant, or command line. [Tasks](../../capabilities/tasks.md) defines the user behavior; [Task](../../domain/tasks-task.md) defines the record and lifecycle; [task architecture](../../architecture/tasks.md) explains saving and refresh behavior.

HTTP is the browser's request/response protocol. An agent tool is a named operation the assistant can call. Both use the same task service, but the browser supports reads only.

`GET /api/tasks` returns all current task records that have not been deleted as a JSON array, including completed/canceled tasks. Parameters in the URL do not filter this response. The browser requests a fresh response without using its HTTP cache and filters the returned list locally. There is no task-specific HTTP detail/write endpoint; non-GET requests reaching `/api/tasks` receive 405 “Read-only API”. Evidence: [routing](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts), [loader](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/data/tasks.ts), [board](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/TaskBoard.tsx).

There is no separate task authentication or API version negotiation at this endpoint; access depends on the [application security boundary](../../requirements/security.md).

## Agent Tools
[Tool schemas and execution](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts) expose:

| Tool | Contract |
| --- | --- |
| `list_tasks` | Nullable status/priority/type lists, related entity type/ID, overdue flag, text, offset/limit; returns full task records and page metadata. |
| `get_task` | Exact ID; returns ok/record or not_found/ID. |
| `create_task` | Title, type, nullable priority, nullable due date, complete relatedEntity type/ID, nullable notes. Null priority selects medium. Status, generated dates, and label are not caller fields. |
| `update_task` | Exact ID and nonempty set/clear operation array; status set to completed is the completion operation. No distinct complete_task tool. |

Default query statuses are open/in_progress. Supplying a substantive filter, such as a priority, category, relationship, nonblank search text, or overdueOnly=true, without choosing statuses searches all statuses. Pagination alone, empty search text, or overdueOnly=false keeps the active default. A task must match every supplied filter; values within a status, priority, or type list are alternatives. Text matches title, stored related label, or notes case-insensitively. Pagination returns one slice of matching records: offset is the number to skip (default 0), and limit is the maximum number to return (default 20, allowed 1–50). Service query adds ID to the [domain ordering](../../domain/tasks-task.md#ordering). The board keeps its active status filter when searching, unlike filtered agent discovery. See [TaskDomainService](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/task-domain-service.ts) and [query helpers](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/queries.ts).

Updates support title, type, status, priority, dueDate, relatedEntity, and notes. Each operation names a field and either sets it to a valid nonnull value or clears it with null. Only dueDate and notes can be cleared. relatedEntity must supply both type and ID; individual nested fields cannot be changed separately. Naming the same field twice is rejected. Callers cannot provide an expectedRevision value to require that the task still matches a previously read version. Evidence: [shared input](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/tasks.ts), [operation schemas](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/update-tool-schemas.ts).

## CLI
The command-line interface (CLI) accepts `tasks` as an alias for `task`:

- `tasks list` returns all current records unpaginated; `tasks get <id>` returns one record.
- `tasks add <id> --title … --type … --due YYYY-MM-DD|none --related-type gig|person|general` supports optional priority, related ID, notes, date, and dry-run. Gig/person require related ID; general uses null.
- `tasks update <id> --patch <json>` or `--patch-file <path>` accepts a JSON object containing only the fields to change, with optional date and dry-run.
- `tasks complete <id> --date YYYY-MM-DD` changes status through the same service, with optional dry-run.

The CLI supplies the requested date as noon with a fixed -07:00 time offset; omitted optional dates default to today in America/Los_Angeles. The service derives the completion day from that timestamp. The internal complete(context,id,date) helper uses its date argument only if context has no occurredAt timestamp. See [CLI](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/cli.ts), [adapter](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/db-store.ts), and [CLI tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/test/cli.test.ts).

## Shared Contract, Defaults, and Errors
The shared createNew method requires ID, title, type, and relatedEntity. It starts tasks with open status and medium priority, and defaults dueDate, notes, and completedAt to null. The shared TaskInput input format accepts status for updates; passing status directly to createNew still produces an open task. Inputs cannot assign createdAt, updatedAt, completedAt, or the related label. Unknown fields, invalid calendar dates, and unsupported category/status/priority values are rejected.

At the service boundary, updating a missing task or assigning a missing opportunity/contact throws an error; read returns `{status: "not_found", id}`. Empty patches, mismatched relationship type/ID, invalid values, and attempts to write protected fields fail validation.

The agent wrapper converts validation failures to `{status: "error", error: "validation_failed", message}` and missing-record errors to `error: "not_found"`. Shared save conflicts use `error: "revision_conflict"`; unclassified failures use `error: "tool_failed"`. Successful create/update tools return `{status: "ok", record, changeId}`. Evidence: [tool execution and error handling](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts).

Service create/update return record/changeId; the complete helper returns just the record. A dry run validates and returns the proposed record with null changeId, without saving. The CLI adapters return just the record to a CLI response containing ok, dryRun, entity, command, id, and record. Agent task tools do not expose dry-run input.

A changeId identifies a saved change in the history. Reusing a committed change ID fails; task creation does not return an earlier result on retry. Public task records omit internal revision numbers and deletion flags. See [service](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/task-domain-service.ts), [change executor](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/changes.ts), [CLI adapter](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/db-store.ts), and [persistence](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/store.ts).

## Related documents

- [Tasks](../../capabilities/tasks.md)
- [Task](../../domain/tasks-task.md)
- [Task Architecture](../../architecture/tasks.md)
