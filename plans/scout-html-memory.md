---
type: plan
scope: scout-html-memory
summary: Release retained HTML parser callbacks by upgrading the Bun runtime.
load_when:
  - Implementing or verifying the Scout memory fix.
related:
  - ../operations/deployment.md
  - ../architecture/gig-scout.md
---

# Scout HTML Memory Fix

Issue: https://github.com/paulmccallick/gig-finder/issues/182

Full scans on Bun 1.3.14 retain HTML page bodies through protected end-tag callbacks. A synthetic 100-page reproduction retains approximately 200 MB after collection; Bun 1.4.4 reduces retained external storage to approximately 45 KB. The released runtime includes upstream fix https://github.com/oven-sh/bun/pull/43379.

## Scope and acceptance

Pin Bun 1.4.4 consistently for the package, dependency-installed Bun executable, CI, and Docker stages. Preserve Scout extraction results. Repeated HTML listing, DOM description, JSON-LD description, and failed description validation must release page storage and protected callbacks after collection. Use synthetic data in isolated subprocesses, not production snapshots or RSS thresholds.

## Implementation and verification

1. Add regressions against the application extractors and demonstrate failures on 1.3.14.
2. Update runtime pins and lockfile; verify the regressions on 1.4.4.
3. Run application checks, production build, migration checks, and runtime compatibility checks.
4. Create the PR and run release-verifier and change-overview against its exact revision.
5. After release approval, deploy the published image and verify runtime version, health, and bounded extraction memory.

Unrelated source failures and parser behavior changes are out of scope.
