---
type: capability
scope: networking
summary: Keeping contacts, prioritizing outreach, recording interactions, and remembering relationships and roles in opportunities.
load_when:
  - understanding networking or person behavior
  - changing relationship management
---
# Networking

## Purpose

Keep the people involved in the job search in one place, decide whom to contact next, and remember how the candidate knows them. Connect a person to the opportunities where they can help or are involved in hiring.

## Actors

The candidate reviews contacts on the Networking board and asks the assistant, or uses the command line, to add people, update their details, and connect them to opportunities.

## Functional Behavior

Each contact keeps identity details, how the candidate knows them, who introduced them, relationship strength, and notes about why the relationship matters. Priority helps the candidate focus outreach; status records where the relationship stands. A contact can exist before there is a specific opportunity and can hold different roles in several [opportunities](opportunities.md), such as recruiter for one and former peer for another.

The board groups actionable people into Ready to Reach, In Motion, On Calendar, and Active Circle. It initially shows high-priority contacts. Search, priority, and a tagged first-group filter narrow the cards; opening a card shows the person’s details. Summary counts cover all contacts except those paused or marked do not contact, even when filters hide some cards. Paused and do-not-contact contacts remain saved and can still be retrieved through the assistant, command line, and API.

A contact also brings together references to saved [documents](documents-profile.md) and [interactions](../domain/interactions.md). The application shows when the candidate was last in touch, the communication method, and a short summary from completed interactions. The authoritative rules for calculating and correcting those details are in [contact history](../workflows/interactions-contact-history.md). Planned follow-up work belongs in [tasks](tasks.md).

Networking also covers the interaction records that make contact history useful. The candidate can record an email, call, meeting, interview, or other exchange with one or more contacts, optionally link it to an opportunity, and later correct or remove it. Interaction fields, statuses, query behavior, and mutation rules remain in the supporting [interaction domain](../domain/interactions.md), [interfaces](../interfaces/interactions.md), and [architecture](../architecture/interactions.md) documents.

## Business Rules

- Name is required. New people default to professional-contact relationship, unknown strength, unranked priority, and not-contacted status; optional identity/relationship text defaults null and notes/tags default empty lists.
- A supplied LinkedIn profile URL must use HTTPS on linkedin.com or www.linkedin.com under `/in/`. Connection dates must be valid YYYY-MM-DD dates on the public input path.
- New-person creation rejects an active person with the same exact LinkedIn URL, or case-insensitively equal name and company. Null company and empty company compare as the same company. No fuzzy matching or automatic merge occurs.
- Person updates do not perform the creation duplicate check. They merge nested relationship fields, replace notes/tags lists, and permit explicit clearing of nullable fields.
- A Gig-person role requires existing Gig and Person IDs. The same Gig/person/role combination cannot be created twice while active; different roles for the same pair are permitted.

## State and Lifecycle

Statuses are not-contacted, outreach-planned, outreach-sent, awaiting-response, conversation-scheduled, active-relationship, follow-up-due, paused, and do-not-contact. The candidate can change directly between these statuses. Recording a conversation or reaching a date does not change the status automatically. See [domain](../domain/networking.md) for exact values and board mapping.

## Capability-Specific Nonfunctional Requirements

No networking-specific performance or capacity target is established. [Shared quality constraints](../requirements/global-nfrs.md) describe application-wide guarantees and limits.

## Related Workflows

- [Derived contact history](../workflows/interactions-contact-history.md)

## Related Interaction Detail

- [Interaction domain](../domain/interactions.md)
- [Interaction interfaces](../interfaces/interactions.md)
- [Interaction architecture](../architecture/interactions.md)

## Related Domain Objects

- [Person and Gig-person role](../domain/networking.md)

## Related Interfaces

- [Board, agent, CLI, and API](../interfaces/networking.md)

## Related Architecture

- [Person and association services](../architecture/networking.md)

## Known Constraints

The board is read-only. Current People service/agent/CLI expose create and update but no dedicated delete/merge operation; Gig-person relationships expose create/read/query without a public update/delete operation.

The label `profileStatus: verified` only means a LinkedIn URL is present; the application does not verify the remote profile. `hasProfile` separately means a linked managed document of type profile exists. A profile document does not by itself change profileStatus. Do-not-contact is a recorded workflow value and board exclusion; interaction creation is not blocked by it.

## Related documents

- [Networking Domain](../domain/networking.md)
- [Networking Interfaces](../interfaces/networking.md)
- [Networking Architecture](../architecture/networking.md)
- [Record and Correct Contact History](../workflows/interactions-contact-history.md)
