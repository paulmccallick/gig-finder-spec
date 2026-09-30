---
type: interface
scope: networking
summary: How to read and change contacts and opportunity roles through the board, API, assistant, and command line.
load_when:
  - calling person or Gig-person operations
  - changing networking surface behavior
---
# Networking Interfaces

## Purpose

Use these interfaces to keep contacts current and connect them to opportunities. [Networking behavior](../capabilities/networking.md) explains the user purpose; the [domain reference](../domain/networking.md) defines status, priority, and role values. [Implementation details](../architecture/networking.md) cover storage and consistency limits.

## Web Surface

`GET /api/people` returns the active person list with derived fields and document/interaction summaries. There is no dedicated person mutation route in the current web handler. The Networking workspace consumes this list and presents read-only cards/detail.

Initial board priority is high; Clear changes it to all priorities. Search covers name, company, title, and whyInteresting. The “First tranche only” checkbox selects contacts tagged `profile-enrichment-batch-1`; it does not calculate a group from priority or dates. Paused/do-not-contact records are always excluded from board lanes. Summary metrics use all actionable records, while lane counts use filtered records. Cards sort by priority then name. The drawer opens the LinkedIn URL externally and shows relationship/contact context; it is not a profile-document editor.

## Agent Tools

| Tool | Contract |
| --- | --- |
| `search_gigs_and_people` | Resolve company and person names to existing records before using durable IDs. |
| `list_people` | Status, priority, relationship-strength, text, and pagination filters; returns complete person records. |
| `get_person` | Exact durable ID; enriches the person with Gig IDs and role types by paging through relationship records. |
| `create_person` | Explicit person mutable fields, including full nested relationship object; nullable optional values are supplied as null. Stable ID/change identity comes from the tool call. |
| `update_person` | `{id, changes}` with explicit field-path set/clear operations. |
| `list_gig_person_relationships` | Any-of gigIds, personIds, role values, and pagination. |
| `get_gig_person_relationship` | Exact relationship ID; returns validated links or structured error. |
| `create_gig_person_relationship` | gigId, personId, role, and nullable notes; tool-derived stable ID. |

No person delete/merge or Gig-person update/delete tool is registered. Use the [document interfaces](api/documents-profile.md) to attach and edit profile documents with a Person owner. Use [contact history](../workflows/interactions-contact-history.md) when a last-contact date, method, or summary needs correction.

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

Service `createNew` accepts partial inputs with defaults but still requires a valid name. A repeated creation change ID is replayed only when entity type, ID, and payload fingerprint match; otherwise it raises revision conflict. The shared mutation service returns `{record, changeId}`; dry-run uses null change ID. Agent mutation tools add `status: ok`; the CLI returns the record in its command result and discards the service change ID. Updates have no caller expectedRevision field: service reads the current persistence revision before applying the update.

People query combines status/priority/strength/text filters, sorts priority then name then ID, and returns items/page. Page offset is nonnegative; limit is 1–50, default 20. Relationship query sorts Gig ID, Person ID, role, ID and returns structured ok/not-found/consistency results at its relevant read boundaries. People structured read returns ok/not_found. [Security and privacy](../requirements/security.md) define application-wide access. Networking adds no separate authentication mechanism or versioned contract.

## Source Evidence

- [People schema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/people.ts), [role schema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/gig-people.ts), [services](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/services.ts)
- [Board](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/NetworkingBoard.tsx), [HTTP handler](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts)
- [Agent registry and schemas](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts), [set/clear schema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/update-tool-schemas.ts)
- [CLI parser](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/cli.ts), [CLI service bindings](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/db-store.ts), [pagination](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/queries.ts)

## Related documents

- [Networking](../capabilities/networking.md)
- [Networking Architecture](../architecture/networking.md)
- [Networking Domain](../domain/networking.md)
