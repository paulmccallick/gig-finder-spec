---
id: discovery-runs
capability: gig-scout
title: Discovery runs and company work
summary: Execute durable full-company scans, preserve source evidence, aggregate outcomes, and reconcile trusted availability.
aliases: [Scout run, sourcing scan, company scan]
requires: [company-sources.md, ../../foundations/queries-and-pagination.md]
workflows: [../../workflows/scout/run-scout.md]
operational_models: [../../operational-models/scout/discovery-runs.md]
quality_scenarios: [../../quality-scenarios/scout/run-configuration-binding.md, ../../quality-scenarios/scout/trusted-empty-availability.md, ../../quality-scenarios/scout/company-redelivery.md, ../../quality-scenarios/scout/source-policy-bounds.md, ../../quality-scenarios/scout/queue-restart-reconciliation.md]
variants: []
contracts: []
implementation_areas: [src/core/scout/engine/runs.ts, src/core/scout/engine/scan-company.ts, src/core/scout/sourcing, src/operations/scout-runtime.ts, src/data/scout-run-store.ts]
test_suites: [src/core/scout/engine/test, src/data/test/scout-run-store.test.ts, src/operations/test/scout-runtime.integration.test.ts, src/web/e2e/gig-scout.e2e.ts]
---

# Discovery runs and company work

## Purpose and boundary

A full discovery run snapshots search/configuration inputs, executes independently durable work for every active configured company, validates official-source results, persists historical observations/diagnostics, and aggregates a stable run outcome. Accepted observations feed position processing. Only trusted complete company results reconcile tracked-Gig posting availability.

## Access points

The Gig Scout Runs UI starts a full run, polls/list/selects history, inspects exact profiles and company/source diagnostics, and filters/paginates observations. No supported agent or root CLI starts runs.

## Configuration and defaults

The start profile accepts up to 25 title terms, 25 abbreviation/variant groups of at most 10 variants, and 50 locations; each omitted/empty dimension independently uses its compiled default. Default terms are Director, Senior Director, Sr. Director, Senior Vice President, SVP, Vice President, VP Engineering, Head of Engineering, and Head of Technology. Default variant groups map Vice President→VP and Senior Vice President→SVP. Default locations are Seattle, Bellevue, Redmond, Remote, and Washington. The UI edits terms/locations; variant groups remain at their default. Start accepts batch size 1–100 and concurrency 1–50, defaulting to 20 and 5. Run records persist these values, but actual workers use process-wide batch/concurrency settings. Source-policy defaults are 2,000 pages, 10,000 accepted records, 2,500 requests, 6 MB listing/1 MB detail responses, and 30 minutes per source; a request is limited to 15 seconds.

## Durable state and lifecycle

At most one full run is queued/running; a concurrent start returns it with its original inputs. Creation snapshots active companies in ID order, display names, immutable configuration IDs, resolved search profile, and the runtime's complete candidate profile/version/artifact/hash. It also binds the screening provider/model/configuration used in later relevance and candidate-match semantic identities. No companies completes immediately. Otherwise company outbox/jobs run independently, the single active source records attempts/outcome, accepted positions become run observations/cross-run positions, and terminal companies derive the full-run result. Position handoff is durable but subsequent position-work status is independent: pending, failed, or incomplete processing never delays company or full-run completion.

## Validation and invariants

Source traversal is sequential within one company. Normalized positions require title plus stable external ID or HTTPS canonical URL. Title/location rules filter after normalization; duplicate identities and contradictions are rejected with reasons. Verified empty requires inspectable listing evidence; suspicious/partial/failed results cannot infer absence. Availability reconciliation occurs only for a fully succeeded company and never alters pipeline stage/outcome.

## Outputs and downstream effects

History retains run/company/source statuses, counts, exact search/configuration bindings, attempts, diagnostics, filter decisions, and paginated observations. Rediscovery updates cross-run current position/last-seen while retaining first-seen and every observation. Accepted observations schedule position processing. A trusted complete result audits available/unavailable changes for exact identifiable Gigs.

## Failure, retry, and recovery

Queue jobs use deterministic IDs, three attempts, and one-second backoff. Startup/periodic reconciliation recreates missing work and projects exhausted failures. Redelivery uses stable persistence identities. Later-page failure retains earlier accepted positions as partial. Source/company failures contribute to partial/failed run aggregation instead of erasing successes.

## Current limitations

UI refresh uses polling. Worker concurrency is global despite per-run stored settings. Free-text search profiles are not saved as reusable named configurations. A source unable to establish trusted completeness leaves prior Gig availability untouched.

## Detailed specifications

- [Run and inspect Gig Scout](../../workflows/scout/run-scout.md)
- [Discovery operational model](../../operational-models/scout/discovery-runs.md)
- Quality scenarios are linked in front matter and should be loaded only for the tested quality.
