---
type: domain
scope: documents-profile
summary: Reusable documents, saved versions, owner links, and the separate forms of candidate context.
load_when:
  - reasoning about document ownership or provenance
  - distinguishing candidate Profile from Person profile documents
---

# Documents and Candidate Context

## Definition
A document is saved text the candidate can reuse while evaluating roles, preparing for interviews, or working with contacts. The implementation calls it a **managed document** because the application stores its identity, owner links, descriptive information, and version history together.

Candidate context has two separate forms: saved candidate-wide documents that the assistant can read, and a structured profile containing the candidate's background and search preferences. A document of type `profile` instead describes a contact; these three concepts must not be confused.

## Attributes
| Concept | Meaning |
| --- | --- |
| Document identity | Stable ID used to find the document again, independent of its current text. |
| Type | Job description (`job_description`), notes (`notes`), interview preparation (`interview_prep`), or contact profile (`profile`). |
| Display name | Title when supplied, otherwise the original upload filename, otherwise a label derived from the type. |
| Description and source description | Optional explanations of what the document contains and where it came from. |
| Current version | The version whose text is returned when the caller does not request a particular historical version. |
| Version | A saved snapshot of the full text, numbered in sequence, with its predecessor, author, time, and change summary. |
| Source information | Upload filename, format, conversion details and warnings, or version-specific information about an official job posting retrieved by Scout. The technical term for this source history is provenance. |

The structured candidate profile contains a version label; identity, profession, focus, experience, situation and career horizon; target roles, company and location preferences; strengths, best-fit and poor-fit domains; and decision rules. Its version label is independent of document version numbers.

## Relationships
A document links to one or more roles or people, subject to the [type-specific ownership rules](../capabilities/documents-profile.md#business-rules). Multiple owners share the same document and history rather than receiving separate copies.

Candidate-wide documents use the singleton owner `profile:candidate`. They cannot also link to roles or people, must have a title, and can be notes or interview preparation. This owner is not a Person record. A contact profile document must link to exactly one person and can also link to roles.

Updating candidate-wide documents does not rewrite the structured candidate profile. The assistant sees a catalog of candidate documents containing names, descriptions, types, IDs, and current versions; it reads the selected document bodies separately.

## States
A saved document has one current version and zero or more earlier versions. Each saved version is immutable: later revisions create new snapshots rather than altering old ones. Documents saved from uploads are also fixed at the document level and do not accept revisions.

A staged attachment is temporary converted upload content. It is not yet a managed document.

## State Transitions
Creation establishes identity, links, and version 1. A changed update advances the current version by one; an unchanged update leaves it as is. The expected current version must match before an update can succeed.

Explicitly saving a staged attachment creates a managed document containing the converted text and upload source information. The [maintenance workflow](../workflows/documents-profile-maintenance.md) covers saving, reading, and revision failures.

## Invariants
Every document has at least one unique owner link. A new version follows the previous current version and retains earlier text. Source-upload content cannot be changed by the document update operation. The complete ownership and content rules are in the [document capability](../capabilities/documents-profile.md#business-rules).

## Related Capabilities
- [Documents and Candidate Profile](../capabilities/documents-profile.md)

## Related Workflows
- [Maintain and reuse documents](../workflows/documents-profile-maintenance.md)

## Related documents

- [Documents and Candidate Profile](../capabilities/documents-profile.md)
- [Maintain and Reuse Documents](../workflows/documents-profile-maintenance.md)
