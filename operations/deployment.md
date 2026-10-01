---
type: operations
scope: deployment
summary: Understand build, startup configuration, and the supplied deployment path.
load_when:
  - Understand build, startup configuration, and the supplied deployment path.
related:
  - operations/observability.md
  - operations/recovery.md
  - decisions/README.md
---

# Deployment

## Runtime and Build

The source package pins Bun 1.3.14. `bun run build` produces the React client and Bun server/maintenance bundles, copies migrations and PDF worker assets, and verifies production bundles. The Dockerfile uses a build stage and a non-root release stage containing `dist`; it runs `dist/server/server.js` and checks `/healthz` on port 3001.

CI runs application checks, migration checks, browser tests, and build. On main, it builds a smoke image, exercises it, then separately builds/publishes amd64/arm64 images under `sha-<commit>` and `latest`. The smoke image and published image are separate builds; no byte-identical promotion guarantee is inferred.

## Context and Startup

`GIG_FINDER_CONTEXT_ROOT` selects the context root, falling back to the legacy variable and then repository `context/`. Path-specific variables override database, profile, documents, queue, description, log, and backup paths. `GIG_FINDER_CONFIG` selects version-1 JSON configuration with actor and optional profile paths. The context resolver retains legacy filename/variable fallbacks.

Normal startup requires an existing initialized/migrated database and a valid candidate profile. It synchronizes profile document copies and starts discovery/position queues. Provider access requires runtime credentials when model work is attempted. The source server defaults to `127.0.0.1:3000`; development API uses 3101 and Docker uses 3001. `HOST`, `PORT`, `STATIC_ROOT`, `APP_REVISION`, `LOG_LEVEL`, upload/staging limits, and Scout batch/concurrency parameters are parsed in web configuration.

## Supplied Production Path

1. Bootstrap operator-owned state/configuration with the supplied bootstrap script when preparing a new environment.
2. CI publishes a commit-tagged image. `bin/deploy-local.sh sha-<40-character-commit>` accepts only that tag shape and pulls the image.
3. The deploy script checks external paths and credentials, stops the prior writer, creates a verified database backup, synchronizes source-managed inputs, migrates, and validates.
4. The new container mounts persistent data/artifacts/logs/configuration and read-only provider credentials, publishes port 3001 on host loopback, and must report healthy at the requested revision.
5. Failure paths attempt database/input rollback and restore the prior container; failed recovery leaves retained state for operator action.

Deployment maintenance deliberately excludes the runtime artifact mount. State is not embedded in the application image. This describes checked-in automation, not the configuration or health of a running host.

## Evidence

**DEPLOY-ARCH-001** Current implementation references for packaging, CI, bootstrap, deployment, context resolution, and web configuration are listed in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#deploy-arch-001).

See [observability](observability.md), [recovery](recovery.md), and [decision provenance](../decisions/README.md).
