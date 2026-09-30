---
type: requirement
scope: reliability
summary: What is saved after failures and which consistency and recovery checks apply.
load_when:
  - what is saved after failures and which consistency and recovery checks apply
---

# Reliability and Consistency

## What Callers Can Rely On

| Situation | Current behavior |
|---|---|
| A domain operation changes several related records | Its transaction commits those writes together or rolls them all back. |
| An operation checks an expected revision/version | A mismatch rejects the edit. Ordinary update services that read the revision internally cannot detect every outdated client view. |
| An editable managed document changes | The update checks the expected version and retains earlier content. See [documents](../capabilities/documents-profile.md). |
| An assistant response stops after a tool has saved data | The tool's change can remain saved even when the conversation turn is not saved. See [conversation workflow](../workflows/conversational-agent-turn.md). |
| Scout finishes searching companies | Position evaluation or promotion can still be running or failed; completion of one stage does not establish completion of all later work. See [Gig Scout](../capabilities/gig-scout.md). |
| A user requests undo | Only supported changes can be reverted, and incompatible later edits or dependencies can prevent it. See [conversation implementation](../architecture/conversational-agent.md). |

The [persistence document](../architecture/persistence.md) explains which writes share a transaction and how revision checks work. [Change execution](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/changes.ts) is the common entry point for supported audited mutations.

## Backup and Recovery

The maintenance commands check SQLite integrity and foreign keys when accepting a database backup or restore. Full validation additionally reports missing expected tables and history inconsistencies. A backup can therefore pass the narrower acceptance check while its validation report still contains other issues.

The database snapshot does not include separate queue databases, external description files, credentials, or configuration. Restoring it is not a complete restoration of the runtime environment. [Recovery instructions](../operations/recovery.md) explain the scope and procedure; [backup implementation](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/maintenance.ts) defines the checks.

The source contains a daily-backup helper but no runtime schedule that invokes it. Recovery-time and acceptable-data-loss targets are [unspecified](global-nfrs.md#targets-not-specified).

## Related documents

- [Persistence](../architecture/persistence.md)
- [Recovery and Maintenance](../operations/recovery.md)
- [Gig Scout](../capabilities/gig-scout.md)
