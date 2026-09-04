---
id: revert-change
capability: conversational-agent
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

Exact change ID, a reversible recorded change, and no later affected-record revision that would be overwritten. Agent consent applies.

## Workflow

1. Identify the exact prior change from structured tool output/history.
2. Explain the friendly effect and confirm the undo.
3. Validate reversibility and current revisions.
4. Commit a new audited revert change restoring recorded prior states.

## Decisions and variants

Changes containing non-reversible effects or already superseded record revisions are rejected. Revert is itself a new change; history is not erased.

## State changes

Restores eligible record state and creates a new change identity. Multiple affected records restore atomically.

## Outputs and observable effects

Returns affected entities/records under a successful change result. Dashboard refresh reflects restored values.

## Safety rules

Never infer a change ID from narrative. Never overwrite later edits. Obtain confirmation based on friendly consequences.

## Failure, retry, and recovery

Not-found, not-revertible, consistency, or revision-conflict responses make no change. Reinspect current records; do not repeatedly retry a conflict.

## Known current behavior and limitations

Only the agent exposes general revert. Document version history remains append-only; not every operation is eligible for inverse replay.

## Related workflows

- [Use the conversational agent](use-conversation.md)
