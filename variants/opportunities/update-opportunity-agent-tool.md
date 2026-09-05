---
id: update-opportunity-agent-tool
capability: opportunities
feature: opportunity-records
workflow: ../../workflows/opportunities/maintain-opportunity.md
surface: agent-tool
summary: Agent update applies confirmed ordered set/clear operations to one exact Gig.
aliases: [update_gig, edit Gig]
requires: [../../workflows/opportunities/maintain-opportunity.md]
contract: ../../contracts/operations/update_gig.schema.json
---

# Update an opportunity via Agent tool

## Exposure

Conversation tool `update_gig`.

## Inputs and validation

Use the exact contract. Runtime invocation supplies its `input`, containing exact Gig ID and a nonempty operation list. Workflow refinements bind each value to its selected field and reject whole/nested collisions.

## Interaction sequence

Read exact Gig, present changed friendly fields, confirm, execute, and report the complete current record.

## Outputs or presentation

Success returns `status: ok`, record, and change ID; stable error category/message otherwise.

## Confirmation and authorization

Explicit confirmation is required.

## Surface-specific failures

Missing Gig, invalid clear/set, cross-field contradiction, or concurrent revision conflict leaves no update.

## Refresh and consistency

Success triggers dashboard reload.

## Current limitations

No caller-supplied expected revision and no availability field.

## Shared specification

[Canonical behavior](../../workflows/opportunities/maintain-opportunity.md)
