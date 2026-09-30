---
type: interface
scope: networking
summary: Networking board, people API, agent tools, CLI commands, and mutation/query contracts.
load_when:
  - calling person or Gig-person operations
  - changing networking surface behavior
related:
  - capabilities/networking.md
  - architecture/networking.md
  - domain/networking.md
---
# Networking Interfaces

## Web Surface

`GET /api/people` returns the active person list with derived fields and document/interaction summaries. There is no dedicated person mutation route in the current web handler. The Networking workspace consumes this list and presents read-only cards/detail.

Initial board priority is high; Clear changes it to all priorities. Search covers name, company, title, and whyInteresting. First-tranche filtering requires tag `profile-enrichment-batch-1`. Paused/do-not-contact records are always excluded from board lanes. Summary metrics use all actionable records, while lane counts use filtered records. Cards sort by priority then name. The drawer opens the LinkedIn URL externally and shows relationship/contact context; it is not a profile-document editor.

## Agent Tools

| Tool | Contract |
| --- | --- |
| `list_people` | Status, priority, relationship-strength, text, and pagination filters; returns complete person records. |
| `get_person` | Exact durable ID; enriches the person with Gig IDs and role types by paging through relationship records. |
| `create_person` | Explicit person mutable fields, including full nested relationship object; nullable optional values are supplied as null. Stable ID/change identity comes from the tool call. |
| `update_person` | `{id, changes}` with explicit field-path set/clear operations. |
| `list_gig_person_relationships` | Any-of gigIds, personIds, role values, and pagination. |
| `get_gig_person_relationship` | Exact relationship ID; returns validated links or structured error. |
| `create_gig_person_relationship` | gigId, personId, role, and nullable notes; tool-derived stable ID. |

No person delete/merge or Gig-person update/delete tool is registered. Managed profile documents use the shared document tools with a Person owner, not a person-field mutation.

## CLI

```text
gig-finder people get <id>
gig-finder people list
gig-finder people add <id> --patch-file <path> [--dry-run]
gig-finder people update <id> --patch-file <path> [--date YYYY-MM-DD] [--dry-run]
gig-finder gig-people add <id> --patch-file <path> [--dry-run]
```

Inline `--patch` JSON is also accepted. The Gig-person patch must include an ID matching the command ID, gigId, personId, relationship, and notes. Its add branch uses validated `createNew`. Do not infer supported Gig-person get/list/update/delete commands from the generic parser alias: explicit useful routing is implemented for add only. People list returns the unpaginated service list rather than agent-query filters.

## Shared Input and Query Contract

Person patches accept name, company, title, linkedInProfileUrl, connectedOn, nested relationship, priority, status, whyInteresting, notes, and tags. Nullable values can clear company/title/LinkedIn URL/connection date/introducer/relationship notes/why-interesting. Lists can be set empty. Read-only contact/profile/document fields and IDs are not patchable. Nested relationship objects merge; arrays replace. Empty and unknown-field patches fail validation.

Service `createNew` accepts partial inputs with defaults but still requires a valid name. A repeated creation change ID is replayed only when entity type, ID, and payload fingerprint match; otherwise it raises revision conflict. Successful mutations return `{record, changeId}`; dry-run uses null change ID. Updates have no caller expectedRevision field: service reads the current persistence revision before applying the update.

People query combines status/priority/strength/text filters, sorts priority then name then ID, and returns items/page. Page offset is nonnegative; limit is 1–50, default 20. Relationship query sorts Gig ID, Person ID, role, ID and returns structured ok/not-found/consistency results at its relevant read boundaries. People structured read returns ok/not_found. Authentication and general agent access remain application-wide concerns; these contracts add no separate networking authentication mechanism.

## Source Evidence

- [People schema](../../gig-finder/src/core/people.ts), [role schema](../../gig-finder/src/core/gig-people.ts), [services](../../gig-finder/src/core/services.ts)
- [Board](../../gig-finder/src/web/client/NetworkingBoard.tsx), [HTTP handler](../../gig-finder/src/web/request-handler.ts)
- [Agent registry and schemas](../../gig-finder/src/agent/gig-finder-tools.ts), [set/clear schema](../../gig-finder/src/agent/update-tool-schemas.ts)
- [CLI parser](../../gig-finder/src/cli/cli.ts), [CLI service bindings](../../gig-finder/src/cli/db-store.ts), [pagination](../../gig-finder/src/core/queries.ts)
