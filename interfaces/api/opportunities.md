---
type: interface
scope: opportunities
summary: Opportunity HTTP reads, agent/CLI mutations, and the internal posting-acceptance contract.
load_when:
  - changing Gig APIs, tools, CLI, or Scout handoff
  - comparing board and agent query semantics
---
# Opportunity Interfaces

These contracts expose [tracked opportunities](../../capabilities/opportunities.md) to the browser, conversational agent, command-line interface, and Scout. The [posting-review workflow](../../workflows/opportunities-posting-resolution.md) explains when a user choice is required; [architecture](../../architecture/opportunities.md) explains persistence and concurrency.

## HTTP and Browser
`GET /api/gigs` returns the complete list of current, nondeleted Gig records, including revision metadata, managed-document summaries, and interaction references. The response is a JSON array. It uses the service's unfiltered list rather than the agent's paginated query defaults. There are no query filters or Gig-specific write/detail endpoints here. Non-GET requests reaching this route return 405 with “Read-only API”. The response and browser fetch both disable caching; the browser applies its own filters.

The dossier—the detail panel opened from a board card—uses `sourceUrl` directly for Apply / view posting. It selects the first job-description document sorted by ID, loads that summary's current version via the [document interface](documents-profile.md), and links the exact version. It shows loading, missing-document, and read-error states without loading a legacy file as a fallback. Evidence: [routing](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts), [list loader](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/data/gigs.ts), [board and dossier](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/App.tsx).

The endpoint defines no separate authentication mechanism or API version negotiation. Deployment access constraints are documented in [security](../../requirements/security.md).

## Agent Tools
[Tool contracts](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts) expose:

| Tool | Contract |
| --- | --- |
| `list_gigs` | Accepts optional stage, outcome, and fit lists; overdue flag; text query; offset; and limit. The tool represents omitted filters as null. Returns records in `items` and pagination details in `page`. |
| `get_gig` | Accepts an exact record ID. Returns `{status:"ok",record}` or `{status:"not_found",id}`. |
| `create_gig` | Complete Gig input; unknown optional values are supplied as null. The Gig ID and change ID derive from the tool call ID. Tool instruction requires explicit user confirmation and prior duplicate resolution. |
| `update_gig` | Exact ID plus nonempty explicit set/clear operations. The caller cannot supply an expected record revision. |
| `search_gigs_and_people` | Finds existing Gigs and people by name; search limits are documented in [document interfaces](documents-profile.md#agent-tools). |

With no meaningful filters, `list_gigs` selects only `applied`, `recruiter_contact`, `screening`, and `technical_interview`. Supplying a meaningful filter with no explicit stages searches all stages. Pagination alone or `overdueOnly:false` does not broaden the stage selection. The default offset is 0 and limit is 20; permitted limits are 1–50.

Text search matches company, title, status summary, or next-action description. Results sort by overdue first, earliest due date, most recent activity, company, then ID. There is no availability filter. Evidence: [GigDomainService](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/gig-domain-service.ts), [query definitions](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/queries.ts).

Update operations name a field or nested field, such as `fit.rating`. To remove an optional value, use `{operation:"clear",field,value:null}`. `set` requires a nonnull value accepted by the field schema. Naming the same field twice, or naming both an object and one of its fields, is rejected. The complete `nextAction` and `payRange` objects can only be cleared through this tool. To set them, supply operations for their nested fields. Availability fields are excluded. See [operation schemas](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/update-tool-schemas.ts), [Gig input schema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/gigs.ts), and [deep merge](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/deep-patch.ts).

## CLI
The command-line interface (CLI) accepts `gigs` as an alias for `gig`.

| Command | Contract |
| --- | --- |
| `get <id>` | Read one current Gig. |
| `list` | Read all current Gigs without pagination. |
| `add <id>` | Create a Gig from a JSON body whose ID matches the command ID. |
| `update <id>` | Apply a partial Gig input, retaining omitted fields. |
| `touch <id>` | Set activity date, stage, and status summary; optionally supply outcome, next-action text, and due date. |

Add and update require exactly one of `--patch` (inline JSON) or `--patch-file` (a JSON file). `--dry-run` validates the proposed record without saving it.

Touch clears the next action when closing a Gig. For a nonclosed Gig, supplying a due date without next-action text also clears the next action; it does not edit the date alone. Closing still requires a non-Pending outcome.

Exact flags and response formats are defined in the [CLI](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/cli.ts) and [adapter](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/db-store.ts). Creation uses the duplicate-checking `createNew` service and fills omitted extended role details with null.

## Internal Posting and Availability Ports
These are internal service methods, not public HTTP endpoints. A normalized position is a Scout posting converted to a common structure containing company, title, URL, and source details. A review fingerprint identifies the posting and matching records at one point in time; a revision is the saved Gig record version.

`resolvePosting(normalizedPosition)` returns a fingerprint and matching candidates. `acceptPosting(context, posting, resolution?)` returns one of these results:

| Status | Meaning |
| --- | --- |
| `created` | A new Gig was accepted; includes the Gig. |
| `updated` | An existing Gig was accepted; includes the Gig. |
| `resolution_required` | Matches need review; includes the fingerprint and candidates. |
| `resolution_stale` | Reviewed data changed; includes a new fingerprint and candidates. |
| `resolution_invalid` | The chosen Gig was outside the matching set. |

The reviewed choice is `{kind:"create_new",reviewedFingerprint}` or `{kind:"use_existing",reviewedFingerprint,gigId,expectedGigRevision}`. Fingerprints are 64 lowercase hex characters and expected revisions positive integers. Candidate entries include match reasons, Gig revision, posting fields, stage/outcome, availability, activity, and selected job-description summary. See [types](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/gigs.ts) and [implementation](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/gig-domain-service.ts).

`setAvailability(context,id,"available"|"unavailable")` returns `record` and `changeId`; requesting the current value returns `changeId:null`. It cannot reset availability to `unknown`. This is called by [Scout run completion](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/runs.ts), not exposed as an ordinary Gig update field.

## Errors and Compatibility
An invalid resulting record or malformed input fails before saving. Ordinary creation reports `duplicate`; conflicting repeated operations or writes against an outdated revision report `revision_conflict`. Updating a missing Gig throws an error; `get_gig` instead returns `status:"not_found"`. Agent tools use the [shared tool error format](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts). No separate public compatibility policy is defined for these internal contracts.

## Related documents

- [Opportunities](../../capabilities/opportunities.md)
- [Review a Posting Before Adding or Updating a Gig](../../workflows/opportunities-posting-resolution.md)
- [Opportunity Architecture](../../architecture/opportunities.md)
