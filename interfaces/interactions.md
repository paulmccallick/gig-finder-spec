---
type: interface
scope: interactions
summary: How agent tools and command-line callers record and retrieve conversations, participants, and interview details.
load_when:
  - calling interaction operations
  - changing interaction input validation or tool schemas
---
# Interaction Interfaces

## Service Contract

These interfaces let the candidate record job-search conversations and appointments, retrieve what was discussed, and correct who participated. Start with the [Networking capability](../capabilities/networking.md) for the user outcome and the [interaction model](../domain/interactions.md) for field meanings. The [architecture](../architecture/interactions.md) explains storage and last-contact calculations.

`InteractionService` exposes `get`, `read`, `list`, `query`, `create`, `update`, and `delete`. Structured read returns `ok` with record, `not_found` with ID, or `consistency_error` with ID/message. `get` returns null for missing records and throws on consistency errors. Mutations return `{record, changeId}`; dry-run returns a preview with null change ID and does not persist.

A patch is a set of fields to change. Its strict schema accepts one or more recognized interaction fields and rejects unknown fields. Create requires a valid final entity: at minimum an ID argument and subject, startsAt, and nonempty unique personIds in the input; missing kind/channel default to other, direction unknown, and status completed. Nullable fields default null and structuredData defaults to an empty object. Update merges supplied fields into the current entity and validates the result. `structuredData` is a JSON-object-style map; CLI/service can replace it.

Query accepts `personIds`, `gigIds`, `kinds`, `channels`, `directions`, `statuses`, `startsFrom`, `startsThrough`, `query`, `offset`, and `limit`. Within a filter, any supplied value can match; across filters, every supplied condition must match. Time bounds include their endpoints and compare actual instants regardless of offset. Text search ignores case and matches a substring across subject, summary, notes, and location. Default offset is 0 and limit 20; limit must be 1–50. Results contain `status:"ok"`, items, and page metadata including total, returned, hasMore, and nextOffset. Sort is fixed to descending start instant, ascending ID.

Times use ISO 8601 strings with a UTC offset, for example `2026-09-09T10:00:00-07:00`. An optional IANA timezone is a recognized name such as `America/Los_Angeles`. The end cannot precede the start.

A revision is the stored record version, used to detect intervening changes. Deletion takes caller-supplied `expectedRevision`; update does not expose such a parameter and uses the current persisted revision internally. Validation, missing-reference, consistency, and revision failures are errors through the shared application boundary, not a dedicated interaction HTTP status contract.

## Agent Tools

| Tool | Input distinctions |
| --- | --- |
| `list_interactions` | Nullable optional filter dimensions normalized into the service query. |
| `get_interaction` | Exact durable ID; returns structured read outcome. |
| `create_interaction` | Explicit subject, kind/channel/direction/status, timestamps, nullable timezone/content/Gig/correction fields, unique personIds. ID is derived from tool call. Does not expose structuredData or originChangeId; structuredData starts empty. |
| `update_interaction` | `{id, changes}` with explicit set/clear operations. structuredData is excluded; other mutable contract fields follow update schemas. |
| `delete_interaction` | `{id, expectedRevision}`; tool description requires explicit user confirmation. |

Deletion's confirmation requirement is an instruction in the tool description; the tool implementation does not contain a separate confirmation flag or `needsApproval` gate. The [agent interface](api/conversational-agent.md) describes shared invocation and approval behavior.

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

The web request handler has no dedicated `/api/interactions` CRUD route and the workspace has no standalone interaction editor. The application agent provides interaction tools; networking cards/details display derived contact fields. Person/Gig records include compact interaction references. Imported meeting records may retain source identifiers; these do not establish support for live calendar synchronization.

## Source Evidence

- [Domain and input schemas](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/interactions.ts), [service](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/interaction-service.ts), [pagination](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/queries.ts)
- [Agent tool schemas/implementations](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts), [set/clear operation schemas](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/update-tool-schemas.ts)
- [CLI parser](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/cli.ts), [CLI service adapters](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/db-store.ts), [CLI integration test](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/test/cli.test.ts)
- [Web route boundary](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts), [networking display](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/NetworkingBoard.tsx)

## Related documents

- [Networking](../capabilities/networking.md)
- [Interaction](../domain/interactions.md)
- [Interaction Architecture](../architecture/interactions.md)
