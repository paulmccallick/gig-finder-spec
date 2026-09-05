---
id: relevance-configuration
capability: gig-scout
title: Relevance configuration
summary: Version relevance criteria and threshold, then schedule eligible described positions against the new identity.
aliases: [Scout criteria, relevance threshold, screening rules]
requires: []
workflows: [../../workflows/scout/configure-relevance.md]
operational_models: []
quality_scenarios: []
variants: []
contracts: []
implementation_areas: [src/core/scout/engine/scout-position-service.ts, src/core/scout/engine/screening.ts, src/data/scout-run-store.ts, src/web/client/ScoutPositionReview.tsx]
test_suites: [src/core/scout/engine/test/scout-position-service.test.ts, src/agent/test/scout-position-screening.test.ts, src/data/test/scout-run-store.test.ts]
---

# Relevance configuration

## Product role

Owns versioned relevance criteria/threshold used before matching and the positions a new identity reschedules.

## Feature set

| Constituent behavior | Implemented outcome |
|---|---|
| Identity | Validates and saves immutable criteria/threshold. |
| Selection | Selects later processing identity without rewriting evidence. |
| Reset | Reschedules all unlinked described states, including user/legacy decisions. |

## Purpose and boundary

Relevance configuration defines the narrow technology-role exclusion criteria and confidence threshold used before candidate-fit scoring. It does not express candidate desirability, ranking, or a pursue recommendation.

## Access points

The Gig Scout Positions settings UI reads the current configuration and saves a new version. No supported agent/root-CLI/public contract exists.

## Configuration and defaults

Criteria are trimmed text from 10 through 4,000 characters. Threshold is inclusive from 0 through 1. Criteria versions are immutable/current-pointer records. Candidate-match rubric and screening prompt identities are separately versioned but not user-editable here.

## Durable state and lifecycle

Every save appends and activates a new criteria version. Every unlinked position with any usable description is scheduled against the new relevance identity. Obsolete pending/failed candidate-match work is superseded and every affected position is unconditionally returned to `processing` with a revision increment. This includes user-marked irrelevant/deferred and reserved `rejected` state. Prior decisions, criteria, and evaluations remain as evidence but no longer control the current projection.

## Validation and invariants

Relevance can only exclude at or above the configured confidence. A low-confidence `fails_relevance` result is retained as evaluation evidence but continues to candidate-match scoring. Candidate fit never overrides the relevance decision semantics.

## Outputs and downstream effects

The UI reports the saved version. New processing binds the exact criteria ID, threshold, latest description, latest observation/run screening snapshot, prompt/model configuration, and input identity. Existing review values become stale immediately because save increments state revision, before replacement evaluation completes.

## Failure, retry, and recovery

Invalid criteria/threshold or persistence failure does not activate a version. Retry with valid content. Scheduled processing follows the position-processing retry/reconciliation model.

## Current limitations

The UI describes technology-role relevance specifically. Saving is version-append, not in-place edit. Rubric/prompt/model settings are not independently configurable through this surface. Current save behavior does not preserve active user decisions or legacy rejected state; it returns all described unlinked positions to processing.

## Detailed specifications

- [Configure relevance screening](../../workflows/scout/configure-relevance.md)
- [Position-processing operational model](../../operational-models/scout/position-processing.md)
