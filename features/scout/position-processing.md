---
id: position-processing
capability: gig-scout
title: Position description and screening pipeline
summary: Acquire authoritative descriptions, evaluate relevance, score candidate match, and project review state through durable staged work.
aliases: [position pipeline, Scout screening, description acquisition]
requires: [company-sources.md, relevance-configuration.md]
workflows: []
operational_models: [../../operational-models/scout/position-processing.md]
quality_scenarios: [../../quality-scenarios/scout/low-confidence-relevance.md, ../../quality-scenarios/scout/position-queue-restart.md]
variants: []
contracts: []
implementation_areas: [src/core/scout/engine/positions.ts, src/core/scout/engine/screening.ts, src/core/scout/sourcing/detail-descriptions.ts, src/operations/scout-position-runtime.ts, src/data/scout-run-store.ts]
test_suites: [src/core/scout/engine/test, src/data/test/scout-run-store.test.ts, src/agent/test/scout-position-screening.test.ts, src/operations/test/scout-runtime.integration.test.ts]
---

# Position description and screening pipeline

## Purpose and boundary

This feature turns an accepted discovery observation into durable authoritative description evidence, a narrow relevance decision, a separate candidate-match score, and a reviewable cross-run position. It does not resolve existing-Gig duplicates or choose whether the candidate should pursue.

## Access points

Processing is automatic after accepted observations, relevance changes, or operator reprocessing. The review UI observes stage/status/failure/evidence but does not manually step the pipeline. No strict agent tool/root CLI/public API drives stages.

## Configuration and defaults

Work binds exact observation, source configuration/settings, listing content hash, canonical URL/title/location, converter version, relevance criteria/threshold/prompt/model, and candidate profile/rubric/model identity. Normal discovery reuses a captured listing description; otherwise configured authoritative detail acquisition runs. Explicit backfill always refetches detail.

## Durable state and lifecycle

Each cross-run position projects state `processing`, `needs_user_review`, `irrelevant`, `rejected`, `deferred`, or `promoted`; a new position starts `processing` at revision 1. Durable stage order is `reconcile_gig`, `acquire_description`, `screen_relevance`, then `score_candidate_match`; each work item is pending/completed/failed/superseded. Semantic input identities reuse exact results and supersede obsolete unfinished work. Scheduling/ordinary intermediate completion does not change position state/revision. Confident relevance failure projects agent-owned irrelevant and increments revision; low-confidence failure continues; successful match scoring makes an unlinked position reviewable and increments revision even if it already projects review. Explicit position backfill suppresses those changes when preserving a current user-origin decision. Relevance configuration save is an explicit revision-incrementing transition from any unlinked described state—including user states and `rejected`—to processing.

## Validation and invariants

Authoritative detail is HTTPS, no-redirect, at most 1 MB, content-type checked, nonempty, and bound to ID/title evidence. Ambiguous/mismatched content fails. Normalized Markdown is at most 200,000 characters with immutable converter identity. Relevance is only an exclusion gate. Candidate match is integer 1–10 with explanation and makes no action recommendation.

## Outputs and downstream effects

Durable evidence includes content-addressed artifacts/hashes, description acquisitions, processing/outbox rows, failures, criteria/rubric/profile/model identities, relevance evidence/ambiguities/confidence, candidate score/explanation, token counts, and latency. Current projections power review filters/detail; all evidence remains available for stale-review checks and reprocessing.

## Failure, retry, and recovery

Position jobs use deterministic identities, three attempts, and one-second backoff. An exhausted stage becomes failed, schedules no downstream stage, and leaves the position projection and revision exactly unchanged. Reconciliation redispatches pending work but does not revive failed work. A later qualifying observation, criteria save, or backfill that requests the same semantic identity revives the failed row by clearing attempts/failure and returning its outbox to pending; changed input supersedes old unfinished work. A current user-origin projection is protected only during explicit position backfill; ordinary discovery processing and criteria save do not provide that protection.

## Current limitations

The `reconcile_gig` stage binds the observation but does not resolve duplicates; that occurs only at promotion. A description may validly reach 200,000 characters here but later exceed the 50,000-character managed-document promotion limit and make promotion fail. Persisted `rejected` is reserved/legacy, hidden from review reads, and has no user transition, but relevance configuration save currently moves it to processing.

## Detailed specifications

- [Position-processing operational model](../../operational-models/scout/position-processing.md)
- [Review and promotion](review-promotion.md)
