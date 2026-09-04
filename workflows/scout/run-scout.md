---
id: run-scout
capability: gig-scout
title: Run and inspect Gig Scout
summary: Start one durable full-company scan and inspect source, processing, and discovered-position outcomes.
aliases: [scan jobs, Scout run, sourcing run]
requires: [../../foundations/queries-and-pagination.md]
related: [configure-relevance.md, review-and-promote.md]
implementation_areas: [src/core/scout/engine/runs.ts, src/core/scout/engine/scan-company.ts, src/data/scout-run-store.ts, src/web/client/GigScoutPage.tsx]
test_suites: [src/core/scout/engine/test/runs.test.ts, src/core/scout/engine/test/scan-company.test.ts, src/data/test/scout-run-store.test.ts, src/web/e2e/gig-scout.e2e.ts]
---

# Run and inspect Gig Scout

## Intent

The candidate wants configured companies scanned for positions using optional run-specific search terms/locations, then wants to inspect durable outcomes.

## Access points

Gig Scout Run history view.

## Preconditions

Scout runtime and company/source configuration are available. Only one active full run may be created under the singleton guard.

## Workflow

1. Enter comma-separated search terms and locations; whitespace is trimmed and empty entries removed.
2. Start a full run. The system snapshots the resulting neutral run search profile and immutable source configuration, queues company work, and returns accepted run state.
3. The UI selects the run and polls run history about every two seconds.
4. Company/source attempts acquire listing/detail data, reconcile normalized positions, and durably process descriptions, relevance, and candidate match.
5. Inspect run status, counts, company/source diagnostics, search-profile snapshot, and paginated positions filtered by company/text.

## Decisions and variants

Source outcomes explicitly distinguish complete, partial, failed, and other durable statuses. Duplicate observations normalize/reconcile rather than automatically duplicating positions. An advertised next page with an empty page is not accepted as verified success.

## State changes

Creates run, company/source work, attempt evidence, immutable search snapshot, position observations, descriptions, and evaluation state. Redelivery of terminal work is idempotent. Scanning alone does not mutate canonical Gigs or their availability.

## Outputs and observable effects

Run history survives navigation/reopen, including empty completed runs. The UI exposes source status, counts, errors/diagnostics, and discovered position rows with pagination.

## Safety rules

Use only configured source methods and bounded request plans. Sanitize authentication material in logs. Keep source evidence immutable and do not promote until explicit review.

## Failure, retry, and recovery

Start/load failures display an error. Persisted work can resume/reconcile after interruption; terminal redelivery does not duplicate history. Individual source failure can yield a partial run rather than erasing successful sources.

## Known current behavior and limitations

Run start is available only in the dashboard, not the supported root CLI or agent tools. Polling is periodic rather than push-based. Search-profile fields are free-text lists; company selection comes from preconfigured/imported operational data.

## Related workflows

- [Review and promote positions](review-and-promote.md)
