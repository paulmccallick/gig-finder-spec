---
id: revert-change
capability: conversational-agent
feature: change-reversal
title: Revert an eligible agent change
summary: Apply an audited inverse of one exact prior change when it will not overwrite later work.
aliases: [undo, revert update, roll back change]
requires: [../../foundations/changes-revisions-reversal.md, ../../foundations/agent-consent-and-privacy.md]
related: [use-conversation.md]
implementation_areas: [src/core/changes.ts, src/data/audit.ts, src/agent/gig-finder-tools.ts]
test_suites: [src/data/test/store-regressions.test.ts, src/agent/test/gig-finder-tools.test.ts]
---

# Revert an eligible agent change

## Intent

The candidate wants to undo one specific mutation previously represented by a change ID.

## Access points

Agent tool `revert_change`.

## Preconditions

Exact change ID with at least one snapshot from a Gig, Person, Gig–Person relationship, Task, Interaction, or Interaction-participant change; every affected record remains at the immediately following revision. Agent consent applies.

## Workflow

1. Identify the exact prior change from structured tool output/history.
2. Explain the friendly effect and confirm the undo.
3. Load all six reversible snapshot families and validate every record before applying any inverse.
4. For each snapshot, invert create by soft-delete, delete by full restore, update by full prior-state restore, and prior restoration by soft-delete.
5. Commit all inverses as one new audited child change.

## Decisions and variants

Changes with no snapshots in the six supported families or with any already-advanced record revision are rejected. General Gig and Person creates have no creation snapshot; Gig–Person, Task, and Interaction creates do. An Interaction create cannot reverse while an active Interaction supersedes it, and an Interaction effect cannot reverse when the Interaction it points to as superseded is no longer active. Revert is itself a new change; history is not erased.

## State changes

Restores exact snapshot state and creates a new change identity whose parent is the target. Multiple affected records and Interaction participant links restore atomically. Reversing a creation soft-deletes; reversing a delete restores; reversing an update restores prior fields; reversing a restoration soft-deletes again.

## Outputs and observable effects

Returns `entity: change`, the new change ID, `revertedChangeId`, and affected entity/ID pairs. Dashboard refresh reflects restored values.

## Safety rules

Never infer a change ID from narrative. Never overwrite later edits. Obtain confirmation based on friendly consequences.

## Failure, retry, and recovery

Not-found, not-revertible, consistency, or revision-conflict responses make no change. Reinspect current records; do not repeatedly retry a conflict.

## Current limitations

Only the agent exposes general revert. Managed documents, Scout state/effects, settings, and general Gig/Person creation have no reversible snapshot here.

## Related specifications

- [Use the conversational agent](use-conversation.md)
