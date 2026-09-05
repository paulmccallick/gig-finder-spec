---
id: gig-scout
title: Gig Scout
aliases: [Scout, sourcing scan, discovered position]
---

# Gig Scout

## Purpose and boundary

Lets the candidate scan versioned official company sources, process authoritative descriptions, screen relevance and candidate match, review cross-run positions, and promote chosen positions into canonical Gigs. Operator backfill and company import have durable product effects but are not current candidate-facing UI/tool/CLI/public workflows.

## Vocabulary

| Term | Meaning here |
|---|---|
| run | Durable full-company scan with immutable search-profile snapshot. |
| position | Durable discovered posting observation and its processing/review state. |
| pursue | Review decision that promotes to a new or exact existing Gig. |
| relevance criteria | Versioned instructions and threshold used by Scout screening. |
| processing work | Durable semantic stage for observation binding, description, relevance, or candidate match. |
| backfill | Operator reprocessing bound to legacy run or exact position set. |

## Features

| Feature | Use when | Document |
|---|---|---|
| Company and official sources | Understand versioned companies, source contracts, and import behavior | [Open](../features/scout/company-sources.md) |
| Relevance configuration | Save criteria/threshold and roll the version into eligible processing | [Open](../features/scout/relevance-configuration.md) |
| Discovery runs and company work | Start/inspect scans, trust source outcomes, and aggregate/reconcile results | [Open](../features/scout/discovery-runs.md) |
| Position processing | Acquire descriptions, screen relevance, score match, and project review state | [Open](../features/scout/position-processing.md) |
| Review and promotion | Decide, defer, resolve identity, promote, or retry exact intent | [Open](../features/scout/review-promotion.md) |
| Position reprocessing | Understand durable legacy/explicit backfill and workflow protection | [Open](../features/scout/position-reprocessing.md) |

## Shared foundations

- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)
- [Managed-document integrity](../foundations/managed-document-integrity.md)

## Evidence pointers (optional)

- Implementation areas: `src/core/scout/`, `src/operations/scout-runtime.ts`, `src/data/scout-run-store.ts`, `src/web/client/GigScoutPage.tsx`, `src/web/client/ScoutPositionReview.tsx`
- Test suites: `src/core/scout/engine/test/`, `src/data/test/scout-run-store.test.ts`, `src/web/e2e/gig-scout.e2e.ts`
