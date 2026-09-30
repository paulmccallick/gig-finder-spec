---
type: workflow
scope: interactions-contact-history
summary: Record or correct a job-search conversation and see the resulting last-contact details on each participant.
load_when:
  - explaining last-contact values
  - correcting an interaction while preserving history
---
# Record and Correct Contact History

## Purpose

Save what happened in an email exchange, call, meeting, or interview so the candidate can review it before the next conversation. Each participant's last-contact details then show the most recent completed interaction, helping the candidate remember when they last spoke and what they discussed.

## Actors

The job seeker, assisted by the [application agent](../capabilities/conversational-agent.md) or command-line tool, records the conversation. Later, the candidate or agent reads a person's contact details or a Gig's interaction history.

## Trigger

The candidate records a conversation or appointment, corrects its details or participants, changes whether it happened, or deletes it.

## Preconditions

The participants must already be saved as people. Any linked Gig must also exist. To edit or delete an interaction, identify the existing record; deletion also requires its current version.

## Inputs

Supply who was involved, a subject, and a start time. Choose the kind of interaction, how it took place, whether it was incoming or outgoing, and its status. Add a summary, notes, and a Gig link when useful. A new correction may identify the earlier record it corrects.

## Normal Flow

1. Record the conversation and participants, including what happened in the summary or notes. For example, record a completed video interview with the recruiter and link it to the relevant Gig.
2. The application checks the details and saved people/Gig, then saves the interaction and its participant links together.
3. On the next person read, the application finds that person's latest undeleted, completed interaction by start time. If two start at the same instant, their IDs determine which is selected.
4. The person's last-contact details show that interaction's date and communication channel. The summary uses the saved summary, otherwise notes, otherwise subject. An empty saved summary remains empty.
5. Person and linked Gig records include brief interaction references, newest first. These references also include planned, confirmed, canceled, and no-show records, although those statuses do not set last-contact details.

## Alternate Flows

After a planned or confirmed appointment happens, mark it completed and add notes. If a completed record changes to another status, it stops setting last-contact details. Changing participants changes whose history includes it; changing the Gig link moves it to the other Gig's history without assigning participants a role on that Gig.

A new record can point to an earlier record as a correction. Both remain visible and both can set last-contact details if completed. The start time, rather than the correction link, determines which is latest.

Deleting an interaction removes it from ordinary history. Last-contact details then come from the next most recent completed interaction, or become empty if none remains. The shared [change-reversion mechanism](../interfaces/api/conversational-agent.md) can restore an eligible deleted change.

## Failure Behavior

The application rejects missing people or Gigs, an empty or repeated participant selection, invalid times or timezones, an end before the start, or a correction chain that loops. A deletion using an outdated version is rejected. Invalid stored records cause a read error; technical error responses are described in the [interface contract](../interfaces/interactions.md).

## Completion / Postconditions

The saved record contains the conversation details and participants. Reading a participant now calculates their last-contact details from the current history. The date uses the interaction's timezone if supplied, otherwise the date written in its start timestamp. Saving the record does not contact anyone or create a calendar invitation.

## Nonfunctional Requirements

No separate timing target is established. The [architecture](../architecture/interactions.md) explains how conversation details and participant links remain part of the same saved change.

## Related Documentation

[Networking capability](../capabilities/networking.md) · [Interaction model](../domain/interactions.md) · [Interfaces](../interfaces/interactions.md) · [Architecture](../architecture/interactions.md)

## Related documents

- [Networking](../capabilities/networking.md)
- [Interaction](../domain/interactions.md)
- [Interaction Interfaces](../interfaces/interactions.md)
- [Interaction Architecture](../architecture/interactions.md)
