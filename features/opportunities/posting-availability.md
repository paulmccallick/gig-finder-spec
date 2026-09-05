---
id: posting-availability
capability: opportunities
title: Posting availability
summary: Retain Scout-observed availability independently from the candidate-managed pipeline.
aliases: [role availability, unavailable posting, official posting status]
requires: [../../foundations/changes-revisions-reversal.md, ../../foundations/dates-time-ordering.md]
workflows: []
operational_models: []
quality_scenarios: []
variants: []
contracts: []
implementation_areas: [src/core/gig-domain-service.ts, src/core/scout/engine/runs.ts, src/web/client/domain/board.ts]
test_suites: [src/core/test/services.test.ts, src/core/scout/engine/test/runs.test.ts, src/web/test/client/domain/board.test.ts]
---

# Posting availability

## Product role

Owns the externally observed availability of a posting without taking ownership of the candidate's pipeline decision. It lets Scout report whether the source still presents the role while preserving candidate-managed status and outcome as a separate responsibility.

## Feature set

| Constituent behavior | Implemented outcome |
|---|---|
| Availability observation | Records open, unavailable, or unknown source evidence for an exact posting identity. |
| Trusted reconciliation | Changes availability only from a complete trusted company observation using exact stored identifiers. |
| Candidate-state isolation | Never converts source disappearance into a pipeline status or outcome change. |
| Availability presentation | Exposes current observed availability and its evidence alongside the Gig. |

## Purpose and boundary

Posting availability records whether the most recent authoritative Scout scan observed a tracked role as available or unavailable. It is independent of pipeline stage/outcome and never closes, reopens, or otherwise decides the candidate's pursuit state.

## Access points

The dashboard displays availability and uses it for Active/Unavailable routing. There is no general UI, agent-tool, or CLI mutation. A successful full Scout company result is the supported producer.

## Configuration and defaults

New Gigs begin `unknown` with no availability timestamp. A trusted succeeded company result considers every Gig whose company matches after trim plus host-default locale lowercase and which has a source URL or requisition ID. An observation counts as present when either its canonical URL string exactly equals the stored source URL or its external ID string exactly equals the stored requisition ID; neither value is trimmed/canonicalized at comparison and there is no precedence when one matches and the other differs.

## Durable state and lifecycle

The vocabulary is `unknown`, `available`, and `unavailable`. Scout changes a matching observed Gig to available and a previously tracked but absent Gig to unavailable, recording the observation instant. A changed value creates one audited Gig revision; an identical value is an explicit no-op with no new revision/change. Ordinary Gig mutation does not own these fields.

## Validation and invariants

Only `available` or `unavailable` may be written after creation, and the observation time must be a valid instant. Availability reconciliation runs only for a complete authoritative company result. Partial/failed/ambiguous/empty-untrusted results must not infer absence or change availability.

## Outputs and downstream effects

The Opportunities workspace routes otherwise active unavailable Gigs to its Unavailable view and shows “unavailable since” from the timestamp. Archive membership remains controlled by stage/outcome. Scout result persistence by itself does not mutate availability; reconciliation is a separate audited effect.

## Failure, retry, and recovery

Invalid timestamps fail before audit/state change. A full-run retry uses deterministic change identities per run/Gig; unchanged current values remain no-ops. Failed or partial source work retains prior availability.

## Current limitations

Candidates cannot manually override availability through supported general surfaces. `unknown` cannot be restored through the availability mutation. A source that remains unable to produce a trusted complete result leaves prior observations stale rather than guessing.

## Detailed specifications

- [Run Scout](../../workflows/scout/run-scout.md)
- [Scout discovery operational model](../../operational-models/scout/discovery-runs.md)
