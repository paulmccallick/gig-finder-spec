---
type: operations
scope: deployment
summary: How to build and replace the application while preserving its data.
load_when:
  - how to build and replace the application while preserving its data
---

# Deployment

The supplied deployment scripts replace the running software while keeping job-search data, candidate information, and credentials outside the image. They back up the database before migration and attempt rollback if the replacement fails.

## Build and Release

The [package scripts](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/package.json) pin Bun 1.3.14. `bun run build` produces the browser files, server and maintenance bundles, database migrations, and PDF worker assets, then checks the production bundles.

The [Dockerfile](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/Dockerfile) builds those outputs and copies them into a release image that runs as a non-root user. It starts `dist/server/server.js` and checks `/healthz` on port 3001.

[CI](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/.github/workflows/ci.yml) runs code, migration, browser, and build checks. For a main-branch release, it builds and exercises a smoke-test image, then separately builds and publishes amd64/arm64 images tagged `sha-<commit>` and `latest`. The deployed tag identifies source revision; the published image is not the same build as the smoke-test image.

## Configure Runtime Inputs

`GIG_FINDER_CONTEXT_ROOT` selects the directory containing local application data, with `JOB_SEARCH_CONTEXT_ROOT` and repository `context/` fallbacks. More specific variables override database, profile, document, queue, description, log, and backup paths. Path environment values are trimmed and resolved against the process working directory; they need not be below the context root. The [context resolver](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/context.ts) and its [tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/test/context.test.ts) define precedence and legacy fallbacks.

`GIG_FINDER_CONFIG` selects the version-1 JSON configuration, defaulting to `<context-root>/config.json`. A missing file supplies the default actor `GigFinder User`; a present file must have `version: 1` and a nonempty `actor`, with optional nonempty `profile` and `profileDocuments` strings. Invalid JSON or invalid fields fail configuration loading. Actor environment overrides take precedence over the configured/default actor.

`config.profile` is resolved with `path.resolve(contextRoot, config.profile)` and may name an absolute path or escape the root. In contrast, `config.profileDocuments` must be a relative directory strictly inside the context root. The `GIG_FINDER_PROFILE_DOCUMENTS` environment override bypasses that configuration-field restriction. Profile selection uses the environment overrides, then `config.profile`, then `profile/candidate-profile.json`, falling back to `profile/job-search-profile.json` only when the candidate file is absent and the legacy file exists.

| Input | Effect |
|---|---|
| `GIG_FINDER_CONTEXT_ROOT` | Base directory for local application state. |
| `GIG_FINDER_CONFIG` | Path to the version-1 JSON configuration file. |
| `GIG_FINDER_DATABASE`, `GIG_FINDER_ARTIFACTS`, `GIG_FINDER_PROFILE_DOCUMENTS`, `GIG_FINDER_SCOUT_QUEUE`, `GIG_FINDER_SCOUT_POSITION_QUEUE`, `GIG_FINDER_SCOUT_DESCRIPTIONS`, `GIG_FINDER_BACKUP_ROOT` | Override the corresponding state path. |
| `GIG_FINDER_MEETING_PARTICIPANT_MIGRATION` | Overrides the legacy meeting-participant migration mapping file; default `<context-root>/data/migration/0010-meeting-participants.json`. |
| `LOG_DIRECTORY` | Overrides the log directory; default `<context-root>/logs`. |
| `GIG_FINDER_PROFILE` | Overrides the candidate-profile path. |
| `GIG_FINDER_ACTOR` | Overrides the actor label saved with changes. |
| `HOST`, `PORT`, `STATIC_ROOT`, `APP_REVISION` | Configure the server address, static files, and reported revision. `PORT` must be a positive integer no greater than 65535. |
| `GIG_FINDER_SCOUT_BATCH_SIZE`, `GIG_FINDER_SCOUT_CONCURRENCY` | Set positive worker limits for Scout. |

`GIG_FINDER_SMOKE_MODE` is only for smoke verification and must be `deterministic` or `live`; deterministic mode also requires `GIG_FINDER_SMOKE_PROVIDER_URL`. These inputs are validated while the web application starts, so invalid values prevent startup rather than being silently ignored.

Normal startup needs an initialized and migrated database and a valid structured candidate profile. It refreshes derived candidate-document files and starts the Scout queues. Model operations require provider credentials when called. See [document/profile handling](../architecture/documents-profile.md), [Scout configuration](../architecture/gig-scout.md), and [model authentication](../architecture/conversational-agent.md).

| Server mode | Default address/port |
|---|---|
| Direct source server | `127.0.0.1:3000` |
| Development API script | Port 3101 |
| Docker service | Port 3001; deployment publishes on host `127.0.0.1` |

[Web configuration](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/app.ts) parses address, static-file root, revision, logging, upload/staging limits, and Scout settings. The [package scripts](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/package.json) define development overrides.

## Replace the Running Application

1. For a new environment, use the supplied [bootstrap script](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/bin/bootstrap-production.sh) to prepare external state and configuration.
2. Deploy a published revision with `bin/deploy-local.sh sha-<40-character-commit>`. The [deployment script](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/bin/deploy-local.sh) checks the tag and paths, then pulls the image.
3. It stops the prior container, validates the database, and creates a backup. It then synchronizes source-managed configuration inputs, migrates the database, and validates again.
4. It starts the replacement with persistent data, description files, logs, configuration, and read-only credentials. The replacement must return a healthy response with the requested revision; post-start database validation must also pass.
5. On failure, the script attempts the appropriate input/database rollback and recovery of the prior container. If that recovery fails, it leaves the old container stopped and reports retained backup/state paths for the operator.

Use `bun run smoke:deterministic` to exercise a built application with a scripted local provider. `bun run smoke:live` performs the corresponding live-provider check and therefore needs valid provider access. Neither command proves that a deployed host is current; deployment additionally checks `/healthz` for the requested revision and validates the database after startup.

Maintenance containers do not mount the runtime description/artifact directory. A database rollback therefore does not restore those files. Use [recovery](recovery.md) for the exact limits and [health checks and logs](observability.md) for diagnosing startup failures.

## Related Decisions

[Architectural decisions](../decisions/README.md) links the recorded reasons for separating software from runtime state. This document describes the checked-in scripts; it does not establish the state of any running host.

## Related ADRs

- [ADR 0007: Deploy Docker images with external state and verified rollback](../decisions/0007-immutable-production-deployment.md)
- [ADR 0009: Keep personal data out of source control](../decisions/0009-keep-personal-data-out-of-source-control.md)
- [ADR 0010: Use BunQueue for durable background work](../decisions/0010-use-bunqueue-for-background-work.md)

## Related documents

- [Health Checks and Logs](observability.md)
- [Recovery and Maintenance](recovery.md)
- [Architectural Decisions](../decisions/README.md)
