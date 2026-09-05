---
id: change-reversal
capability: conversational-agent
title: Audited change reversal
summary: Apply a safe audited inverse of one exact eligible prior change without overwriting later work.
aliases: [undo, revert, roll back change]
requires: [../../foundations/changes-revisions-reversal.md, ../../foundations/agent-consent-and-privacy.md]
workflows: [../../workflows/agent/revert-change.md]
operational_models: []
quality_scenarios: [../../quality-scenarios/agent/reversal-conflict.md]
variants: []
contracts: [../../contracts/operations/revert_change.schema.json]
implementation_areas: [src/core/changes.ts, src/data/audit.ts, src/agent/gig-finder-tools.ts]
test_suites: [src/data/test/store-regressions.test.ts, src/agent/test/gig-finder-tools.test.ts]
---

# Audited change reversal

## Purpose and boundary

Change reversal restores recorded prior state for one exact reversible change while preserving audit history. It creates a new change rather than deleting history and does not provide arbitrary record rollback.

## Access points

Only the confirmed agent `revert_change` tool exposes general reversal.

## Configuration and defaults

There is no independent configuration. Eligibility derives from the recorded change/effects and each affected record's current revision.

## Durable state and lifecycle

A successful reversal restores every recorded effect in one transaction and records a new audited revert identity whose parent is the target change. The reversible entity families are Gig, Person, Gig–Person relationship, Task, Interaction, and Interaction-participant link. Managed documents, Scout position/configuration/run state, settings, and any other unlisted effect have no reversal snapshots. The original change remains.

## Validation and invariants

The exact change ID must exist and contain at least one reversal snapshot. General Gig and Person creation do not record a reversible creation snapshot; Gig–Person, Task, and Interaction creation do, including all Interaction-participant links. Supported updates in the six entity families record prior state, and supported deletes record the deleted prior state. Every affected record must still be the immediately following revision: a create snapshot requires the active record at that creation revision; update/delete requires revision exactly snapshot revision plus one. Later edits or later deletion/restoration prohibit reversal. An Interaction creation is also ineligible while an active Interaction supersedes it, and any changed Interaction is ineligible if its referenced superseded Interaction is no longer active.

## Outputs and downstream effects

The inverse is exact by snapshot operation: create soft-deletes the created record; delete restores the prior full record; update restores the prior full record; and an update whose snapshot was deleted (the inverse of restoration) soft-deletes again. Interaction participant links are included, so participant membership and the Interaction change atomically. Success returns the new change ID, target change ID, and every affected entity/ID; the new revert has its own snapshots and can itself be eligible for immediate reversal.

## Failure, retry, and recovery

Not-found, not-revertible, consistency, and revision-conflict results make no change. Reinspect current records; repeated retry cannot make a superseded revision safe.

## Current limitations

No general UI/CLI reversal is supported. Gig and Person creations cannot be undone through this feature even though later updates can. Managed-document versions and Scout promotion effects cannot be erased as a unit through general reversal.

## Detailed specifications

- [Revert an eligible change](../../workflows/agent/revert-change.md)
- [Later-edit conflict quality scenario](../../quality-scenarios/agent/reversal-conflict.md)
