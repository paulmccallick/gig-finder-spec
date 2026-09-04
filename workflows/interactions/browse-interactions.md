---
id: browse-interactions
capability: interactions
title: Browse interaction history
summary: Search chronological contact events by participants, Gigs, classifications, time, or text.
aliases: [contact history, meeting list, communication log]
requires: [../../foundations/queries-and-pagination.md, ../../foundations/dates-time-ordering.md]
related: [maintain-interaction.md, ../networking/browse-people.md]
implementation_areas: [src/core/interaction-service.ts, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/read-services.test.ts, src/agent/test/gig-finder-tools.test.ts, src/cli/test/cli.test.ts]
---

# Browse interaction history

## Intent

The candidate wants to inspect recorded communications or locate an exact event for correction.

## Access points

Agent `list_interactions`/`get_interaction`; CLI `interactions list|get`. The dashboard exposes derived references inside Gig/Person data but has no Interaction workspace.

## Preconditions

Filters using People or Gigs use exact IDs. Time bounds are valid offset timestamps.

## Workflow

1. Apply any participant, Gig, kind, channel, direction, status, inclusive start range, or text filters.
2. The system composes each record with its unique participant IDs and structured data.
3. Results sort newest start first and paginate; an exact read returns one full record and revision metadata.

## Decisions and variants

Text matches subject, summary, notes, and location. Multiple person IDs match when an Interaction includes any requested participant. Start range endpoints are inclusive; from after through is rejected.

## State changes

None.

## Outputs and observable effects

Records include semantic kind, delivery channel, direction, lifecycle status, times/timezone, optional location/summary/notes/Gig, correction link, structured data, and metadata.

## Safety rules

Reads never alter Person last-contact projections.

## Failure, retry, and recovery

Malformed bounds fail. Invalid stored structured JSON or broken references produce consistency/validation failure rather than a partial record.

## Known current behavior and limitations

There is no dashboard Interaction list. CLI exposes filtering but not a friendly participant-name join; consumers must resolve IDs separately.

## Related workflows

- [Maintain an interaction](maintain-interaction.md)
