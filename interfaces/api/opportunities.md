---
type: interface
scope: opportunities
summary: Opportunity HTTP reads, agent/CLI mutations, and the internal posting-acceptance contract.
load_when:
  - changing Gig APIs, tools, CLI, or Scout handoff
  - comparing board and agent query semantics
related:
  - capabilities/opportunities.md
  - workflows/opportunities-posting-resolution.md
  - architecture/opportunities.md
---
# Opportunity Interfaces

## HTTP and Browser
`GET /api/gigs` returns the complete list of current, nondeleted Gig records, including revision metadata, managed-document summaries, and interaction references. It uses the service's unfiltered list, not paged query defaults. There are no query filters or Gig-specific write/detail endpoints here. Non-GET requests reaching this route return 405 with “Read-only API”. The browser loads the list with no-store fetch and filters locally.

**OPP-API-001** The dossier uses `sourceUrl` directly for Apply / view posting. It selects the first job-description document sorted by ID, loads that summary's current version via the [document interface](documents-profile.md), and links the exact version. It shows loading, missing-document, and read-error states without substituting legacy artifacts. Current route, list loader, board, and dossier references are in [IMPLEMENTATION_MAP.md](../../IMPLEMENTATION_MAP.md#opp-api-001).

The endpoint has no separate opportunity-specific authentication mechanism or API version negotiation. Application-wide security owns the deployment boundary.

## Agent Tools
**OPP-API-002** Agent tools expose the following contracts. Current tool-registration references are in [IMPLEMENTATION_MAP.md](../../IMPLEMENTATION_MAP.md#opp-api-002).

| Tool | Contract |
| --- | --- |
| `list_gigs` | Nullable stage/outcome/fit lists, overdue flag, query, offset, limit. Returns full current records and pagination. |
| `get_gig` | Exact durable ID; returns ok/record or not_found/ID. |
| `create_gig` | Complete shared Gig input, nullable unknown fields. ID and change identity derive from tool call. Tool instruction requires explicit user confirmation and prior duplicate resolution. |
| `update_gig` | Exact ID plus nonempty explicit set/clear operations. There is no caller expectedRevision argument. |
| `search_gigs_and_people` | Resolves names to durable records; bounded context search is documented with [document interfaces](documents-profile.md#agent-tools). |

**OPP-API-003** Unfiltered `list_gigs` defaults to applied, recruiter_contact, screening, technical_interview. Supplying a meaningful filter with no explicit stages searches all stages. Pagination alone or overdue false does not broaden stages. Default offset/limit are 0/20; limit is 1–50. Query matches company, title, status summary, next-action description. Sort: overdue first, earliest due, descending last activity, company, ID. Availability has no query filter. Current service and query references are in [IMPLEMENTATION_MAP.md](../../IMPLEMENTATION_MAP.md#opp-api-003).

**OPP-API-004** Update operations use field paths; nullable values clear with `{operation:"clear",field,value:null}`. Set requires a nonnull schema-valid value. Duplicate paths and parent/child overlaps are rejected. Whole nextAction/payRange can only be cleared; set nested fields instead. Availability fields are excluded. Current operation, input, and merge references are in [IMPLEMENTATION_MAP.md](../../IMPLEMENTATION_MAP.md#opp-api-004).

## CLI
`gigs` aliases `gig`. `get` and `list` read current records; list is unpaginated. `add <id>` accepts a JSON patch/body whose ID must equal the command ID. `update <id>` applies shared partial Gig input. `touch <id>` requires date, stage, summary and can supply outcome, next action, and due date. Touch clears next action when closing. For nonclosed touch, supplying a due date without next-action text clears the next action rather than editing its date alone. `--dry-run` validates a candidate without committing it.

**OPP-API-005** Exact JSON/file flags and output envelopes belong to the CLI parser and adapter. CLI creation delegates to the same duplicate-checking creation path; it fills omitted extended role details with null. Current references are in [IMPLEMENTATION_MAP.md](../../IMPLEMENTATION_MAP.md#opp-api-005).

## Internal Posting and Availability Ports
**OPP-API-006** Posting resolution returns a fingerprint and candidates. Acceptance returns created, updated, resolution_required, resolution_stale, or resolution_invalid. Resolution is either create-new with the reviewed fingerprint or use-existing with the reviewed fingerprint, Gig ID, and expected Gig revision. Fingerprints are 64 lowercase hex characters and expected revisions positive integers. Candidate entries include match reasons, Gig revision, posting fields, stage/outcome, availability, activity, and selected job-description summary. Current types and service references are in [IMPLEMENTATION_MAP.md](../../IMPLEMENTATION_MAP.md#opp-api-006).

**OPP-API-007** Availability changes return record/changeId; repeating the current value returns null changeId. The operation accepts no unknown reset and is called by Scout run completion, not exposed as an ordinary Gig update field. Current implementation references are in [IMPLEMENTATION_MAP.md](../../IMPLEMENTATION_MAP.md#opp-api-007).

## Errors and Compatibility
Invalid final state/schema fails before mutation. Ordinary creation reports `duplicate`; inconsistent replay or optimistic write conflicts report `revision_conflict`. Missing direct-update targets throw an error, while read returns a tagged not-found result. Tool wrappers supply their shared error envelopes. No separate public compatibility policy is defined for these internal contracts.
