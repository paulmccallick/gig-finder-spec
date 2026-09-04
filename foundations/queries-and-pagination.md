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
- Do not mutate product data while listing, filtering, or reading.

## Failure and retry implications

Invalid ranges or unsupported values fail visibly. Continue pagination with the returned next offset; if data changes between pages, restart when a stable full snapshot matters.

## Observable consequences

Agent result pages expose counts and offsets. UI filtering changes only presentation and does not alter stored records.

## Used by

- [Browse opportunities](../workflows/opportunities/browse-opportunities.md)
- [Browse people](../workflows/networking/browse-people.md)
- [Browse tasks](../workflows/tasks/browse-tasks.md)
- [Browse interactions](../workflows/interactions/browse-interactions.md)
- [Discover and read documents](../workflows/documents/read-documents.md)
- [Inspect Scout runs](../workflows/scout/run-scout.md)
