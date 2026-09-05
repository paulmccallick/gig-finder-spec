---
id: browse-opportunities-cli
capability: opportunities
feature: opportunity-records
workflow: ../../workflows/opportunities/browse-opportunities.md
surface: cli
summary: CLI emits machine-readable full-list or exact-record JSON without filters.
aliases: [gig-finder gigs list, gig-finder gigs get]
requires: [../../workflows/opportunities/browse-opportunities.md]
---

# Browse and inspect opportunities via CLI

## Exposure

`bin/gig-finder gigs list` and `bin/gig-finder gigs get <id>`.

## Inputs and validation

Get requires one ID; list accepts none.

## Interaction sequence

Invoke and parse stdout JSON.

## Outputs or presentation

Success contains `ok`, entity, command, and `records` or `record`.

## Confirmation and authorization

Local invocation authority is sufficient.

## Surface-specific failures

Usage/unknown ID writes an error and returns nonzero.

## Refresh and consistency

Reads the configured local database at invocation.

## Current limitations

No CLI Gig filters or pagination.

## Shared specification

[Canonical behavior](../../workflows/opportunities/browse-opportunities.md)
