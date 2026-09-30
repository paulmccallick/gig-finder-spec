---
type: capability
scope: documents-profile
summary: Save and reuse role, contact, and candidate documents; revise editable text while keeping earlier versions.
load_when:
  - understanding document or candidate context behavior
  - changing document creation, reading, or updates
---

# Documents and Candidate Profile

## Purpose
Help the candidate keep job descriptions, supporting notes, interview preparation, and information about contacts together with the roles and people they concern. Reuse that information in later conversations and preserve earlier versions when editable documents are revised.

## Actors
The candidate saves and reads documents through the assistant or command line. The browser displays saved versions and offers downloads. Scout also saves official job descriptions when processing positions.

## Functional Behavior
The candidate can save supplied text, or upload a PDF, DOCX, or Markdown file and explicitly ask the assistant to save its extracted text. A saved document has a stable identity, a useful display name, and links to the roles or people it supports. One document can be shared across several roles and contacts where its type permits.

The assistant can find roles and people by name, list their documents, and read a selected document. The candidate can also revisit earlier versions or download a selected version as text or Markdown. Finding owners by name does not search the contents of documents.

Editable documents can be revised by replacing their text. The old version stays available. Documents saved from uploads preserve the extracted source text and cannot be revised through the update operation.

Candidate-wide notes and interview preparation can be saved separately from any particular role or contact. The assistant receives a catalog of these documents and reads their content when relevant. A separate structured candidate profile supplies background, preferences, strengths, and decision rules for advice and Scout screening; saving candidate documents does not edit that profile.

## Business Rules
- Every document links to at least one existing role, person, or the candidate. Duplicate links are rejected.
- A job description must link to a role. Interview preparation must link to a role or the candidate. Notes have no additional type-specific restriction.
- A person profile describes exactly one person and may also link to roles. It is distinct from the candidate's structured profile.
- A candidate-wide document must have a title and link only to the candidate. Combined with the type rules, candidate-wide documents can be notes or interview preparation.
- Saved content is plain text or Markdown, with 1–50,000 characters. Optional titles, descriptions, and source descriptions have the limits in the [document interface](../interfaces/api/documents-profile.md#validation-and-results).
- A revision supplies the full replacement text, the version being edited, and a short description of the change. It cannot rename, recategorize, or relink the document.
- An update at the current version with identical content leaves the document unchanged. An outdated version is rejected even if the proposed text matches the latest text. Uploaded source documents reject all updates.

## State and Lifecycle
Saving creates version 1. Each changed update creates the next version and keeps the previous versions readable. Browser links identify a specific version and continue to show it after later revisions.

An upload is temporary until explicitly saved. Its attachment and expiry lifecycle is part of the [conversational agent](conversational-agent.md). No document deletion, relinking, or dedicated version-revert operation is exposed.

## Capability-Specific Nonfunctional Requirements
Revisions must preserve earlier content and must not silently overwrite changes made since the document was read. Document creation and changed revisions save their content and change record together. No separate latency, availability, or document-volume target is defined by the inspected implementation.

## Related Workflows
- [Save, read, and revise supporting documents](../workflows/documents-profile-maintenance.md)

## Related Domain Objects
- [Documents and candidate context](../domain/documents-profile.md)

## Related Interfaces
- [Document tools, commands, viewer, and uploads](../interfaces/api/documents-profile.md)

## Related Architecture
- [Document storage, versions, and candidate loading](../architecture/documents-profile.md)

## Known Constraints
Uploaded PDF and DOCX files become extracted Markdown; their original layout and images are not preserved in text downloads. Scanned PDFs requiring OCR and password-protected PDFs are unsupported. Document content has no full-text search. Local copies of candidate documents are generated from saved content; editing those files does not update the application.

## Related documents

- [Documents and Candidate Context](../domain/documents-profile.md)
- [Maintain and Reuse Documents](../workflows/documents-profile-maintenance.md)
- [Document Interfaces](../interfaces/api/documents-profile.md)
- [Document and Profile Architecture](../architecture/documents-profile.md)
