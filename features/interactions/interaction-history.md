---
id: interaction-history
capability: interactions
title: Interaction history
summary: Record planned or completed contact events and derive Person contact recency.
aliases: [Interaction, contact event, meeting history]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md, ../../foundations/dates-time-ordering.md]
workflows: [../../workflows/interactions/browse-interactions.md, ../../workflows/interactions/maintain-interaction.md]
operational_models: []
quality_scenarios: []
variants: [../../variants/interactions/maintain-interaction-agent-tool.md]
contracts: [../../contracts/operations/list_interactions.schema.json, ../../contracts/operations/get_interaction.schema.json, ../../contracts/operations/create_interaction.schema.json, ../../contracts/operations/update_interaction.schema.json, ../../contracts/operations/delete_interaction.schema.json]
implementation_areas: [src/core/interactions.ts, src/core/interaction-service.ts, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test, src/data/test/store.test.ts, src/agent/test, src/cli/test]
---

# Interaction history

## Purpose and boundary

An Interaction records one message, call, meeting, interview, conversation, or other contact event involving one or more People and optionally one Gig. It provides immutable/correctable history and derives latest completed contact; it is not a Task or Person status.

## Access points

Agent tools and the supported CLI list, read, create, update, and soft-delete. There is no dedicated Interaction dashboard.

## Configuration and defaults

There is no independent configuration. Kinds are `message`, `call`, `meeting`, `interview`, `conversation`, and `other`; channels are `email`, `linkedin`, `sms`, `chat`, `phone`, `video`, `in_person`, and `other`; direction is `inbound`, `outbound`, `mutual`, or `unknown`; status is `planned`, `confirmed`, `completed`, `canceled`, or `no_show`. Date/time values are explicit surface inputs.

## Durable state and lifecycle

An Interaction can be planned or completed, updated at an expected revision, supersede a prior Interaction as a correction chain, or be soft-deleted. History/audit is retained. Latest-contact fields on every participant are derived from the most recent completed, non-deleted qualifying event and recomputed after corrections/deletion.

## Validation and invariants

At least one unique existing Person is required; optional Gig must exist. Exact IDs and expected revision protect targeted updates/deletion. A superseded target must exist and correction relationships cannot erase history. Direct Person latest-contact mutation is prohibited.

## Outputs and downstream effects

Reads filter/order current Interaction records and expose exact participants/Gig. Successful completed-event mutation may change derived last-contact date/type on multiple People without treating those derivations as direct Person edits.

## Failure, retry, and recovery

Missing participants/Gig, invalid dates/vocabularies, duplicate participants, stale revision, or invalid correction chain fails atomically. Re-read Interaction and affected People before intentional retry.

## Current limitations

Only Interactions have a supported delete among core tracker records, and it is soft deletion. There is no Interaction board or dashboard editor.

## Detailed specifications

- [Browse interactions](../../workflows/interactions/browse-interactions.md)
- [Record or correct an interaction](../../workflows/interactions/maintain-interaction.md)
