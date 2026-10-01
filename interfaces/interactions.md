---
type: interface
scope: interactions
summary: Shared Interaction service, agent tool, and CLI contracts and current web-surface limitations.
load_when:
  - calling interaction operations
  - changing interaction input validation or tool schemas
related:
  - capabilities/interactions.md
  - domain/interactions.md
  - architecture/interactions.md
---
# Interaction Interfaces

## Service Contract

`InteractionService` exposes `get`, `read`, `list`, `query`, `create`, `update`, and `delete`. Structured read returns `ok` with record, `not_found` with ID, or `consistency_error` with ID/message. `get` returns null for missing records and throws on consistency errors. Mutations return `{record, changeId}`; dry-run returns a preview with null change ID and does not persist.

The strict patch schema accepts one or more recognized interaction fields. Create requires a valid final entity: at minimum ID, subject, startsAt, and nonempty unique personIds; missing kind/channel default to other, direction unknown, and status completed. Nullable fields default null and structuredData defaults to an empty object. Update merges supplied fields into the current entity and validates the result. `structuredData` is a JSON-object-style map; CLI/service can replace it.

Query accepts `personIds`, `gigIds`, `kinds`, `channels`, `directions`, `statuses`, `startsFrom`, `startsThrough`, `query`, `offset`, and `limit`. Array dimensions use any-of matching, dimensions combine, timestamp bounds are inclusive absolute instants, and text uses a normalized substring. Default offset is 0 and limit 20; limit must be 1–50. Results contain `status:"ok"`, items, and page metadata including total, returned, hasMore, and nextOffset. Sort is fixed to descending start instant, ascending ID.

Deletion takes caller-supplied `expectedRevision`; update does not expose such a parameter and uses the current persisted revision internally. Validation, missing-reference, consistency, and revision failures are errors through the shared application boundary, not a dedicated interaction HTTP status contract.

## Agent Tools

| Tool | Input distinctions |
| --- | --- |
| `list_interactions` | Nullable optional filter dimensions normalized into the service query. |
| `get_interaction` | Exact durable ID; returns structured read outcome. |
| `create_interaction` | Explicit subject, kind/channel/direction/status, timestamps, nullable timezone/content/Gig/correction fields, unique personIds. ID is derived from tool call. Does not expose structuredData or originChangeId; structuredData starts empty. |
| `update_interaction` | `{id, changes}` with explicit set/clear operations. structuredData is excluded; other mutable contract fields follow update schemas. |
| `delete_interaction` | `{id, expectedRevision}`; tool description requires explicit user confirmation. |

Deletion's confirmation requirement is an instruction in the tool description; the tool implementation does not contain a separate confirmation flag or `needsApproval` gate. Shared agent orchestration and application access rules govern invocation.

Clear operations are limited to nullable endsAt, timezone, location, summary, notes, gigId, supersedesInteractionId, and originChangeId. Participants are replaced as a nonempty unique list, not cleared. Updates cannot change the entity ID.

## CLI

```text
gig-finder interactions get <id>
gig-finder interactions list [--people <id,...>] [--gigs <id,...>]
  [--kinds <kind,...>] [--channels <channel,...>]
  [--directions <direction,...>] [--statuses <status,...>]
  [--starts-from <timestamp>] [--starts-through <timestamp>]
  [--query <text>] [--offset <number>] [--limit <number>]
gig-finder interactions add <id> --patch-file <path> [--date YYYY-MM-DD] [--dry-run]
gig-finder interactions update <id> --patch-file <path> [--date YYYY-MM-DD] [--dry-run]
gig-finder interactions delete <id> --expected-revision <number> [--date YYYY-MM-DD] [--dry-run]
```

The parser also accepts inline `--patch` JSON, as verified by the CLI test. Add/update use the same strict interaction input schema. Successful list output wraps records/page in `{ok:true, entity, command, ...}`. CLI accesses the local application service; it is not an HTTP client or external calendar connector.

## Web and Compatibility

The web request handler has no dedicated `/api/interactions` CRUD route and the workspace has no standalone interaction editor. The application agent provides interaction tools; networking cards/details display derived contact fields. Person/Gig records include compact interaction references. The current vocabulary replaces legacy meeting-specific persistence; source/legacy metadata is not a promise of supported inbound calendar synchronization.

## Implementation References

**INTERACTION-API-001** Current domain, service, agent, CLI, and browser references are listed in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#interaction-api-001).
