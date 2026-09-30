---
type: workflow
scope: interactions-contact-history
summary: How recording, correcting, and deleting interactions changes person contact history and linked Gig references.
load_when:
  - explaining last-contact values
  - correcting an interaction while preserving history
related:
  - capabilities/interactions.md
  - domain/interactions.md
  - interfaces/interactions.md
  - architecture/interactions.md
---
# Record and Correct Contact History

## Purpose

Retain communication history and derive person contact recency from recorded completed interactions.

## Actors

User or agent, interaction service, and subsequent readers of people or Gigs.

## Trigger

Record an interaction, change its status/content/participants, record a superseding correction, or delete a record. Subsequent person/Gig reads expose changed history.

## Preconditions

Resolve exact existing person IDs and, if needed, Gig ID. Deletion requires the current interaction revision.

## Inputs

Subject and start instant, plus meaningful kind/channel/direction/status. A correction may supply a predecessor ID.

## Normal Flow

1. Validate the complete interaction, timestamp order, participants, and references.
2. Persist the interaction and its participant memberships together as one audited change.
3. When reading a person, collect active interactions involving that person's active participant links.
4. Select the completed interaction with greatest start instant, breaking ties by ascending interaction ID.
5. Derive last-contact date in the declared timezone; without one, use the date encoded in the original start timestamp. Method is channel; summary is the first non-null value among summary, notes, and subject.
6. Return person interaction references and, for an associated Gig, its compact interaction references, ordered newest first.

## Alternate Flows

A planned/confirmed interaction can be marked completed later, making it eligible for recency. A completed record changed to another status stops contributing. Changing participants changes which people's histories include it. Updating the optional Gig moves its Gig association without creating a person-Gig role.

A superseding correction leaves the prior record active. Both remain in queries and can contribute to contact history. The supersession relation does not establish which completed record wins: start time still controls.

Deletion soft-deletes the interaction and its participant records. The next read derives recency from the next qualifying completed record, or returns null contact fields. Audited change reversion can restore eligible history through the shared change capability.

## Failure Behavior

Reject missing references, empty/duplicate participants, invalid timestamps/timezone, reversed start/end order, or a supersession cycle before mutation. Reject stale deletion revisions. Malformed persisted interaction data returns a consistency error on structured read and causes ordinary get/list composition to fail rather than silently omitting the record.

## Completion / Postconditions

A committed mutation returns the record and change ID. Contact fields are read-time projections rather than separately written person fields. No outbound message or calendar operation is implied.

## Nonfunctional Requirements

No separate end-to-end timing target is established. See [architecture](../architecture/interactions.md) for transaction and read composition.

## Related Documentation

[Capability](../capabilities/interactions.md) · [Domain](../domain/interactions.md) · [Interfaces](../interfaces/interactions.md)
