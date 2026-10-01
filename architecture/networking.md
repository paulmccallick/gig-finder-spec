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

**NET-ARCH-001** The networking services compose stored person fields with managed-document summaries and interaction projections, manage canonical Person/Gig role links, and validate their targets. They are used by CLI and agent surfaces. The HTTP boundary returns People list data; the board filters and groups it locally.

Person records retain identity and relationship workflow fields, with JSON notes/tags and shared revision/deletion metadata. Typed history supports audited changes. Public Person projections omit the underlying storage revision and expose creation/update dates as the first ten characters of stored timestamps. LinkedIn-derived profile status is independent of document-derived profile presence.

## Creation, Duplicates, and Replay

Public agent/CLI person creation parses strict input, applies defaults, validates, calculates a creation payload hash, reconciles a supplied change fingerprint, checks duplicates, and writes person plus fingerprint through one audited change. Matching fingerprints return the current existing record; inconsistent replays throw revision conflict.

Person duplicates are detected before mutation from active rows: exact LinkedIn URL, or normalized case-insensitive name/company. The database does not define a unique index on those natural identity fields, so this is not a database-enforced concurrent uniqueness guarantee. Person update has no duplicate check. The lower-level internal creation path performs fewer checks than the public path.

Role creation validates references, checks active Gig/person/role duplicates, and records a creation fingerprint. A partial unique index enforces the active triple at database level, and corresponding uniqueness failures map to duplicate errors. Different role values remain separate associations. The lower-level internal creation path performs fewer checks than the public path.

## Updates and Consistency

Person updates preserve unspecified nested relationship fields and replace arrays. After validation, persistence writes against the current raw revision through the shared change boundary. Caller input has no expected-revision contract; conflicts during the write are translated there. Dry-run skips the database write branch.

Structured role reads validate supported role values and both target links; query returns a consistency error for malformed relationship values, and validates target existence for selected relationships. Person projection parses stored notes/tags and does not have the same explicit consistency-result conversion for malformed JSON.

## Query and Projection Limits

People query composes the entire active collection before in-memory filtering/sorting/pagination. Each composed person loads document summaries and derives contact fields from active interactions/participants. Contact algorithm authority is [the interaction workflow](../workflows/interactions-contact-history.md).

The agent's person lookup pages all relationship results to add Gig references. Separate convenience queries fetch only their first 50 associations before paging the resulting people/Gigs. They do not deduplicate records when a pair has multiple roles. These limits do not apply to the paginated role query itself or imply a supported maximum number of associations.

## Boundaries and Constraints

The read-only board omits paused/do-not-contact and defaults to high-priority display; those are client visibility rules, not repository filtering. No networking worker or automatic relationship-status transition is present. Creating interactions does not inspect the do-not-contact state. Person profile documents use the managed-document service; LinkedIn URL presence is not an external verification call.

No performance targets or architectural rationale are inferred from these implementation choices.

## Used By

[Networking](../capabilities/networking.md), [agent/CLI/API interfaces](../interfaces/networking.md), and Person consumers in interactions, tasks, and opportunities.

## Implementation References

Current source symbols and verification locations are in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#net-arch-001).
