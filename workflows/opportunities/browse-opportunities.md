---
id: browse-opportunities
capability: opportunities
feature: opportunity-records
title: Browse and inspect opportunities
summary: Find current Gigs and inspect the complete record and linked description.
aliases: [view pipeline, search gigs, open opportunity]
requires: [../../foundations/queries-and-pagination.md, ../../foundations/dates-time-ordering.md]
related: [maintain-opportunity.md, ../networking/link-person-opportunity.md, ../documents/read-documents.md]
implementation_areas: [src/core/gig-domain-service.ts, src/web/client/App.tsx, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/read-services.test.ts, src/web/e2e/gig-board.e2e.ts, src/agent/test/gig-finder-tools.test.ts, src/cli/test/cli.test.ts]
---

# Browse and inspect opportunities

## Intent

The candidate wants to understand the pipeline, find an opportunity, or inspect its current status without changing it.

## Access points

- Dashboard Opportunities workspace; see [UI differences](../../variants/opportunities/browse-opportunities-ui.md).
- Agent tools `search_gigs_and_people`, `list_gigs`, and `get_gig`; see [agent-tool differences](../../variants/opportunities/browse-opportunities-agent-tool.md).
- CLI `gig-finder gigs list|get <id>`; see [CLI differences](../../variants/opportunities/browse-opportunities-cli.md).

## Preconditions

The application has a readable data store. An exact detail read requires a durable Gig ID obtained from a supported result.

## Workflow

1. The actor chooses a view or supplies filters. Listing returns current non-deleted Gigs only.
2. The system applies supported filters and deterministic ordering for that surface.
3. The actor selects or resolves an exact Gig. The detail includes core identity, pipeline stage/outcome, status summary, last activity, next action, fit, pay, source URL, availability, posting metadata, tags, document summaries, and Interaction references when composed successfully.
4. If a job-description summary exists, the actor may load its exact current version through the document workflow.

## Decisions and variants

| Condition | Result |
|---|---|
| Stage is not `closed`, outcome is `pending`, availability is not `unavailable` | Dashboard Active view. |
| Availability is `unavailable` while otherwise active | Dashboard Unavailable view, independent of stage/outcome. |
| Stage is `closed` with outcome `rejected`, `not_pursuing`, `role_pulled`, or `no_response` | Dashboard Archive in the like-named group. |
| Stage is `closed` with `accepted`, `withdrawn`, `position_filled`, `on_hold`, `stale_or_unverified`, or any other persisted outcome | Dashboard Archive in `other`. |
| Next-action due date is before Pacific today on an active Gig | Displayed as overdue. |

## State changes

None. Opening an external posting or managed document also leaves Gig state unchanged.

## Outputs and observable effects

Dashboard cards show company, title, fit, optional pay, action due signal, and last activity; the drawer adds full supported details and the canonical posting link. Agent and CLI reads return structured records with durable identifiers.

## Safety rules

Browsing never marks a posting available/unavailable, advances stage, or updates last activity. A source URL opens outside the app and is not an application action.

## Failure, retry, and recovery

Dashboard load failure replaces the workspace with a data-fault view. A missing exact ID returns not-found/fails the CLI. Invalid persisted structure may yield a consistency error. Retry after correcting availability of the data store; do not infer missing fields.

## Current limitations

- The dashboard is explicitly read-only; all Gig changes occur through agent tools, CLI, or Scout promotion.
- The drawer selects the first job-description summary by document ID, not by recency across multiple descriptions.
- Dashboard search covers company, title, and status-oriented fields; agent search also covers next action. UI and agent filter sets are intentionally different.

## Related specifications

- [Maintain an opportunity](maintain-opportunity.md)
- [Read documents](../documents/read-documents.md)
- [Review and promote Scout positions](../scout/review-and-promote.md)
