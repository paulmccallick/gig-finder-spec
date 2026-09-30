---
type: operations
scope: recovery
summary: Use and understand database maintenance and artifact recovery boundaries.
load_when:
  - Use and understand database maintenance and artifact recovery boundaries.
related:
  - requirements/reliability.md
  - architecture/persistence.md
  - capabilities/gig-scout.md
---

# Recovery and Maintenance

## Entry Point

From the code repository, source maintenance is `bun src/operations/maintenance.ts <command>`. A production image provides `bun dist/server/maintenance.js <command>`. Both use the configured context. These are operational instructions; no maintenance command was run against user state while writing this documentation.

| Command | Behavior |
|---|---|
| `initialize` | Creates the database parent directory, opens/creates the database, migrates, and validates. |
| `migrate` | Migrates an existing database and validates; legacy meeting migration may require participant mappings. |
| `validate` | Reports SQLite integrity, foreign keys, required tables, and typed history revision-chain consistency. |
| `backup` | Writes a managed database snapshot and manifest with checksum and validation report. |
| `restore <absolute-backup-path>` | Verifies the selected database, makes a pre-restore backup, stages replacement, checks checksums, and restores the displaced database on replacement failure. |
| `artifacts [baseline-json]` | Audits Scout description artifacts; with a baseline, fails on regression. Without a baseline, prints the report with `ok: true`, so inspect the report itself. |

## Recovery Procedure and Boundaries

Stop application writers before manually replacing the database; the maintenance restore entry point does not stop server processes. Preserve the failed database and select a known backup. Run restore through the configured maintenance environment, validate, then restart the compatible application and check health/revision and relevant capability state. The deployment script orchestrates its own stop/backup/migration/rollback sequence.

Backup serialization covers the application database. It does not back up every queue database, artifact, candidate file, credential, or log. Artifact recovery is a separate operator concern; do not describe database restore as complete runtime restoration. Startup can reconstruct managed candidate-document copies from database content, but does not recreate every external artifact.

Backup acceptance requires intrinsic SQLite integrity and no foreign-key violations. Other validation issues may still be present in the report. The `ensureDailyBackup` helper supports age/retention handling, but no periodic invocation was found in the running application. No RPO/RTO is asserted.

## Evidence

[Maintenance entry point](app::src/operations/maintenance.ts), [backup/restore implementation](app::src/data/maintenance.ts), [artifact validation](app::src/data/runtime-artifacts.ts), [deployment rollback](app::bin/deploy-local.sh), [maintenance tests](app::src/data/test/maintenance-entrypoint.test.ts).

See [reliability](../requirements/reliability.md), [persistence](../architecture/persistence.md), and [Scout](../capabilities/gig-scout.md).
