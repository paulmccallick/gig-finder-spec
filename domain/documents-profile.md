---
type: domain
scope: documents-profile
summary: Managed documents, immutable versions, owner links, and structured candidate context.
load_when:
  - reasoning about document ownership or provenance
  - distinguishing candidate Profile from Person profile documents
related:
  - capabilities/documents-profile.md
  - workflows/documents-profile-maintenance.md
---
# Documents and Candidate Context

## Definition
A managed document is reusable text content with a stable identity and one or more owner links. Its current content is one selected immutable version. Its type describes its purpose: job description, notes, interview preparation, or a profile of a Person.

## Attributes
A document carries identity, type, optional title and description, media type, source description, optional upload provenance, current version, and creation/update timestamps. Its display name is the title, otherwise original upload filename, otherwise the type label.

A version carries its ordinal and parent ordinal, content and content hash, author/time, change identity and summary, and optional official-source provenance. Version 1 has no parent; later versions name their preceding version.

Upload provenance describes original filename, detected format, source byte hash, converter/version, extraction warnings, and upload time. Official-source provenance instead describes retrieved URL/time, source and extracted hashes, source configuration and extraction/converter versions; it belongs to the version created from that source.

## Relationships
Several gigs or people can reference the same document and history, subject to the [ownership rules](../capabilities/documents-profile.md#business-rules).

The singleton candidate Profile, identified as `candidate`, owns candidate context documents. It is not a Person. A document whose type is `profile` describes a Person and cannot be candidate-owned.

The structured CandidateProfile is independently loaded context: a version label; candidate identity, profession, focus, experience and situation; targets; strengths; fit and poor-fit domains; and decision rules. Updating a candidate context document does not rewrite this structured profile.

## States and Transitions
Managed documents move from first version to successive current versions. Uploaded source documents remain at saved content. Staged attachments are temporary inputs and acquire managed identity only when explicitly saved.

## Invariants
Links are unique. Versions retain prior content and require the expected current predecessor for updates. Content-size and ownership rules are authoritative in the [capability](../capabilities/documents-profile.md).

## Related Capabilities
- [Documents and Candidate Profile](../capabilities/documents-profile.md)

## Related Workflows
- [Maintain and reuse documents](../workflows/documents-profile-maintenance.md)
