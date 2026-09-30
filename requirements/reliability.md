---
type: requirement
scope: reliability
summary: Understand consistency and recovery guarantees.
load_when:
  - Understand consistency and recovery guarantees.
related:
  - architecture/persistence.md
  - operations/recovery.md
  - capabilities/gig-scout.md
---

# Reliability and Consistency

## Established Behavioral Constraints

- An audited multi-record domain change commits as one unit or rolls back.
- Revision-sensitive mutations reject stale state; reversal checks incompatible later changes.
- Managed-document updates create versions under their own concurrency checks.
- Tool mutations can remain committed after conversation failure/interruption.
- Scout discovery, processing, and promotion distinguish persisted progress, failure, and queue activity.

These are scoped observed contracts, not blanket guarantees for every write or integration. See the owning [capabilities](../APPLICATION.md#major-capabilities).

## Recovery Boundaries

Maintenance verifies database integrity/foreign keys when backing up/restoring. Full validation additionally reports typed history and missing-table issues; intrinsic backup acceptance is narrower than that full report. Database backup does not include external artifacts, credentials, queue databases, or configuration.

No quantified recovery time, acceptable data-loss window, periodic backup schedule, or end-to-end exactly-once guarantee was established. A daily-backup helper exists, but the inspected runtime does not schedule it.

## Evidence and Implementation

[Persistence](../architecture/persistence.md), [recovery](../operations/recovery.md), [change executor](app::src/core/changes.ts), [backup/validation implementation](app::src/data/maintenance.ts).
