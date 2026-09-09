---
type: domain
scope: networking
summary: Person identity, relationship vocabulary, board status mapping, and Gig-person roles.
load_when:
  - interpreting person fields and status
  - modeling person-to-Gig relationships
related:
  - capabilities/networking.md
  - workflows/interactions-contact-history.md
---
# Networking Domain

## Definition and Attributes

A Person is a canonical contact independent of any particular Gig. Name, company, title, LinkedIn profile URL, and connection date describe identity. Relationship type is nonblank free text describing how the candidate knows the person; relationship strength is strong, warm, limited, or unknown. Introducer is optional text, not a required reference to another Person.

Priority is high, medium, low, or unranked, in that order. Notes and tags are replacement lists; relationship notes and why-interesting are nullable text. Derived contact fields and document/profile indicators are not mutable identity fields.

## States and Board Mapping

| Stored status | Board lane |
| --- | --- |
| `not_contacted`, `outreach_planned` | Ready to Reach |
| `outreach_sent`, `awaiting_response`, `follow_up_due` | In Motion |
| `conversation_scheduled` | On Calendar; displayed label “Meeting Scheduled.” |
| `active_relationship` | Active Circle |
| `paused`, `do_not_contact` | Excluded from board; retained in underlying people collection. |

No enforced transitions or time-driven status changes exist. The statuses describe manually maintained relationship workflow, not necessarily the status of a specific interaction.

## Relationships

A Person can own managed documents, participate in interactions, and have multiple Gig-person role associations. A Gig-person association has its own ID, one Gig ID, one Person ID, a role, and nullable notes. Roles are `interviewer`, `hiring_manager`, `recruiter`, `recruiting_coordinator`, `employee`, `former_peer`, `professional_contact`, and `personal_contact`.

The person-level relationship type and Gig-specific role are separate concepts. An interaction involving a Person and Gig does not implicitly create a Gig-person role.

## Derived Attributes

`lastContacted`, `lastContactMethod`, and `lastContactSummary` follow the [interaction contact-history workflow](../workflows/interactions-contact-history.md). `profileStatus` is verified when a LinkedIn URL is present, otherwise missing. `hasProfile` reflects a linked document with type profile. These indicators can differ. Person creation/update dates are exposed as calendar-date strings.

## Invariants and Lifecycle Constraints

Public mutation inputs reject blank names, unknown priority/status/strength values, unsupported fields, invalid LinkedIn URLs, and invalid connection dates. At least one field is required for a patch. Notes and tags are not implicitly append-only; supplying an array replaces the existing array.

The active Gig/person/role combination is unique, while multiple different roles may connect the same person and Gig. Public relationship creation validates both references. No standalone person or relationship deletion/merge lifecycle is exposed by the current shared service.

## Related Capabilities and Workflows

[Networking](../capabilities/networking.md) · [Contact history](../workflows/interactions-contact-history.md)
