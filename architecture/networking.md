---
type: architecture
scope: networking
summary: Networking service composition, duplicate/replay checks, read-time projections, and relationship persistence limits.
load_when:
  - changing person persistence or duplicate handling
  - investigating networking queries and revision behavior
related:
  - capabilities/networking.md
  - interfaces/networking.md
  - workflows/interactions-contact-history.md
---
# Networking Architecture

## Components and Data Flow

`PeopleService` composes stored person fields with managed-document summaries and interaction projections. `GigPeopleService` manages canonical Person/Gig role links and validates their targets. Both are constructed in the shared application and used by CLI/agent. The HTTP handler returns People list data; `NetworkingBoard` filters/groups it locally.

Person rows retain identity and relationship workflow fields, with JSON notes/tags and shared revision/deletion metadata. `person_history` and `gig_person_history` support audited changes. Public Person projections omit the underlying storage revision and expose creation/update dates as the first ten characters of stored timestamps. LinkedIn-derived profileStatus is independent of document-derived hasProfile.

## Creation, Duplicates, and Replay

Public agent/CLI person creation uses `createNew`: parse strict input, apply defaults, validate, calculate creation payload hash, reconcile a supplied change fingerprint, check duplicates, and write person plus fingerprint through one audited change. Matching fingerprints return the current existing record; inconsistent replays throw revision conflict.

Person duplicates are detected before mutation from active rows: exact LinkedIn URL, or normalized case-insensitive name/company. The database does not define a unique index on those natural identity fields, so this is not a database-enforced concurrent uniqueness guarantee. Person update has no duplicate check. The older internal `create` method applies defaults/validation but does not perform `createNew` duplicate/fingerprint logic; it is not the agent/CLI create path.

Role creation uses `GigPeopleService.createNew`, validates references, checks active Gig/person/role duplicates, and records a creation fingerprint. A partial unique index enforces the active triple at database level, and corresponding uniqueness failures map to duplicate errors. Different role values remain separate associations. The older internal create method is thinner than this public path.

## Updates and Consistency

Person updates use `deepPatch` to preserve unspecified nested relationship fields and replace arrays. After validation, persistence writes against the current raw revision through the shared ChangeExecutor. Caller input has no expected-revision contract; conflicts during the write are translated by the shared change boundary. Dry-run skips the database write branch.

Structured role reads validate supported role values and both target links; query returns a consistency error for malformed relationship values, and validates target existence for selected relationships. Person projection parses stored notes/tags and does not have the same explicit consistency-result conversion for malformed JSON.

## Query and Projection Limits

People query composes the entire active collection before in-memory filtering/sorting/pagination. Each composed person loads document summaries and derives contact fields from active interactions/participants. Contact algorithm authority is [the interaction workflow](../workflows/interactions-contact-history.md).

The agent's `get_person` helper pages all relationship results to add Gig references. Separate core convenience methods `peopleForGig` and `gigsForPerson` fetch only their first 50 associations before paging the resulting people/Gigs. They do not deduplicate records when a pair has multiple roles. These limits do not apply to the paginated role query itself or imply a supported maximum number of associations.

## Boundaries and Constraints

The read-only board omits paused/do-not-contact and defaults to high-priority display; those are client visibility rules, not repository filtering. No networking worker or automatic relationship-status transition is present. Creating interactions does not inspect the do-not-contact state. Person profile documents use the managed-document service; LinkedIn URL presence is not an external verification call.

No performance targets or architectural rationale are inferred from these implementation choices.

## Used By

[Networking](../capabilities/networking.md), [agent/CLI/API interfaces](../interfaces/networking.md), and Person consumers in interactions, tasks, and opportunities.

## Source Evidence and Verification Anchors

- [People and GigPeople services](../../gig-finder/src/core/services.ts), [deep merge behavior](../../gig-finder/src/core/deep-patch.ts), [change execution](../../gig-finder/src/core/changes.ts)
- [People and role schema](../../gig-finder/src/data/schema.ts), [active triple uniqueness migration](../../gig-finder/src/data/migrations/0020_active_gig_people.sql), [revisioned repository](../../gig-finder/src/data/store.ts)
- [Agent full relationship paging](../../gig-finder/src/agent/gig-finder-tools.ts), [CLI adapters](../../gig-finder/src/cli/db-store.ts), [board](../../gig-finder/src/web/client/NetworkingBoard.tsx)
- [Service tests](../../gig-finder/src/core/test/services.test.ts): neutral person defaults, role duplicate/reference validation, contact projection, shared input behavior.
- [Read-service tests](../../gig-finder/src/core/test/read-services.test.ts): person/relationship filters and consistency behavior.

Source and existing tests were inspected; no additional broad test execution was needed for this documentation-only addition.
