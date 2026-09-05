---
id: opportunity-records
capability: opportunities
title: Opportunity records
summary: Track one role's identity, pipeline state, fit, activity, action, compensation, source, and supporting details.
aliases: [Gig, pipeline role, tracked opportunity]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md, ../../foundations/dates-time-ordering.md]
workflows: [../../workflows/opportunities/browse-opportunities.md, ../../workflows/opportunities/maintain-opportunity.md]
operational_models: []
quality_scenarios: []
variants: [../../variants/opportunities/browse-opportunities-ui.md, ../../variants/opportunities/browse-opportunities-agent-tool.md, ../../variants/opportunities/browse-opportunities-cli.md, ../../variants/opportunities/maintain-opportunity-agent-tool.md, ../../variants/opportunities/update-opportunity-agent-tool.md, ../../variants/opportunities/maintain-opportunity-cli.md]
contracts: [../../contracts/operations/search_gigs_and_people.schema.json, ../../contracts/operations/list_gigs.schema.json, ../../contracts/operations/get_gig.schema.json, ../../contracts/operations/create_gig.schema.json, ../../contracts/operations/update_gig.schema.json]
implementation_areas: [src/core/gigs.ts, src/core/gig-domain-service.ts, src/web/client/App.tsx, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test, src/web/e2e/gig-board.e2e.ts, src/agent/test, src/cli/test]
---

# Opportunity records

## Purpose and boundary

A Gig is the canonical durable record for one job opportunity. It owns company/title identity; optional requisition and posting details; pipeline stage and outcome; status/activity; one optional next action; fit; compensation; source URL; and tags. People, relationships, tasks, interactions, documents, posting availability, and Scout acquisition are linked features rather than embedded substitutes.

## Access points

The dashboard browses and inspects Gigs but does not edit them. Strict agent tools and the supported CLI read, create, and update records. Scout promotion may create a Gig or update only its posting-owned fields through the Scout feature.

## Configuration and defaults

Supported CLI and strict-agent creation both require the complete declared Gig input: nullable and collection fields must be supplied as null or empty arrays rather than omitted. A new Scout-promoted Gig starts at stage `identified`, outcome `pending`, fit `tbd`, status “Promoted from Gig Scout,” and otherwise empty candidate-maintained optional fields. Calendar interpretation uses Pacific time where “today” is needed.

## Durable state and lifecycle

Creation establishes revision 1. Supported stages are `identified`, `applied`, `recruiter_contact`, `screening`, `technical_interview`, `final_round`, `offer`, `monitoring`, and `closed`. Outcomes are `pending`, `accepted`, `rejected`, `withdrawn`, `not_pursuing`, `role_pulled`, `no_response`, `position_filled`, `on_hold`, and `stale_or_unverified`. Fit ratings are `strong`, `good`, `stretch`, `long_shot`, `weak`, `poor`, `support`, `tbd`, and `not_applicable`. Every non-closed stage pairs with `pending`; `closed` pairs with any listed non-pending outcome and no next action. Each successful general update appends audit history and advances revision, including a same-value update. Documents, interactions, relationships, and posting availability remain independently durable.

## Validation and invariants

Company, title, stage, outcome, status summary, activity date, fit rating, and tags form the required record contract. Dates must be real calendar dates. Source URLs must be syntactically valid absolute URLs but need not use HTTP. Compensation is USD per hour or year, uses nonnegative bounds, and cannot have minimum above maximum. General mutation cannot set IDs, revision/metadata, availability, or availability timestamp. Exact requisition duplicates and case-insensitive trimmed company/title duplicates are rejected on core creation.

## Outputs and downstream effects

Reads return complete current state plus linked document and Interaction summaries when composition succeeds. Dashboard placement derives from stage/outcome and posting availability. Opportunity identity and current revision feed relationship links, tasks, interactions, managed documents, and Scout resolution fingerprints.

## Failure, retry, and recovery

Invalid final state fails atomically. Missing IDs return not-found; persistence composition faults surface as consistency errors; concurrent revision change can conflict. CLI dry-run validates and projects without persistence. After uncertain delivery, reread the exact Gig before retrying.

## Current limitations

There is no dashboard editor or supported Gig deletion. General agent leaf updates cannot establish a currently null next-action or pay-range object because required sibling fields are absent and whole-object set is not exposed. No temporal ordering is enforced among otherwise valid posted, activity, and due dates.

## Detailed specifications

- [Browse and inspect opportunities](../../workflows/opportunities/browse-opportunities.md)
- [Create or maintain an opportunity](../../workflows/opportunities/maintain-opportunity.md)
- Surface differences and strict contracts are linked in front matter; load only the invoked surface/operation.
