---
id: browse-opportunities-agent-tool
capability: opportunities
feature: opportunity-records
workflow: ../../workflows/opportunities/browse-opportunities.md
surface: agent-tool
summary: Strict paginated tools support structured filtering and exact detail.
aliases: [list_gigs, get_gig]
requires: [../../workflows/opportunities/browse-opportunities.md]
contract: ../../contracts/operations/list_gigs.schema.json
---

# Browse and inspect opportunities via agent tool

## Exposure

The conversation runtime exposes `search_gigs_and_people`, `list_gigs`, and `get_gig`.

## Inputs and validation

All fields are present in strict tool calls; optional filters use null. Lists are nonempty when non-null. Offset null defaults 0; limit null defaults 20 and cannot exceed 50.

## Interaction sequence

Search names when resolving identity, list/filter, then use the returned exact ID for detail.

## Outputs or presentation

`list_gigs` and `get_gig` preserve status-bearing `ok`, `not_found`, and `consistency_error` service results. `search_gigs_and_people` instead returns the exact raw object `{ gigs, people, truncated }`, with no status wrapper; each match carries its characterized identity/display fields. Tool execution failures use stable error categories outside those success shapes.

## Confirmation and authorization

Reads need no confirmation.

## Surface-specific failures

Invalid strict input is rejected before execution; stored inconsistency is not converted into a plausible record.

## Refresh and consistency

Each operation reads current durable state.

## Current limitations

No snapshot spans multiple pages.

## Shared specification

[Canonical behavior](../../workflows/opportunities/browse-opportunities.md)
