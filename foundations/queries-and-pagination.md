---
id: queries-and-pagination
title: Queries and pagination
summary: List operations apply explicit filters, deterministic ordering, and bounded pages.
aliases: [list filter, page, search]
---

# Queries and pagination

## Scope

Applies to agent list tools and Scout/UI list controls where described by their workflows. It does not make internal HTTP routes public APIs.

## Canonical rule

Omitted filters do not narrow results. Agent text queries are trimmed and case-insensitive. Agent pages default to offset 0 and limit 20; limits are 1 through 50. Page results report total, offset, limit, and a null or numeric next offset.

## Required behavior

- Multiple values within a filter use inclusive-any matching; different filter categories are combined.
- Exact detail reads distinguish `not_found` from invalid or inconsistent stored records.
- Search results retain durable IDs for subsequent exact reads and mutations.

## Prohibited behavior

- Do not treat an empty page beyond the end as evidence that no records exist globally.
- Do not mutate product data while listing, filtering, or reading unless the owning feature explicitly declares a due-time transition on read. Scout position listing is the current exception: it first records system restoration of due deferred positions and increments their revisions.

## Failure and retry implications

Invalid ranges or unsupported values fail visibly. Continue pagination with the returned next offset; if data changes between pages, restart when a stable full snapshot matters.

## Observable consequences

Agent result pages expose counts and offsets. UI filtering ordinarily changes only presentation. Scout position listing additionally makes each due `deferred` position durably `needs_user_review` before producing the page.

## Used by

- [Opportunity records](../features/opportunities/opportunity-records.md)
- [People](../features/networking/people.md)
- [Task tracking](../features/tasks/task-tracking.md)
- [Interaction history](../features/interactions/interaction-history.md)
- [Managed documents](../features/documents/managed-documents.md)
- [Discovery runs](../features/scout/discovery-runs.md)
