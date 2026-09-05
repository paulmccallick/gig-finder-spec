---
id: maintain-interaction
capability: interactions
feature: interaction-history
title: Record or correct an interaction
summary: Create, update, supersede, or soft-delete a contact event with revision safety.
aliases: [log meeting, record message, correct contact]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md, ../../foundations/dates-time-ordering.md]
related: [browse-interactions.md, ../networking/browse-people.md]
implementation_areas: [src/core/interactions.ts, src/core/interaction-service.ts, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/data/test/store.test.ts, src/core/test/input-contracts.test.ts, src/agent/test/gig-finder-tools.test.ts, src/cli/test/cli.test.ts]
---

# Record or correct an interaction

## Intent

The candidate wants durable communication history that updates relationship context without losing auditability.

## Access points

Agent `create_interaction`, `update_interaction`, `delete_interaction`; CLI `interactions add|update|delete`.

## Preconditions

At least one unique exact Person ID; optional exact Gig ID; nonblank subject; valid kind/channel/direction/status; offset start timestamp. Agent deletion requires explicit confirmation and expected current revision.

## Workflow

1. Resolve participants and optional Gig.
2. Supply classifications, time, optional end/timezone/location/summary/notes, and optional superseded Interaction.
3. Validate references, end ordering, timezone, unique participants, and an acyclic supersession chain.
4. Atomically persist the Interaction and participant set.
5. For correction, update explicit fields or create a new Interaction that supersedes a prior one. For deletion, require the exact current revision and soft-delete the event and participant links together.

## Decisions and variants

Kinds: message/call/meeting/interview/conversation/other. Channels: email/linkedin/sms/chat/phone/video/in_person/other. Directions: inbound/outbound/mutual/unknown. Statuses: planned/confirmed/completed/canceled/no_show. Only completed events contribute to a Person's derived latest-contact fields.

## State changes

Create begins revision 1. Updates advance revision and reconcile participant links. Delete advances revision, marks deleted, and removes active participant links. Audit history retains recoverable prior state.

## Outputs and observable effects

The resulting full Interaction is returned. People/Gig reads include affected Interaction references; completed history may change a Person's derived last-contact date, method, and summary.

## Safety rules

Never allow an Interaction to supersede itself or form a cycle. Structured data is accepted by the CLI core contract; agent creation fixes it to an empty object and agent update cannot mutate it. Agent creation also fixes `originChangeId` to null. Agent update currently exposes exact `originChangeId` as a set/clear nullable string even though it is bookkeeping provenance; the value is not resolved against the change ledger. Deletion must not cascade-delete People or Gigs.

## Failure, retry, and recovery

Missing references, stale deletion revision, malformed timestamps, or cyclic correction fail atomically. Re-read before retrying a stale delete. Eligible audited changes may be reverted.

## Current limitations

No dashboard editor exists. `originChangeId` has no dashboard meaning or target-existence validation, but the current strict agent update contract nevertheless supports setting or clearing it. `structuredData` remains CLI-only.

## Related specifications

- [Browse interaction history](browse-interactions.md)
- [Browse people](../networking/browse-people.md)
