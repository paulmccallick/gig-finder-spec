---
id: company-sources
capability: gig-scout
title: Company and official-source configuration
summary: Maintain versioned company/source definitions that bind later Scout discovery and description acquisition.
aliases: [Scout companies, career sources, source catalog]
requires: []
workflows: []
operational_models: []
quality_scenarios: []
variants: []
contracts: []
implementation_areas: [src/core/scout/engine/company-import.ts, src/core/scout/sourcing/contracts.ts, src/core/scout/sourcing/adapters/templates, src/data/scout-company-import-store.ts]
test_suites: [src/data/test/scout-company-import.test.ts, src/web/test/request-handler.test.ts]
---

# Company and official-source configuration

## Purpose and boundary

This feature defines which companies Scout scans and how each official career source is listed, paginated, normalized, location-enriched, and used for authoritative detail descriptions. It is operational configuration with durable product effects even though no current end-user UI, agent tool, supported root CLI, or public API manages it.

## Access points

Configuration enters through a private bulk-import boundary and compiled reusable JSON templates. That private route is not a supported public access point. The dashboard can observe configured companies only indirectly through runs/history.

## Configuration and defaults

Bulk input has literal format version 1. Each company has a trimmed ID of 1–100 characters, display name of 1–200, active flag defaulting true, and 1–50 sources with exactly one active official source; inactive sources are versioned configuration only and are not scanned. Every source has a unique trimmed key of 1–100 characters, an HTTPS URL, and active flag defaulting true.

A custom JSON source requires a records path plus title and URL field paths. It may configure GET/POST (GET default), scalar request body, next-page path, script-envelope extraction, ID/description/location/work-arrangement fields, URL prefix, and authoritative detail plan. A reusable JSON source instead binds an exact positive template version, nonblank variables, and trimmed overrides. An HTML source requires listing, title, URL, and listing-surface selectors; it may add ID/description/location, explicit empty-state, next-page, and authoritative detail rules. Detail rules accept JSON GET/POST plus description and ID/title paths, or HTML DOM/JSON-LD extraction with ID/title evidence. Description format defaults to automatic and encoding to none; HTML-entity decoding is valid only for HTML content.

## Durable state and lifecycle

The first valid import creates the company and immutable configuration version 1. Validation applies trimming/defaults before fingerprinting. Object keys are canonicalized in sorted order but source-array order is preserved; the fingerprint covers the company active flag and full parsed source array. Reimport with an identical fingerprint is unchanged. Changed active/source configuration appends a version and advances the current configuration pointer; existing run/backfill bindings remain on their immutable version. Bulk input is one transaction, capped at 10,000 companies.

## Validation and invariants

Company IDs within a bulk request are unique. Templates and exact versions/variables/overrides must resolve; JSON/HTML and detail discriminators reject fields from another form; paths/selectors and required identity evidence must be present; source URLs are HTTPS; source keys are unique; exactly one configured source is active. Any invalid company rejects the whole import.

## Outputs and downstream effects

Successful import reports created/versioned/unchanged/rejected counts. Active companies and only their one active source/current configuration ID seed later full runs. Description processing/backfill uses the bound source settings, never an unversioned mutable copy.

## Failure, retry, and recovery

Malformed configuration fails atomically with no partial company/version updates. Correct the entire input and retry. Repeating an accepted identical input is a no-op.

## Current limitations

There is no supported management UI/CLI/tool/public API. Source-array reordering changes the fingerprint even when source objects are otherwise identical. The display name is omitted from the fingerprint, so a name-only reimport is treated as unchanged and does not update the stored name.

## Detailed specifications

- [Discovery runs](discovery-runs.md)
- [Position reprocessing](position-reprocessing.md)
