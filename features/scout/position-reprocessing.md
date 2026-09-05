---
id: position-reprocessing
capability: gig-scout
title: Position backfill and reprocessing
summary: Reacquire authoritative evidence and replay screening for selected or legacy positions, with user-workflow preservation only for explicit position backfill.
aliases: [position backfill, reprocess positions, description repair]
requires: [company-sources.md, position-processing.md]
workflows: []
operational_models: [../../operational-models/scout/position-reprocessing.md]
quality_scenarios: [../../quality-scenarios/scout/backfill-atomic-start.md]
variants: []
contracts: []
implementation_areas: [src/core/scout/engine/positions.ts, src/core/scout/engine/scout-position-service.ts, src/data/scout-run-store.ts]
test_suites: [src/data/test/scout-run-store.test.ts, src/web/test/request-handler.test.ts]
---

# Position backfill and reprocessing

## Purpose and boundary

Backfill repairs legacy or explicitly selected positions by reacquiring authoritative descriptions and replaying relevance/match processing under exact durable bindings. It is operator-facing recovery machinery with product-visible evidence/outcomes, not a current candidate UI workflow.

## Access points

Private operator boundaries preview/start legacy or explicit backfill. They are not supported end-user UI, agent tool, root CLI, or public API. Candidate-visible review/history later reflects successful refreshed evidence.

## Configuration and defaults

Explicit start requires an array in which every entry is a valid exact position ID; duplicates are removed and the resulting unique set must contain 1–1,000 IDs. There is no separate pre-deduplication array-length limit, so more than 1,000 raw entries are accepted when they reduce to at most 1,000 unique valid IDs. The trimmed reason is 1–500 characters. Start snapshots exact items, latest observations, active source configurations/detail plans, candidate profile, screening model/provider/configuration, and request fingerprint. Legacy mode binds one full source run and a stable checkpoint.

## Durable state and lifecycle

Identical explicit requests reuse one run; newer explicit work supersedes older unfinished work for the same position. Each item refetches authoritative detail, reruns relevance/match, and may refresh the exact linked promoted job description. Final item outcomes are `agent_irrelevant`, `agent_irrelevant_to_review`, `needs_user_review`, `promoted`, `user_workflow_preserved`, `failed`, `unavailable`, or `superseded`. Run aggregation derives running/completed/partial/failed.

## Validation and invariants

Preview must resolve every requested position, observation, active configuration, configured detail acquisition, and description identity input. Any rejected item blocks the entire start. Explicit `position_backfill` stores fresh evidence without replacing a current user-origin projection or incrementing its position revision; its item ends `user_workflow_preserved`. Legacy backfill has no such preservation guard and may replace a user projection when screening completes. Later configuration changes do not alter a started explicit run.

## Outputs and downstream effects

Preview reports accepted/rejected plans and stable reasons. Durable per-item outcomes distinguish corrected/unchanged descriptions and workflow result. Promoted positions update the exact linked managed job description before item completion.

## Failure, retry, and recovery

Checkpoint/item state allows restart and bounded continuation. Failed/unavailable/superseded items determine partial/failed aggregation rather than erasing successful repairs. Exact request replay and deterministic processing avoid duplicate runs/work.

## Current limitations

No candidate-facing controls expose backfill. Legacy mode is scoped to one source run and can overwrite a user-owned projection; explicit mode preserves it but rejects rather than partially starting a mixed-validity request.

## Detailed specifications

- [Reprocessing operational model](../../operational-models/scout/position-reprocessing.md)
- [Atomic-start quality scenario](../../quality-scenarios/scout/backfill-atomic-start.md)
- [Review and promotion](review-promotion.md)
