---
id: gig-scout
title: Gig Scout
aliases: [Scout, sourcing scan, discovered position]
---

# Gig Scout

## Purpose and boundary

Lets the candidate scan configured company career sources, process descriptions, screen relevance and candidate match, review discovered positions, and promote chosen positions into canonical Gigs. Company-source configuration/import is operational input, not a dashboard workflow or public API.

## Vocabulary

| Term | Meaning here |
|---|---|
| run | Durable full-company scan with immutable search-profile snapshot. |
| position | Durable discovered posting observation and its processing/review state. |
| pursue | Review decision that promotes to a new or exact existing Gig. |
| relevance criteria | Versioned instructions and threshold used by Scout screening. |

## Workflows

| Workflow | Use when | Document |
|---|---|---|
| Run Scout | Start and inspect a scan | [Open](../workflows/scout/run-scout.md) |
| Configure relevance | Save screening criteria and threshold | [Open](../workflows/scout/configure-relevance.md) |
| Review and promote | Decide, defer, resolve identity, or retry promotion | [Open](../workflows/scout/review-and-promote.md) |

## Shared foundations

- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)
- [Managed-document integrity](../foundations/managed-document-integrity.md)

## Evidence pointers (optional)

- Implementation areas: `src/core/scout/`, `src/operations/scout-runtime.ts`, `src/data/scout-run-store.ts`, `src/web/client/GigScoutPage.tsx`, `src/web/client/ScoutPositionReview.tsx`
- Test suites: `src/core/scout/engine/test/`, `src/data/test/scout-run-store.test.ts`, `src/web/e2e/gig-scout.e2e.ts`
