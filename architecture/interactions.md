---
type: architecture
scope: interactions
summary: How conversation records and participants are saved together and used to show the latest contact with each person.
load_when:
  - modifying interaction storage or projections
  - investigating consistency errors or deletion/reversion
---
# Interaction Architecture

## Components and Processing Model

This implementation supports Networking's interaction records: emails, calls, meetings, and interviews. It saves the conversation with its participants and calculates when the candidate last contacted each person. The [Networking capability](../capabilities/networking.md) describes the user behavior; the [interfaces](../interfaces/interactions.md) define callable operations.

`InteractionService` uses repositories (objects that read and write stored records) for interactions and participants, reads people and Gigs to check references, and invokes the shared `ChangeExecutor` to record changes. The CLI and agent tools invoke this service. `PeopleService` independently calculates last-contact details and brief interaction references from saved interactions and participant links. `GigDomainService` similarly adds compact interaction references by Gig ID.

Each stored interaction and participant link has a revision number to detect conflicting writes. Deletion sets a flag rather than removing history. The repositories retain snapshots of earlier versions in `interaction_history` and `interaction_participant_history`. Structured metadata is serialized in `structured_data_json`. Database schema checks enforce the allowed category values, timestamp order, JSON object shape, and no correction link to the same record. Service validation additionally checks participants, references, timezone, and correction chains that loop.

## Mutation and Transaction Boundaries

Create validates the complete record and references before one audited transaction writes the interaction and all participant rows. A transaction makes these writes succeed or fail together; the audit records the change so eligible operations can later be reversed. Participant IDs encode interaction-ID length plus interaction/person IDs, avoiding delimiter collisions.

Update reads the existing details, merges the supplied fields, validates the result, and obtains the stored interaction revision. One change transaction updates the interaction, or advances its version when only participants change, deletes removed memberships, and creates or restores added memberships. This is optimistic concurrency: the write must still match the revision read by the service. Update callers do not supply their own expected revision.

Delete first checks the supplied revision, then deletes participant memberships and soft-deletes the interaction in one change. Historical rows remain. Shared reversion can restore eligible changes; persistence guards include preventing reversion of an interaction while an active interaction supersedes it, and preventing restoration of a supersession reference to an inactive predecessor. Ordinary service deletion itself does not perform the same dependent-supersession check.

## Reads and Derived Data

Interaction reads parse the saved JSON metadata, gather undeleted participant links in person-ID order, and validate the assembled record. A malformed stored record produces a consistency error, meaning the stored data cannot form a valid interaction. Queries assemble every undeleted interaction, then filter, sort, and divide results into pages in memory. The service does not push these query operations into the database.

The people projection—the contact fields calculated when reading a person—finds active participant links and selects the latest completed active interaction by parsed start instant, then ascending ID. Date formatting uses the interaction timezone or preserves the encoded date when timezone is null. Summary uses the first value that is not null among summary, notes, and subject. An empty string therefore remains empty. The calculation does not exclude records that have a later correction or a start time in the future. Other statuses do not affect contact recency. Person interaction references include all active statuses, as do Gig references.

## Legacy Provenance and Constraints

The migration converts older meeting records, their history and participants, and distinct saved person last-contact snapshots into interactions. It retains provenance—where an imported record came from—and references to its old identifiers. Legacy business-event records are not converted into interactions by that migration. Existing calendar/event IDs may survive inside structured metadata. This persistence support does not expose a live provider integration.

No separate scheduling worker, status-transition engine, or background process that saves calculated last-contact fields is part of the inspected interaction path. A supersession link identifies an earlier interaction being corrected; it does not remove that record from calculated history.

## Guarantees and Failure Modes

Audited transactions keep interaction and participant writes together. Revision conflict is surfaced through shared mutation errors. Dry-run returns the prepared candidate without committing; it does not execute the database write branch. One invalid composed interaction can fail list/query rather than being silently filtered away. Read-time projections change when qualifying records or memberships change and do not write last-contact fields back to people.

## Used By

[Networking](../capabilities/networking.md) and [contact history](../workflows/interactions-contact-history.md). Other consumers are [tracked Gigs](../capabilities/opportunities.md). No rationale or service-level target is inferred from the current implementation.

## Source Evidence and Verification Anchors

- [Interaction service](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/interaction-service.ts), [schemas](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/interactions.ts), [ChangeExecutor](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/changes.ts)
- [People projections and calendar-date conversion](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/services.ts), [Gig projection](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/gig-domain-service.ts)
- [Repository/history/reversion](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/store.ts), [schema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/schema.ts), [legacy migration](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/interaction-migration.ts)
- [Core service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/services.test.ts): timestamp offsets/timezones/references, participant identity collisions, shared update contract, and contact dates.
- [Read-service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/read-services.test.ts): composable queries, absolute-time sort, invalid records, missing participants.
- [Persistence tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/test/store.test.ts): participant versioning, soft deletion/reversion, contact projection, legacy conversion and retained business events.
- [CLI tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/test/cli.test.ts): create/read/query/update/delete through the shared contract.

These tests were inspected as evidence; no additional broad test run was required for this documentation-only revision.

## Related ADRs

- [ADR 0004: Share one domain input contract across create and update](../decisions/0004-share-domain-input-contracts.md)
- [ADR 0005: Store mutations as revisioned, audited transactions](../decisions/0005-revisioned-audited-change-transactions.md)
- [ADR 0016: Mutate domain-owned tables through the owning domain service](../decisions/0016-own-domain-table-mutations.md)

## Related documents

- [Networking](../capabilities/networking.md)
- [Interaction Interfaces](../interfaces/interactions.md)
- [Record and Correct Contact History](../workflows/interactions-contact-history.md)
