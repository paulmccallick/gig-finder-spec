---
id: identity-and-references
title: Identity and reference integrity
summary: Durable records are addressed by exact IDs and cross-record links must resolve.
aliases: [durable ID, exact reference, record identity]
---

# Identity and reference integrity

## Scope

Applies to Gigs, People, Gig-Person Relationships, Tasks, Interactions, managed documents, Scout positions, and their supported links. Display labels and free-text search are discovery aids, not identity.

## Canonical rule

An operation that targets or links an existing record must use the exact durable identifier returned by a supported list, search, detail, or creation operation. Names, titles, and companies do not substitute for IDs.

## Required behavior

- A Gig-Person Relationship references one existing Gig and one existing Person.
- A non-general Task references an existing Gig or Person; a general Task has a null related ID and label `General`.
- An Interaction has at least one unique existing Person and may reference one existing Gig.
- A managed document's Gig and Person links resolve when it is created. Profile ownership is the singleton `profile:candidate`.
- Agent creation tool calls derive stable entity IDs from the tool-call ID for Gigs, People, relationships, and Interactions; repeated identical change identities are replay-safe only when entity and payload still agree. Staged managed-document creation is the exception described below.

## Prohibited behavior

- Do not infer a durable target from a similar display name when more than one match can exist.
- Do not accept dangling cross-record links, duplicate document links, or duplicate Interaction participants.
- Do not expose internal IDs as prose in persisted assistant titles or narrative text; the conversation service sanitizes known internal identifier forms.

## Failure and retry implications

Missing targets fail without creating partial links. Resolve the target again before retrying. A replay whose recorded change identity maps to a different entity or payload fails as a revision conflict. Exception: `create_document` first recognizes a consumed staged-document reference and returns that reference's original consumption result without comparing the replay's other fields; this current limitation is documented by the creation workflow.

## Observable consequences

Supported detail reads return exact IDs; database inspection shows enforced foreign-key/link rows and no partial audited change after failure.

## Used by

- [Opportunity records](../features/opportunities/opportunity-records.md)
- [People](../features/networking/people.md)
- [Person–opportunity relationships](../features/networking/opportunity-relationships.md)
- [Task tracking](../features/tasks/task-tracking.md)
- [Interaction history](../features/interactions/interaction-history.md)
- [Managed documents](../features/documents/managed-documents.md)
- [Position review and promotion](../features/scout/review-promotion.md)
