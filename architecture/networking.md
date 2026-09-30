---
type: architecture
scope: networking
summary: How contacts and opportunity roles are stored, checked for duplicates, and combined with documents and interaction history.
load_when:
  - changing person persistence or duplicate handling
  - investigating networking queries and revision behavior
---
# Networking Architecture

## Purpose

Support [Networking](../capabilities/networking.md) by keeping one saved contact available across opportunities and returning the context needed to plan outreach. This document explains the implementation behind the [networking interfaces](../interfaces/networking.md).

## Components

`PeopleService` reads and changes contacts, adding document summaries and interaction history to returned records. `GigPeopleService` creates and reads a person’s roles in opportunities and checks that both records exist. The shared application supplies these services to the CLI and agent. The HTTP handler returns the people list; `NetworkingBoard` filters and groups that list in the browser.

## Data Flow

Person rows store identity, relationship details, priority, and status. Notes and tags are JSON arrays. Shared revision and deletion fields support the [persistence and change history](persistence.md), including `person_history` and `gig_person_history`. Returned Person records omit the storage revision and shorten creation/update timestamps to calendar dates. `profileStatus` depends on the LinkedIn URL; `hasProfile` depends on linked documents.

## Processing Model

Agent and CLI creation use `createNew`. It validates input, fills defaults, checks whether the request already succeeded, checks for duplicates, then saves the person and a fingerprint of the creation request in one audited change. Repeating the same change ID with the same entity ID and payload returns the existing record. Reusing it for different content raises a revision conflict.

Person duplicates are detected before mutation from active rows: exact LinkedIn URL, or normalized case-insensitive name/company. The database does not define a unique index on those natural identity fields, so this is not a database-enforced concurrent uniqueness guarantee. Person update has no duplicate check. The older internal `create` method applies defaults/validation but does not perform `createNew` duplicate/fingerprint logic; it is not the agent/CLI create path.

Role creation uses `GigPeopleService.createNew`, validates references, checks active Gig/person/role duplicates, and records a creation fingerprint. A partial unique index enforces the active triple at database level, and corresponding uniqueness failures map to duplicate errors. Different role values remain separate associations. The older internal create method is thinner than this public path.

## Guarantees

Person updates use `deepPatch` to preserve unspecified nested relationship fields and replace arrays. After validation, persistence writes against the current raw revision through the shared ChangeExecutor. Caller input has no expected-revision contract; conflicts during the write are translated by the shared change boundary. Dry-run skips the database write branch.

## Failure Modes

Structured role reads validate the role value and both referenced records. Queries return a consistency error for unsupported stored roles and missing targets in matching relationships. Person reads parse stored notes and tags as JSON; malformed JSON can throw instead of returning a structured consistency error.

## Scaling Characteristics

People query composes the entire active collection before in-memory filtering/sorting/pagination. Each composed person loads document summaries and derives contact fields from active interactions/participants. The rules for choosing the last completed conversation and deriving its date, method, and summary belong to [contact history](../workflows/interactions-contact-history.md).

The agent's `get_person` helper pages all relationship results to add Gig references. Separate core convenience methods `peopleForGig` and `gigsForPerson` fetch only their first 50 associations before paging the resulting people/Gigs. They do not deduplicate records when a pair has multiple roles. These limits do not apply to the paginated role query itself or imply a supported maximum number of associations.

## Constraints

The read-only board omits paused/do-not-contact and defaults to high-priority display; those are client visibility rules, not repository filtering. No networking worker or automatic relationship-status transition is present. Creating interactions does not inspect the do-not-contact state. Person profile documents use the managed-document service; LinkedIn URL presence is not an external verification call.

No performance targets or architectural rationale are inferred from these implementation choices.

## Used By

[Networking](../capabilities/networking.md) and its [agent, CLI, and API interfaces](../interfaces/networking.md). Related consumers are implemented in [interactions](interactions.md), [tasks](tasks.md), and [opportunities](opportunities.md).

## Related Requirements

[Shared quality constraints](../requirements/global-nfrs.md) and [reliability](../requirements/reliability.md) describe established guarantees and their limits.

## Related ADRs

- [ADR 0004: Share one domain input contract across create and update](../decisions/0004-share-domain-input-contracts.md)
- [ADR 0005: Store mutations as revisioned, audited transactions](../decisions/0005-revisioned-audited-change-transactions.md)
- [ADR 0016: Mutate domain-owned tables through the owning domain service](../decisions/0016-own-domain-table-mutations.md)

## Source Evidence and Verification Anchors

- [People and GigPeople services](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/services.ts), [deep merge behavior](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/deep-patch.ts), [change execution](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/changes.ts)
- [People and role schema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/schema.ts), [active triple uniqueness migration](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/migrations/0020_active_gig_people.sql), [revisioned repository](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/store.ts)
- [Agent full relationship paging](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts), [CLI adapters](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/db-store.ts), [board](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/NetworkingBoard.tsx)
- [Service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/services.test.ts): neutral person defaults, role duplicate/reference validation, contact projection, shared input behavior.
- [Read-service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/read-services.test.ts): person/relationship filters and consistency behavior.

## Related documents

- [Networking](../capabilities/networking.md)
- [Networking Interfaces](../interfaces/networking.md)
- [Record and Correct Contact History](../workflows/interactions-contact-history.md)
