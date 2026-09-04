---
id: maintain-opportunity
capability: opportunities
title: Create or maintain an opportunity
summary: Create a complete Gig or change explicit mutable fields while preserving unrelated state.
aliases: [add gig, update gig, touch gig]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md, ../../foundations/agent-consent-and-privacy.md]
related: [browse-opportunities.md, ../scout/review-and-promote.md]
implementation_areas: [src/core/gigs.ts, src/core/gig-domain-service.ts, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/services.test.ts, src/core/test/input-contracts.test.ts, src/agent/test/gig-finder-tools.test.ts, src/cli/test/cli.test.ts]
---

# Create or maintain an opportunity

## Intent

The candidate wants one durable pipeline record created or wants explicit fields of an existing record changed without losing other details.

## Access points

Agent tools `create_gig` and `update_gig`, with separate bounded [create](../../variants/opportunities/maintain-opportunity-agent-tool.md) and [update](../../variants/opportunities/update-opportunity-agent-tool.md) variants; CLI `gigs add`, `gigs update`, and shorthand `gigs touch`, with [CLI differences](../../variants/opportunities/maintain-opportunity-cli.md). There is no dashboard editor.

## Preconditions

Agent creation requires duplicate resolution and explicit confirmation. Update requires an exact existing Gig ID. A create supplies all contract fields; CLI add also requires its JSON ID to match the command ID.

## Workflow

1. Resolve possible existing records by company/person search or Gig listing. Core creation rejects an exact external-job-ID duplicate or a case-insensitive trimmed company-and-title duplicate.
2. Establish the intended complete creation or explicit field patch. Arrays replace; nested objects deep-merge in core patch flows; null clears only nullable fields.
3. For agent use, present the friendly effect and obtain confirmation.
4. Validate dates, enum values, URLs, compensation, and stage/outcome consistency.
5. Commit one audited mutation and return the complete current Gig plus change identity.

## Decisions and variants

- Every stage other than `closed` requires outcome `pending`; `closed` accepts any defined non-pending outcome and requires `nextAction: null`.
- Compensation, when present, uses USD and period `hour` or `year`; numeric bounds are nonnegative and minimum cannot exceed maximum.
- Agent operations always include `operation`, `field`, and `value`: `set` requires a non-null value valid for that exact field; `clear` requires null. Duplicate paths and a whole-object path combined with one of its nested paths are rejected. Whole `nextAction`/`payRange` are clear-only. Clearable paths are `externalJobId`, `nextAction`, `nextAction.due`, `fit.summary`, `payRange`, `payRange.minimum`, `payRange.maximum`, `payRange.notes`, `sourceUrl`, `location`, `workArrangement`, `postedDate`, `businessUnitTeam`, `recruiterSource`, `bonus`, `equity`, and `otherCompensation`.
- All operations are first assembled into one patch and the final merged Gig is validated; intermediate operation order has no separate validation effect. A nested leaf merges into an existing object. When its current parent is null, the partial parent lacks required siblings and fails final validation (`nextAction` needs description and due; `payRange` needs currency, minimum, maximum, period, and notes). Because whole-object set is prohibited, first establishing either object through agent update is currently unsupported; agent creation or CLI whole-object patch can establish it.
- CLI `touch` updates activity date, stage, status summary, and optional outcome/next action/due in one write.

## State changes

Creation establishes revision 1. Update advances the record revision and audit history. Existing documents, interactions, availability, and unspecified Gig fields are retained.

## Outputs and observable effects

The result identifies the complete Gig and change ID. Subsequent dashboard refresh moves the card to the lane/view implied by stage, outcome, and availability.

## Safety rules

IDs, revisions, availability fields, and metadata are not mutable through the general patch contract. Do not use a new Gig creation to avoid resolving a likely duplicate. Agent responses confirm friendly company/title details rather than exposing raw IDs.

## Failure, retry, and recovery

Invalid or contradictory input fails atomically. JSON Schema captures the wire-representable constraints; the domain validation performed during execution additionally rejects impossible calendar dates, malformed URLs, inverted pay, and cross-field stage/outcome/action contradictions. Missing IDs return not-found. Agent update has no caller-supplied expected revision, but a concurrent database revision change can still conflict. A conflicting system-supplied idempotency identity reports a revision conflict. CLI `--dry-run` validates and returns a projected record without durable change. Reinspect state before retrying after uncertain delivery.

Agent error mapping is: domain/schema validation to `validation_failed`; a missing Gig message to `not_found`; mutation codes such as `duplicate`, `duplicate_change`, or `revision_conflict` retain that code; persistence composition faults map to `consistency_error`; unclassified exceptions map to `tool_failed` with a generic message.

## Known current behavior and limitations

- Direct general Gig edits do not expose availability; Scout owns posting-observation updates.
- Agent create requires every defined mutable field, including nullable/empty values, making it more verbose than CLI creation.
- Agent confirmation and the tool-call-derived change/idempotency identity are conversation/runtime protocol, not fields in the tool input schema.
- No temporal ordering is enforced among valid activity, posted, and due calendar dates.
- Any syntactically valid absolute URL accepted by the runtime URL validator is allowed; no HTTP-only or canonicalization rule is added. A successful update writes an audit change and advances revision even when requested values equal current values.
- No dashboard create/edit form exists.

## Related workflows

- [Browse opportunities](browse-opportunities.md)
- [Review and promote Scout positions](../scout/review-and-promote.md)
