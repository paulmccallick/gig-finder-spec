---
type: operations
scope: recovery
summary: Commands for checking, backing up, and restoring the database, including what they leave out.
load_when:
  - commands for checking, backing up, and restoring the database, including what they leave out
---

# Recovery and Maintenance

Use these commands to inspect the application database, make a backup, apply migrations, or restore a previous database. Separate files and queue databases require their own recovery plan.

## Run Maintenance

From the code repository, run `bun src/operations/maintenance.ts <command>`. In the production image, run `bun dist/server/maintenance.js <command>`. Both use the configured application paths, so select the intended environment before running them. See [deployment configuration](deployment.md#configure-runtime-inputs).

| Command | What it does |
|---|---|
| `initialize` | Creates the database directory and database if needed, applies migrations, and validates. |
| `migrate` | Applies migrations to an existing database and validates. Legacy meeting data may need participant mappings. |
| `validate` | Checks SQLite integrity, references between records, expected tables, and record-history revision sequences. |
| `backup` | Writes an application-database snapshot and a JSON manifest containing size, checksum, and validation results. |
| `restore <absolute-backup-path>` | Checks the selected database file, backs up the current database, replaces it through a temporary file, and checks the copied bytes. Replacement failure attempts to put the displaced database back. |
| `artifacts [baseline-json]` | Checks Scout description files against their recorded references. With a baseline, reports whether the result regressed. Without one, the outer `ok` is always true: inspect the detailed report for missing or damaged files. |

The [maintenance entry point](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/operations/maintenance.ts) defines command handling; [database maintenance](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/maintenance.ts) and [artifact checking](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/runtime-artifacts.ts) implement the checks.

## Restore a Database Manually

1. Stop processes that can write the application database. The standalone restore command does not stop them for you.
2. Preserve the failed state and select a known database backup. Use the intended environment configuration and the backup's absolute path.
3. Run restore, then run `validate` and inspect its full report.
4. Restart a compatible application version. Check [health and logs](observability.md), then check the affected feature, including any work that depends on external files.

The [deployment script](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/bin/deploy-local.sh) already coordinates stop, backup, migration, and rollback during software replacement. A manual restore needs equivalent control over writers; replacing a file while the running server still has it open is not handled by the maintenance command.

## What a Database Backup Covers

The snapshot includes the application database, including managed document content and its versions. It does not include the separate Scout queue databases, retrieved description files, candidate JSON, credentials, or logs. [Persistence](../architecture/persistence.md) lists where each kind of data lives.

Startup can rebuild managed candidate-document file copies from the database. It cannot recreate every external file from a database backup. Use [Scout implementation](../architecture/gig-scout.md) and [Gig Scout behavior](../capabilities/gig-scout.md) when evaluating the effect on unfinished searches or position work.

## Validation and Scheduling Limits

Backup/restore acceptance requires SQLite integrity and valid foreign-key references. Other problems can still appear in the broader validation report, such as missing expected tables or inconsistent record history; an accepted backup is not evidence that every check passed.

The source contains an `ensureDailyBackup` helper with age/retention options, but no runtime schedule that calls it. [Reliability](../requirements/reliability.md) describes the resulting guarantees and limitations. The [maintenance tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/test/maintenance-entrypoint.test.ts) provide executable examples; no maintenance operation was run against user data for this documentation pass.

## Related ADRs

- [ADR 0005: Store mutations as revisioned, audited transactions](../decisions/0005-revisioned-audited-change-transactions.md)
- [ADR 0006: Make database document state authoritative](../decisions/0006-authoritative-document-state.md)
- [ADR 0007: Deploy Docker images with external state and verified rollback](../decisions/0007-immutable-production-deployment.md)
- [ADR 0010: Use BunQueue for durable background work](../decisions/0010-use-bunqueue-for-background-work.md)

## Related documents

- [Reliability and Consistency](../requirements/reliability.md)
- [Persistence](../architecture/persistence.md)
- [Gig Scout](../capabilities/gig-scout.md)
