---
type: domain
scope: interactions
summary: The saved details of a job-search communication or appointment, its participants, status, and correction links.
load_when:
  - modeling an interaction or correction
  - interpreting statuses and timestamp meaning
---
# Interaction

## Definition

An interaction is a saved record of an email, call, meeting, interview, or other communication involving the candidate's contacts. It captures who was involved, when it happened or is planned, and what was discussed. It can concern one tracked Gig. The candidate can use these records to recall previous conversations and see when they last contacted someone.

An interaction is separate from a [task](tasks-task.md) to do something and from the candidate's [conversation with the application agent](../capabilities/conversational-agent.md).

## Attributes

| Attribute | Meaning |
| --- | --- |
| Subject | Required, nonblank description, such as “Recruiter screen.” |
| Kind | What took place: `message`, `call`, `meeting`, `interview`, `conversation`, or `other`. |
| Channel | How it took place: `email`, `linkedin`, `sms`, `chat`, `phone`, `video`, `in_person`, or `other`. |
| Direction | `inbound` to the candidate, `outbound` from the candidate, `mutual`, or `unknown`. |
| Status | `planned`, `confirmed`, `completed`, `canceled`, or `no_show`. |
| Time | Required start; optional end and timezone. The end may equal the start. Exact formats are in the [interface contract](../interfaces/interactions.md). |
| Conversation details | Optional location, summary, and notes; additional structured metadata can be retained. |
| Correction and origin | Optional link to the earlier interaction being corrected and an originating change ID. |
| Identity and history | Permanent ID, record version, deletion flag, and creation/update times. |

Kind, channel, direction, and status are independent choices. For example, an interview can take place by video, phone, or in person; the application does not restrict the combinations.

## Relationships

Each interaction has one or more distinct [people](networking.md) as participants and optionally one [Gig](opportunities-gig.md). Being a participant does not assign the person a recruiter, interviewer, or other role on the Gig.

A correction link, called supersession in the interface, identifies an earlier undeleted interaction. It does not change that earlier record's status or remove it from history. A record cannot correct itself, and correction links cannot form a loop.

Imported records may retain information about their source and previous identifiers. The [architecture](../architecture/interactions.md) describes that migration history; these fields do not imply a live calendar integration.

## States and State Transitions

Any supported status can be chosen when creating or editing a record. Status does not change automatically when the start or end time passes. Only completed records set a participant's last-contact details.

Deletion removes a record and its participant links from ordinary reads while preserving change history. The shared change-reversion mechanism can restore eligible changes; there is no dedicated interaction restore command. See [interfaces](../interfaces/interactions.md) for available operations.

## Invariants

Every participant must refer to an existing person when the interaction is saved. Optional Gig and correction references must also resolve. Every edit must leave at least one participant and a valid complete record, even when only one field changes. The end must not precede the start in actual time.

A supplied timezone controls the date shown in contact details; it does not rewrite the saved timestamp. The application does not require its offset to agree with that timezone. The [contact-history workflow](../workflows/interactions-contact-history.md) explains selection of the latest completed record.

## Related Capabilities and Workflows

[Networking](../capabilities/networking.md) · [Record and correct contact history](../workflows/interactions-contact-history.md)

## Related documents

- [Networking](../capabilities/networking.md)
- [Record and Correct Contact History](../workflows/interactions-contact-history.md)
