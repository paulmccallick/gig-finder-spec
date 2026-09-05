---
id: maintain-interaction-agent-tool
capability: interactions
feature: interaction-history
workflow: ../../workflows/interactions/maintain-interaction.md
surface: agent-tool
summary: Agent uses strict creation/update contracts and confirmation-gated expected-revision deletion.
aliases: [create_interaction, delete_interaction]
requires: [../../workflows/interactions/maintain-interaction.md]
contract: ../../contracts/operations/create_interaction.schema.json
---

# Record or correct an interaction via Agent tool

## Exposure

`create_interaction`, `update_interaction`, and `delete_interaction`.

## Inputs and validation

Create requires every exposed field and exact participant IDs. Update uses ordered set/clear operations. Delete requires exact positive revision.

## Interaction sequence

Resolve records, confirm effect, execute, and report friendly summary.

## Outputs or presentation

Success returns status, record, and change ID.

## Confirmation and authorization

Deletion explicitly requires confirmation; general mutation consent applies to all writes.

## Surface-specific failures

Strict schema, missing reference, and revision conflicts are stable visible errors.

## Refresh and consistency

Dashboard collections reload after successful mutation, though Interactions have no dedicated dashboard.

## Current limitations

Agent creation does not expose arbitrary structured data.

## Shared specification

[Canonical behavior](../../workflows/interactions/maintain-interaction.md)
