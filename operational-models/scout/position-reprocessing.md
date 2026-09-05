---
id: scout-position-reprocessing-operational-model
capability: gig-scout
feature: position-reprocessing
title: Position-reprocessing operational model
summary: Coordinate legacy checkpoints or explicit immutable item sets through authoritative reprocessing and derived run outcomes.
elements: [work-levels, configuration-binding, status-models, derived-completion, retry-replay-reconciliation, concurrency-ordering, external-trust, durable-evidence, bounds]
requires: [../../features/scout/position-reprocessing.md, position-processing.md]
implementation_areas: [src/core/scout/engine/positions.ts, src/core/scout/engine/scout-position-service.ts, src/data/scout-run-store.ts]
test_suites: [src/data/test/scout-run-store.test.ts, src/web/test/request-handler.test.ts]
---

# Position-reprocessing operational model

## Purpose and boundary

This model governs durable legacy-run and explicit-position backfill from preview/binding through authoritative description reacquisition, screening, promoted-document refresh, and derived item/run completion.

## Governing invariants

An explicit mixed-validity request never partially starts. Started work uses immutable bindings. Explicit `position_backfill` preserves a current user-origin projection and its revision; legacy backfill does not and may replace that projection when screening completes. Promoted item completion follows exact linked-document refresh.

## Work levels and coordination

The **backfill run** owns type, request/source binding, configuration/model/profile snapshot, checkpoint/item set, and aggregate status. Each **item** owns exact position/observation/configuration/detail plan and final outcome. Item execution coordinates authoritative description, relevance, match, optional explicit-only workflow preservation, and optional linked job-description update through position-processing identities.

## Configuration binding

Legacy mode binds one full source run and advances stable position-ID checkpointing while resolving current active source configuration for recovery. Explicit preview/start snapshots exact accepted item set, latest observation, current active configuration/detail plan, candidate profile artifact/hash/version, model/provider/configuration, reason, and 64-hex request fingerprint. Later edits/restart do not alter it.

## State models

| Backfill run type | Identity |
|---|---|
| `legacy_backfill` | Unique source full-run ID plus stable checkpoint. |
| `position_backfill` | Exact item bindings plus request fingerprint/reason. |

| Run state | Entered when | Leaves when |
|---|---|---|
| `queued` | Accepted durable backfill created. | Processing begins. |
| `running` | Selection/items/downstream work remains nonterminal. | All selection/item/downstream work is final. |
| `completed` | All final item outcomes are successful/protected outcomes. | Terminal. |
| `partial` | Final outcomes mix successful with failed/unavailable/superseded, or legacy downstream has any failure. | Terminal. |
| `failed` | Explicit outcomes are all failed/unavailable, or unrecoverable run failure has no successful work. | Terminal. |

Explicit final item outcomes are `agent_irrelevant`, `agent_irrelevant_to_review`, `needs_user_review`, `promoted`, `user_workflow_preserved`, `failed`, `unavailable`, and `superseded`. Description outcome is `corrected` or `unchanged`.

## Completion and aggregation

Legacy completion requires selection/checkpoint finished and no downstream work pending; any downstream failure yields partial, otherwise completed. Explicit stays running while any item lacks final outcome. If every item is failed or unavailable, the run is failed. Otherwise any failed, unavailable, or superseded item makes the run partial—including all-superseded and superseded-plus-failure sets. With none of those outcomes, it is completed. A promoted item is not final until the exact linked job description is verified/updated.

## Retry, replay, and reconciliation

Explicit input trims the reason, validates position-ID shape, removes duplicate IDs, and sorts IDs. The request fingerprint preserves that sorted order and binds the aligned latest observation IDs and active configuration-source IDs; reordered/duplicate-equivalent input therefore reuses the same run when the trimmed reason and resolved bindings also match. New explicit work supersedes older unfinished explicit work for the same position. Durable checkpoints/items and semantic processing IDs allow restart without redoing completed evidence. Failed downstream work follows position queue revival/reconciliation; terminal outcomes are not duplicated on redelivery.

## Concurrency and ordering

Legacy selection orders positions by stable ID and advances a durable checkpoint. Explicit item set is fixed at start. Per-item downstream stages obey position stage ordering; different items may use configured position-worker concurrency. Supersession prevents two unfinished explicit intents from both owning the same position outcome.

## External-source trust

Every item requires an official active configuration with usable authoritative detail plan and sufficient ID/title evidence. Backfill refetches rather than trusting listing-only text. The same HTTPS/no-redirect/type/size/identity checks as normal authoritative acquisition apply. Missing current prerequisites yield unavailable/rejected plans, never fabricated content.

## Durable evidence and observability

Retain run type/status/source/reason/fingerprint/snapshots, legacy checkpoint, exact item bindings, plan rejection reasons, per-item processing references, description outcome, final outcome/failure, explicit protected-workflow result, and linked-document projection. Preview identifies rejected position/reason before any start.

## Bounds and limits

Every raw explicit array entry must match the exact position-ID form; duplicates are then removed/sorted, and the post-normalization unique set must contain 1–1,000 IDs. Raw array length itself is unbounded by this contract. The reason is trimmed to 1–500 characters. Request fingerprint is 64 lowercase hex. Authoritative fetch/description and queue bounds inherit the position-processing model.
