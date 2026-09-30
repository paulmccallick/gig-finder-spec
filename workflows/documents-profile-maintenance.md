---
type: workflow
scope: documents-profile
summary: Save supporting material with its owners, read it later, and revise editable text without losing history.
load_when:
  - tracing a document save or revision conflict
  - understanding upload-to-managed-document boundaries
---

# Maintain and Reuse Documents

## Purpose
Save a job description, notes about a contact, or interview preparation alongside the related role, person, or candidate. Find it again later and revise editable text without losing earlier versions.

## Actors
The candidate works through the assistant or CLI to save and revise documents, and can use the browser to view and download a saved version.

## Trigger
The candidate asks to save a job description or supporting document, read existing material, or update an editable document.

## Preconditions
Any role or person receiving the document already exists. Candidate-wide material uses the candidate's own document collection. An uploaded attachment must still be available before it can be saved.

## Inputs
Creation needs the document's intended owners, type, text or uploaded attachment, and any known title, description, or source information. Revision needs the saved document ID, current version, full replacement text, and a change summary. Exact fields are in the [document interface](../interfaces/api/documents-profile.md).

## Normal Flow
1. Identify the intended role, person, or candidate-wide collection. The assistant can resolve role and contact names to saved records and clarify ambiguous ownership before saving.
2. Supply the text or upload a supported file. For uploads, review the extracted text and warnings as needed, then explicitly request a save. Uploading alone leaves a temporary attachment.
3. Save the document with its intended links and type. The application validates the request, records version 1, and returns its saved identity and display name. Uploaded documents retain the converted source text and source information.
4. Later, list the owner's documents or use the candidate document catalog to choose useful material. Read the current version, or choose a historical version. The browser can display and download a specific saved version.
5. To revise an editable document, read the current text and version, prepare the complete replacement, and submit it with that version and a change summary. A successful change produces a new version while preserving the old one.
6. Confirm the document by its friendly name and report whether it was created, revised, or left unchanged.

## Alternate Flows
A single document can be saved against several roles and people when its type allows, so each owner leads to the same text and history. Candidate-wide documents instead link only to the candidate; see [document relationships](../domain/documents-profile.md#relationships).

An update with identical text at the expected current version completes without a new version. A historical read reports both the selected and current versions, allowing the assistant to distinguish earlier source material from the latest text.

The [conversation workflow](conversational-agent-turn.md) covers temporary attachments, discarding, expiry, and retrying an attachment save. The separate structured candidate profile is loaded as application context; this document workflow does not edit it.

## Failure Behavior
Invalid text, document types, or ownership combinations are rejected. Missing owners, documents, unavailable versions, and expired attachments cannot complete the requested operation. An outdated expected version fails without adding a revision; read the latest version and reconsider the replacement before retrying. Uploaded source documents reject updates, including unchanged text.

A failed database save leaves no partial document, version, or change record. Candidate documents may also have local file copies: a failure to refresh a copy after saving leaves the database change intact and the copy awaiting retry. Startup attempts to refresh all candidate copies and can fail if that synchronization fails. The [architecture](../architecture/documents-profile.md#failure-modes) explains this distinction.

## Completion / Postconditions
A newly saved document can be rediscovered through its owners and read by its stable ID. A changed revision becomes current and leaves previous text accessible. A read or download identifies the chosen version.

## Nonfunctional Requirements
The [document capability](../capabilities/documents-profile.md#capability-specific-nonfunctional-requirements) defines revision consistency and retention guarantees.

## Related Documentation
- [Document behavior and ownership rules](../capabilities/documents-profile.md)
- [Documents, versions, and candidate context](../domain/documents-profile.md)
- [Document tools and interfaces](../interfaces/api/documents-profile.md)
- [Storage, loading, and evidence](../architecture/documents-profile.md)

## Related documents

- [Documents and Candidate Profile](../capabilities/documents-profile.md)
- [Documents and Candidate Context](../domain/documents-profile.md)
- [Document Interfaces](../interfaces/api/documents-profile.md)
- [Document and Profile Architecture](../architecture/documents-profile.md)
