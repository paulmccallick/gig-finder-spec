---
id: contact-recency
capability: networking
title: Interaction-derived contact recency
summary: Project each Person's latest completed contact from current Interaction history.
aliases: [last contacted, latest touchpoint, contact coverage]
requires: [../interactions/interaction-history.md, ../../foundations/dates-time-ordering.md]
workflows: []
operational_models: []
quality_scenarios: [../../quality-scenarios/networking/latest-contact-timezone.md]
variants: []
contracts: []
implementation_areas: [src/core/interaction-service.ts, src/core/services.ts, src/web/client/NetworkingBoard.tsx]
test_suites: [src/core/test/services.test.ts, src/data/test/store.test.ts, src/web/e2e/gig-board.e2e.ts]
---

# Interaction-derived contact recency

## Product role

Owns the single current answer to when and how the candidate last completed contact with each Person. It is a derived networking feature because People, dashboards, and prioritization depend on this projection even though Interactions own the underlying events.

## Feature set

| Constituent behavior | Implemented outcome |
|---|---|
| Eligible-event selection | Considers current, completed, nondeleted Interactions that include the Person. |
| Latest-contact ordering | Chooses the latest contact deterministically across dates, times, time zones, and ties. |
| Person projection | Exposes derived last-contact date, channel, and related summary without direct mutation. |
| History reaction | Recomputes the projection after Interaction create, correction, supersession, or deletion. |

## Purpose and boundary

Contact recency projects the newest completed Interaction onto Person reads as last-contact date, method, and summary. It is derived rather than separately editable Person state, so corrections/deletion immediately change the projection without reconciling duplicate stored fields.

## Access points

Every Person list/detail surface and Networking dashboard metrics/cards consume the projection. There is no direct setter. Interaction create/update/delete is the only supported producer.

## Configuration and defaults

There is no user configuration. Only completed, non-deleted Interactions qualify. Newest is determined by absolute start instant. When an Interaction declares a valid IANA timezone, its displayed calendar date is projected in that zone; without one, the encoded date is preserved.

## Durable state and lifecycle

Interaction records and participant links are durable; contact recency is computed during Person reads. No completed contact yields null date/method/summary. Adding a newer completion changes the projection; correcting, reopening, or deleting it can reveal the next eligible prior Interaction.

## Validation and invariants

Every projected value comes from one qualifying Interaction involving that exact Person. Planned/confirmed/canceled/no-show/deleted records never qualify. Ordering compares absolute instants before local date projection.

## Outputs and downstream effects

Networking cards/detail and metrics show contact coverage and latest touchpoint consistently across Person read surfaces. The projection does not change Person revision/history.

## Nonfunctional Requirements

| Classification | Implemented constraint | Scenario |
|---|---|---|
| Correctness | Latest-contact ordering uses the exact interpreted instant and deterministic tie behavior across time-zone inputs. | [Latest-contact time-zone ordering](../../quality-scenarios/networking/latest-contact-timezone.md) |

## Failure, retry, and recovery

Invalid persisted timestamp/timezone or broken participant structure surfaces a consistency/validation fault rather than fabricating a recency value. Repair the Interaction through supported correction, then reread.

## Current limitations

Method is the Interaction channel and summary may be null. No independent snapshot preserves what a Person view previously projected.

## Detailed specifications

- [Interaction history](../interactions/interaction-history.md)
- [Timezone quality scenario](../../quality-scenarios/networking/latest-contact-timezone.md)
