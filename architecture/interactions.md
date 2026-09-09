---
type: architecture
scope: interactions
summary: Interaction composition, transactional participant mutation, derived contact recency, and correction persistence.
load_when:
  - modifying interaction storage or projections
  - investigating consistency errors or deletion/reversion
related:
  - capabilities/interactions.md
  - interfaces/interactions.md
  - workflows/interactions-contact-history.md
---
# Interaction Architecture

## Components and Processing Model

`InteractionService` combines the interaction repository, participant repository, People reads, Gig reads, and shared `ChangeExecutor`. The CLI and agent tools invoke this service. `PeopleService` independently derives contact recency and compact references from persisted interactions/participants. `GigDomainService` similarly adds compact interaction references by Gig ID.

Interaction and participant repositories use the shared revisioned, soft-deleted storage model, with `interaction_history` and `interaction_participant_history` snapshots. Structured metadata is serialized in `structured_data_json`. Schema checks enforce enum values, timestamp order, JSON object shape, and no self-supersession; service validation additionally checks participants, references, timezone, and supersession cycles.

## Mutation and Transaction Boundaries

Create validates the complete entity and references before one audited transaction writes the interaction and all participant rows. Participant IDs encode interaction-ID length plus interaction/person IDs, avoiding delimiter collisions.

Update composes current state, validates the merged patch, and obtains the stored interaction revision. One change transaction updates/touches the interaction, deletes removed memberships, and creates or restores added memberships. A participant-only update touches the interaction revision. This is optimistic concurrency at the repository boundary, not a caller-provided expected revision in the update API.

Delete first checks the supplied revision, then deletes participant memberships and soft-deletes the interaction in one change. Historical rows remain. Shared reversion can restore eligible changes; persistence guards include preventing reversion of an interaction while an active interaction supersedes it, and preventing restoration of a supersession reference to an inactive predecessor. Ordinary service deletion itself does not perform the same dependent-supersession check.

## Reads and Derived Data

Interaction reads parse structured JSON, gather active participants in person-ID order, and validate the composed entity. A malformed persisted record produces consistency error. Query currently composes the entire active list, then filters, sorts, and paginates in memory; there is no indexed database query execution in this service.

People projection finds active participant links and selects the latest completed active interaction by parsed start instant, then ascending ID. Date formatting uses the interaction timezone or preserves the encoded date when timezone is null. Summary fallback uses null coalescing, so an empty summary does not fall through to notes. No supersession or current-time exclusion is applied. Other statuses do not affect contact recency. Person interaction references include all active statuses, as do Gig references.

## Legacy Provenance and Constraints

The migration layer converts prior meeting records/history/participants and deduplicated person last-contact snapshots into interaction records and provenance/legacy-reference storage. Legacy business-event records are not converted into interactions by that migration. Existing calendar/event IDs may survive inside structured metadata. This persistence support does not expose a live provider integration.

No separate scheduling worker, status-transition engine, or background recency materialization is part of the inspected interaction path. Supersession remains a validated relationship, not a projection rule removing old records.

## Guarantees and Failure Modes

Audited transactions keep interaction and participant writes together. Revision conflict is surfaced through shared mutation errors. Dry-run returns the prepared candidate without committing; it does not execute the database write branch. One invalid composed interaction can fail list/query rather than being silently filtered away. Read-time projections change when qualifying records or memberships change and do not write last-contact fields back to people.

## Used By

[Interactions](../capabilities/interactions.md) and [contact history](../workflows/interactions-contact-history.md). Cross-capability consumers are people/networking and tracked Gigs. No rationale or service-level target is inferred from the current implementation.

## Source Evidence and Verification Anchors

- [Interaction service](../../gig-finder/src/core/interaction-service.ts), [schemas](../../gig-finder/src/core/interactions.ts), [ChangeExecutor](../../gig-finder/src/core/changes.ts)
- [People projections and calendar-date conversion](../../gig-finder/src/core/services.ts), [Gig projection](../../gig-finder/src/core/gig-domain-service.ts)
- [Repository/history/reversion](../../gig-finder/src/data/store.ts), [schema](../../gig-finder/src/data/schema.ts), [legacy migration](../../gig-finder/src/data/interaction-migration.ts)
- [Core service tests](../../gig-finder/src/core/test/services.test.ts): timestamp offsets/timezones/references, participant identity collisions, shared update contract, and contact dates.
- [Read-service tests](../../gig-finder/src/core/test/read-services.test.ts): composable queries, absolute-time sort, invalid records, missing participants.
- [Persistence tests](../../gig-finder/src/data/test/store.test.ts): participant versioning, soft deletion/reversion, contact projection, legacy conversion and retained business events.
- [CLI tests](../../gig-finder/src/cli/test/cli.test.ts): create/read/query/update/delete through the shared contract.

These tests were inspected as evidence; no additional broad test run was required for this documentation-only addition.
