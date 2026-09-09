---
type: domain
scope: interactions
summary: Interaction attributes, participant/Gig relationships, status vocabulary, and correction invariants.
load_when:
  - modeling an interaction or correction
  - interpreting statuses and timestamp meaning
related:
  - capabilities/interactions.md
  - workflows/interactions-contact-history.md
---
# Interaction

## Definition

A durable communication or event involving one or more people and optionally one tracked Gig. An interaction is distinct from the application's agent conversation and from a task requesting future work.

## Attributes

| Dimension | Values or meaning |
| --- | --- |
| Subject | Required nonblank human-readable description. |
| Kind | `message`, `call`, `meeting`, `interview`, `conversation`, `other`. |
| Channel | `email`, `linkedin`, `sms`, `chat`, `phone`, `video`, `in_person`, `other`. |
| Direction | `inbound`, `outbound`, `mutual`, `unknown`, relative to the candidate. |
| Status | `planned`, `confirmed`, `completed`, `canceled`, `no_show`. |
| Time | Required offset-bearing start; nullable end and IANA timezone. End may equal start. |
| Content | Nullable location, summary, and notes; optional structured metadata. |
| Provenance/correction | Nullable origin change ID and superseded interaction ID. |
| Record identity | Durable ID, revision, deletion flag, creation/update times. |

Kind, channel, direction, and status are independently selected; the service does not enforce a matrix of allowed combinations. A separate timezone does not rewrite the timestamp or require that its offset agree with that timezone.

## Relationships

Each interaction has one or more unique participant people and zero or one Gig. Participant membership and the optional Gig association are independent of a person's Gig-role associations. A supersession link points to a prior active interaction; no self-link or cycle is allowed. The link does not change the predecessor's status or deletion flag.

Source records and legacy references retain imported provenance. They are not general user-facing event types or evidence of a live synchronization integration.

## States and State Transitions

All status values can be supplied on create or update, subject to the ordinary record invariants. Soft deletion excludes the record from ordinary read/query and removes active participant membership. Shared audited change reversion can restore eligible deleted records; there is no dedicated interaction restore command.

## Invariants

Participants must resolve to existing people, and optional Gig and supersession references must resolve at mutation time. At least one participant remains after any update. The end instant is not earlier than the start. The complete merged record is validated even for a one-field update.

## Related Capabilities and Workflows

[Interactions](../capabilities/interactions.md) · [Contact-history workflow](../workflows/interactions-contact-history.md)
