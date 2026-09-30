---
type: capability
scope: documents-profile
summary: Managed document ownership, immutable revisions, discovery, and candidate context behavior.
load_when:
  - understanding document or candidate context behavior
  - changing document creation, reading, or updates
related:
  - domain/documents-profile.md
  - workflows/documents-profile-maintenance.md
  - interfaces/api/documents-profile.md
  - architecture/documents-profile.md
---
# Documents and Candidate Profile

## Purpose
Maintain reusable text documents for opportunities, people, and the candidate, and provide candidate context for advice and opportunity screening.

## Actors
The job seeker, conversational agent acting through tools, CLI users, and Scout when promoting official job descriptions.

## Functional Behavior
Managed documents hold authoritative content, owner links, descriptive metadata, and version history. Users can create documents from supplied text or explicitly save converted attachments, replace editable content, discover documents by owner, list versions, and read current or historical content. The browser provides a version-specific viewer and text/Markdown download.

Name-based context search finds existing gigs and people to resolve ownership; it does not search document bodies. The candidate document catalog supplies names, descriptions, types, IDs, and current versions to the agent. Full content is read when relevant.

The structured candidate profile supplies identity and experience, role/company/location preferences, strengths, fit domains, poor-fit criteria, and decision rules. It is separate from managed candidate documents and has no document-tool editing operation.

## Business Rules
- A document has at least one unique link to an existing gig, person, or the singleton candidate Profile.
- A Person document of type `profile` links to exactly one person; gig links are also allowed. This differs from candidate Profile ownership.
- Candidate context documents link only to Profile `candidate`, require a title, and cannot have document type `profile`.
- `job_description` requires a gig link; `interview_prep` requires a gig or candidate Profile link. `notes` has no additional type-specific ownership restriction.
- Stored media types are plain text and Markdown. Content contains 1–50,000 characters. Optional titles contain up to 200 characters, descriptions 255, and source descriptions 500. Updates require a nonblank change summary up to 500 characters.
- Updates replace content in full and require the expected current version. The update operation cannot edit metadata or ownership.
- Uploaded source documents are immutable. Saving preserves their converted content and upload provenance.
- Equal content at the expected version returns unchanged without a new version or change. A stale expected version is rejected even if proposed content matches current content.

## State and Lifecycle
Creation produces version 1. A changed update appends the next version and advances the current version; prior content remains readable. No document deletion, relinking, or document-version revert operation is exposed here.

Upload and conversion precede managed creation. Upload alone does not save a managed document; temporary staging belongs to the [conversational-agent capability](conversational-agent.md).

## Capability-Specific Nonfunctional Requirements
Updates enforce optimistic concurrency and retain prior versions. No separate latency, availability, or volume service target was established by the inspected contracts. Numeric limits above are enforced input limits.

## Related Workflows
- [Maintain and reuse documents](../workflows/documents-profile-maintenance.md)

## Related Domain Objects
- [Documents and candidate context](../domain/documents-profile.md)

## Related Interfaces
- [Document interfaces](../interfaces/api/documents-profile.md)

## Related Architecture
- [Document implementation](../architecture/documents-profile.md)

## Known Constraints
PDF and DOCX uploads become extracted Markdown rather than editable originals. OCR and password-protected PDFs are unsupported. There is no document full-text search. Candidate document files are derived copies; editing them does not update managed content.
