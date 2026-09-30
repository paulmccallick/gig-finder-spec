---
type: capability
scope: networking
summary: Current canonical person records, networking board, relationship lifecycle, and Gig-person associations.
load_when:
  - understanding networking or person behavior
  - changing relationship management
related:
  - domain/networking.md
  - interfaces/networking.md
  - architecture/networking.md
  - workflows/interactions-contact-history.md
---
# Networking

## Purpose

Maintain canonical people, relationship context and priorities, and their roles in tracked Gigs. Present an actionable relationship board and expose person data to the agent and CLI.

## Actors

The user browses the board and uses the application agent or CLI to create/update people and create Gig-person relationships.

## Functional Behavior

Person records capture name, optional company/title/LinkedIn URL/connection date, relationship type and strength, introducer, relationship notes, priority, workflow status, reasons for interest, notes, and tags. People can exist independently of any Gig and can be associated with multiple Gigs in distinct roles.

The board groups actionable people into Ready to Reach, In Motion, On Calendar, and Active Circle. It defaults to high priority, supports text/priority/first-tranche filtering, and opens a read-only person detail drawer. Summary metrics count all actionable people, independently of the current filters. Paused and do-not-contact people are omitted from the board but remain available through service, agent, CLI, and API reads.

Person records include managed-document summaries and compact interaction references. Contact recency comes from completed interactions, as defined in [contact history](../workflows/interactions-contact-history.md), rather than editable person contact fields. Follow-up work is represented by tasks, not person next-action fields.

## Business Rules

- Name is required. New people default to professional-contact relationship, unknown strength, unranked priority, and not-contacted status; optional identity/relationship text defaults null and notes/tags default empty lists.
- A supplied LinkedIn profile URL must use HTTPS on linkedin.com or www.linkedin.com under `/in/`. Connection dates must be valid YYYY-MM-DD dates on the public input path.
- New-person creation rejects an active person with the same exact LinkedIn URL, or case-insensitively equal name and company. Null company and empty company compare as the same company. No fuzzy matching or automatic merge occurs.
- Person updates do not perform the creation duplicate check. They merge nested relationship fields, replace notes/tags lists, and permit explicit clearing of nullable fields.
- A Gig-person role requires existing Gig and Person IDs. The same Gig/person/role combination cannot be created twice while active; different roles for the same pair are permitted.

## State and Lifecycle

Statuses are not-contacted, outreach-planned, outreach-sent, awaiting-response, conversation-scheduled, active-relationship, follow-up-due, paused, and do-not-contact. They can be set directly without an enforced transition graph. Neither an interaction nor a date automatically changes the relationship status. See [domain](../domain/networking.md) for exact values and board mapping.

## Capability-Specific Nonfunctional Requirements

No distinct networking service-level target was established from the inspected code/tests. Current storage and query limitations are [architecture details](../architecture/networking.md).

## Related Workflows

- [Derived contact history](../workflows/interactions-contact-history.md)

## Related Domain Objects

- [Person and Gig-person role](../domain/networking.md)

## Related Interfaces

- [Board, agent, CLI, and API](../interfaces/networking.md)

## Related Architecture

- [Person and association services](../architecture/networking.md)

## Known Constraints

The board is read-only. Current People service/agent/CLI expose create and update but no dedicated delete/merge operation; Gig-person relationships expose create/read/query without a public update/delete operation.

The label `profileStatus: verified` only means a LinkedIn URL is present; the application does not verify the remote profile. `hasProfile` separately means a linked managed document of type profile exists. A profile document does not by itself change profileStatus. Do-not-contact is a recorded workflow value and board exclusion; interaction creation is not blocked by it.
