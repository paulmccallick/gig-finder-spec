---
id: maintain-opportunity-cli
capability: opportunities
workflow: ../../workflows/opportunities/maintain-opportunity.md
surface: cli
summary: CLI accepts strict JSON patches, caller-owned IDs, dry runs, and a touch shorthand.
aliases: [gigs add, gigs update, gigs touch]
requires: [../../workflows/opportunities/maintain-opportunity.md]
---

# Create or maintain an opportunity via CLI

## Exposure

`gig-finder gigs add|update|touch`.

## Inputs and validation

Add/update accept exactly one inline patch or patch file; add JSON ID matches command ID. Touch uses explicit flags. `--dry-run` is optional.

## Interaction sequence

Invoke once and parse structured stdout.

## Outputs or presentation

JSON includes `ok`, `dryRun`, entity/command/ID, and projected/current record.

## Confirmation and authorization

The direct local invocation is authorization; there is no interactive prompt.

## Surface-specific failures

Bad JSON, unknown flags/fields, or missing values return nonzero with a message.

## Refresh and consistency

Writes current configured local database; dashboard sees it only after reload.

## Known limitations

Patch files are recommended but not mandatory for sensitive/long text.

## Shared workflow

[Canonical behavior](../../workflows/opportunities/maintain-opportunity.md)
