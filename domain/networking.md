---
type: domain
scope: networking
summary: What a contact represents, how relationship status and priority work, and how people relate to opportunities.
load_when:
  - interpreting person fields and status
  - modeling person-to-Gig relationships
---
# Networking Domain

## Definition

A Person is a saved contact who can remain part of the candidate’s network across several opportunities. The same contact record holds relationship context wherever the person is involved.

## Attributes

Name, company, title, LinkedIn profile URL, and connection date describe identity. Relationship type is nonblank free text describing how the candidate knows the person; relationship strength is strong, warm, limited, or unknown. Introducer is optional text, not a required reference to another Person.

Priority is high, medium, low, or unranked, in that order. Relationship notes describe the connection; why-interesting explains why the candidate wants to stay in touch. General notes and tags provide additional context. The last time in touch and profile indicators are calculated from other saved information.

## States

| Stored status | Board lane |
| --- | --- |
| `not_contacted`, `outreach_planned` | Ready to Reach |
| `outreach_sent`, `awaiting_response`, `follow_up_due` | In Motion |
| `conversation_scheduled` | On Calendar; displayed label “Meeting Scheduled.” |
| `active_relationship` | Active Circle |
| `paused`, `do_not_contact` | Excluded from board; retained in underlying people collection. |

## State Transitions

The candidate can move a person directly to any supported status. Time passing and recording interactions do not change it automatically. “Meeting Scheduled” therefore reflects the chosen contact status; it does not itself confirm that a scheduled interaction exists.

## Relationships

A Person can have saved [documents](documents-profile.md), participate in [interactions](interactions.md), be the subject of [tasks](tasks-task.md), and hold roles in [opportunities](opportunities-gig.md). A Gig-person association has its own ID, one Gig ID, one Person ID, a role, and nullable notes. Roles are `interviewer`, `hiring_manager`, `recruiter`, `recruiting_coordinator`, `employee`, `former_peer`, `professional_contact`, and `personal_contact`.

The person-level relationship type and Gig-specific role are separate concepts. An interaction involving a Person and Gig does not implicitly create a Gig-person role.

## Derived Attributes

`lastContacted`, `lastContactMethod`, and `lastContactSummary` follow the [interaction contact-history workflow](../workflows/interactions-contact-history.md). `profileStatus` is verified when a LinkedIn URL is present, otherwise missing. `hasProfile` reflects a linked document with type profile. These indicators can differ. Person creation/update dates are exposed as calendar-date strings.

## Invariants

Public mutation inputs reject blank names, unknown priority/status/strength values, unsupported fields, invalid LinkedIn URLs, and invalid connection dates. At least one field is required for a patch. Notes and tags are not implicitly append-only; supplying an array replaces the existing array.

The active Gig/person/role combination is unique, while multiple different roles may connect the same person and Gig. Public relationship creation validates both references. No standalone person or relationship deletion/merge lifecycle is exposed by the current shared service.

## Related Capabilities

[Networking](../capabilities/networking.md) explains how the candidate uses contacts and outreach priorities. [Networking interfaces](../interfaces/networking.md) define accepted inputs and read results.

## Related Workflows

[Contact history](../workflows/interactions-contact-history.md) owns the rules for showing when the candidate was last in touch.

## Related documents

- [Networking](../capabilities/networking.md)
- [Record and Correct Contact History](../workflows/interactions-contact-history.md)
