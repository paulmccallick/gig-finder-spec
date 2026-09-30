---
type: capability
scope: interactions
summary: Current recording, querying, correction, and deletion of participant-linked job-search interactions.
load_when:
  - understanding interaction behavior
  - changing communication or meeting records
related:
  - domain/interactions.md
  - workflows/interactions-contact-history.md
  - interfaces/interactions.md
  - architecture/interactions.md
---
# Interactions

## Purpose

Record communication and events involving existing people, optionally associated with a tracked Gig, and make those records available as contact history.

## Actors

The user records or changes interactions through the application agent or CLI. Shared application services expose the same domain operations to internal callers.

## Functional Behavior

Create, read, query, update, and soft-delete interactions. Each record has a subject, semantic kind, delivery channel, direction relative to the candidate, lifecycle status, start time, optional end/timezone/location, summary, notes, participants, and optional Gig link. A correction can reference a prior interaction through a supersession link.

Query supports any-of participant/Gig/kind/channel/direction/status filters, inclusive start-time bounds, and case-insensitive text search across subject, summary, notes, and location. Different filter dimensions combine. Results sort newest start instant first, then ID ascending, and are paginated.

People and Gigs expose compact interaction references. The latest completed interaction involving a person supplies their derived last-contact date, method, and summary; see [contact-history workflow](../workflows/interactions-contact-history.md).

## Business Rules

- An interaction has at least one unique existing person. Its optional Gig must exist. Participants need not have a separate Gig-person relationship with that Gig.
- Subject is nonblank. Start and optional end use ISO 8601 timestamps with offsets; end cannot precede start as an absolute instant. Timezone, when supplied, must be accepted as an IANA timezone.
- Supersession must reference an existing active interaction, cannot reference itself, and cannot form a cycle. Multiple records are not prohibited from referencing the same predecessor.
- Updates validate the merged complete record, replace the participant selection when supplied, and retain unspecified fields.
- Delete requires the exact current revision and removes the interaction and active participant links from ordinary reads without physically erasing history.

## State and Lifecycle

Statuses are `planned`, `confirmed`, `completed`, `canceled`, and `no_show`. The service allows updates between these values; there is no enforced transition graph, automatic completion, or clock-triggered status change. Creation defaults status to completed when an internal/CLI caller omits it. Deletion is a separate flag. See [domain](../domain/interactions.md).

## Capability-Specific Nonfunctional Requirements

No distinct interaction latency, availability, or capacity target was established in the inspected code/tests. Revision checks and transactional writes are described in [architecture](../architecture/interactions.md).

## Related Workflows

- [Contact history and correction](../workflows/interactions-contact-history.md)

## Related Domain Objects

- [Interaction and participants](../domain/interactions.md)

## Related Interfaces

- [Agent and CLI contracts](../interfaces/interactions.md)

## Related Architecture

- [Services, projections, and persistence](../architecture/interactions.md)

## Known Constraints

There is no dedicated interaction management page or HTTP CRUD route in the current web handler. Agent tools and CLI are the current mutation surfaces. Calendar identifiers can be retained as structured data; this capability does not itself send messages, invite participants, or synchronize an external calendar.

Supersession records a correction relationship but does not hide the predecessor from lists or last-contact derivation. A future-dated completed interaction can become the latest contact. Neither kind nor direction limits which completed interactions count.
