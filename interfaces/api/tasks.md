---
type: interface
scope: tasks
summary: HTTP task reads, agent mutations and query defaults, CLI completion, and shared input errors.
load_when:
  - integrating task reads, creation, or updates
  - comparing board, agent, and CLI task support
related:
  - capabilities/tasks.md
  - domain/tasks-task.md
  - architecture/tasks.md
---
# Task Interfaces

## HTTP and Board
`GET /api/tasks` returns all current nondeleted TaskRecords as a JSON array, including completed/canceled tasks. No query parameters are applied. The browser uses no-store fetch and local filtering. There is no task-specific HTTP detail/write endpoint; non-GET requests reaching `/api/tasks` receive 405 “Read-only API”. Evidence: [routing](../../../gig-finder/src/web/request-handler.ts), [loader](../../../gig-finder/src/web/client/data/tasks.ts), [board](../../../gig-finder/src/web/client/TaskBoard.tsx).

There is no separate task authentication or API version negotiation at this endpoint; application-wide security owns the deployment boundary.

## Agent Tools
[Tool schemas and execution](../../../gig-finder/src/agent/gig-finder-tools.ts) expose:

| Tool | Contract |
| --- | --- |
| `list_tasks` | Nullable status/priority/type lists, related entity type/ID, overdue flag, text, offset/limit; returns full task records and page metadata. |
| `get_task` | Exact ID; returns ok/record or not_found/ID. |
| `create_task` | Title, type, nullable priority, nullable due date, complete relatedEntity type/ID, nullable notes. Null priority selects medium. Status/dates/label are not caller fields. |
| `update_task` | Exact ID and nonempty set/clear operation array; status set to completed is the completion operation. No distinct complete_task tool. |

Default query statuses are open/in_progress. A meaningful filter with omitted statuses broadens to all statuses; pagination alone, empty query, or overdue false does not. Filters combine conjunctively. Text matches title, stored related label, or notes case-insensitively. Offset defaults 0; limit defaults 20 and supports 1–50. Service query adds ID to the [domain ordering](../../domain/tasks-task.md#ordering). The board keeps its active status filter when searching, unlike filtered agent discovery. See [TaskDomainService](../../../gig-finder/src/core/task-domain-service.ts) and [query helpers](../../../gig-finder/src/core/queries.ts).

Updates support title, type, status, priority, dueDate, relatedEntity, notes. Set requires nonnull schema-valid value; clear requires null and is restricted to dueDate/notes. relatedEntity is replaced with the full pair, not dot-path fields. Duplicate field operations are rejected. No caller expectedRevision argument exists. Evidence: [shared input](../../../gig-finder/src/core/tasks.ts), [operation schemas](../../../gig-finder/src/agent/update-tool-schemas.ts).

## CLI
`tasks` aliases `task`:

- `tasks list` returns all current records unpaginated; `tasks get <id>` returns one record.
- `tasks add <id> --title … --type … --due YYYY-MM-DD|none --related-type gig|person|general` supports optional priority, related ID, notes, date, and dry-run. Gig/person require related ID; general uses null.
- `tasks update <id> --patch <json>` or `--patch-file <path>` accepts shared partial input, with optional date and dry-run.
- `tasks complete <id> --date YYYY-MM-DD` changes status through the same service, with optional dry-run.

The CLI supplies the requested business day as a noon timestamp with fixed -07:00 offset. Completion uses this mutation timestamp. Internally, complete(context,id,date) uses its date argument only if context has no occurredAt. See [CLI](../../../gig-finder/src/cli/cli.ts), [adapter](../../../gig-finder/src/cli/db-store.ts), and [CLI tests](../../../gig-finder/src/cli/test/cli.test.ts).

## Shared Contract, Defaults, and Errors
createNew requires ID/title/type/relatedEntity, forces open status, defaults medium priority and null due/notes/completedAt. Although shared TaskInput permits status for updates, a status supplied directly to createNew is ignored in favor of open. Inputs cannot assign createdAt, updatedAt, completedAt, or related label. Unknown fields and invalid calendar dates/enums are rejected.

Missing task or linked Gig/Person mutations throw errors; tagged reads return not_found. An empty patch or mismatched relationship type/ID fails validation. Mutation results contain record/changeId, except the complete helper returns the record. Dry-run returns a candidate with null changeId without persistence. Explicit duplicate change IDs are rejected by shared persistence; task creation does not provide Gig-style fingerprint replay. Revision conflicts use the shared mutation error. Public TaskRecords do not expose revision/isDeleted metadata. Evidence: [service](../../../gig-finder/src/core/task-domain-service.ts), [change executor](../../../gig-finder/src/core/changes.ts), [persistence](../../../gig-finder/src/data/store.ts).
