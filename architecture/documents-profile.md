---
type: architecture
scope: documents-profile
summary: Document transactions, complete text versions, generated candidate files, conversion, and profile loading.
load_when:
  - modifying document persistence or candidate loading
  - diagnosing revision conflicts or profile file synchronization
---

# Document and Profile Architecture

## Purpose
Explain how the application stores reusable documents, keeps earlier text readable, and supplies candidate context. Product behavior is in the [document capability](../capabilities/documents-profile.md); callers use the [document interfaces](../interfaces/api/documents-profile.md).

## Components
| Component | Responsibility |
| --- | --- |
| [ManagedDocumentService](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/managed-document-service.ts) | Validate creation and replacement requests, owner combinations, upload immutability, and expected versions; calculate content hashes. |
| [ApplicationDocumentReader](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/document-reader.ts) | List documents by owner, page version metadata, and read current or historical text. |
| [SQLite document repositories](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/document-store.ts) | Store metadata, owner links, and complete version snapshots; read current content by joining the selected version. |
| [DataStore](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/store.ts) | Commit document writes with their change record, then retry pending candidate file copies. |
| [LocalProfileDocumentFiles](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/profile-document-files.ts) | Write candidate document text to generated local files. |
| [Profile loader](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/profile-loader.ts) | Read and validate the separate structured candidate JSON profile. |
| [Document converter](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/document-conversion.ts) and [upload handler](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/document-upload-handler.ts) | Extract text from supported files and stage it for a later explicit save. |

## Processing Model
The database stores the text used by application reads; external candidate files do not override it. This is the meaning of **authoritative content** here. The [document migration](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/migrations/0041_authoritative_gig_documents.sql) removes legacy gig and gig-history document-presence flags in favor of managed documents.

Creation validates the request and checks that linked roles and people exist inside the transaction. It inserts document metadata, links, and version 1 with the change record. Updates compare the caller's expected version with the current version, append a full snapshot, and conditionally advance `current_version`. The same SQLite transaction covers the version and change writes.

For editable documents, matching content hashes at the expected version return `changed: false` without a transaction or new change. A stale version does not take that path. The service checks upload immutability before the unchanged-content check, so even identical updates to uploaded documents fail.

Content updates leave title, type, owner links, media type, document-level source description, and upload provenance unchanged. Internal callers can add official-source description and provenance to a new version. Those values describe that version's retrieved job posting; they do not replace document-level metadata. The [schemas](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/documents.ts) require version source description and provenance together on update.

## Data Flow
Uploaded bytes pass through extension, declared media-type, and format checks before conversion. DOCX conversion uses Mammoth and Turndown after archive-layout and declared expanded-size checks. PDF conversion uses PDF.js text extraction; Markdown uses strict UTF-8 decoding. All output undergoes whitespace normalization and trimming before staging. A later explicit save copies converted Markdown and upload provenance into a managed document.

[Context search](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/context-search.ts) resolves company and person names to existing entities. It normalizes names, deduplicates matches, and bounds results; it does not index document bodies. Document discovery then lists a selected owner's saved references.

[Web composition](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/app.ts) loads the structured profile at startup for the agent and Scout screening. It supplies candidate document catalog metadata through a live callback. [Agent instructions](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/system-prompt.ts) surround escaped catalog JSON with an untrusted-metadata boundary and instruct the agent to read relevant bodies by exact ID.

Candidate document text also flows from the database to local files when a file writer is configured. This derived copy is called a **projection**; writing it is called **materialization** in the code. A title slug plus ID suffix produces a basename ending in `.md`, including for plain-text documents. The writer restricts output to the configured directory, writes a temporary file, and renames it into place. The saved-copy version marker advances only if that version is still current.

After a committed change, pending candidate copies are retried individually. [Local application startup](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/local-application.ts) rewrites all candidate copies, even ones already marked current, repairing missing or externally edited files. [Context resolution](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/context.ts) chooses the structured profile through environment override, configuration, then `profile/candidate-profile.json`, with a legacy `profile/job-search-profile.json` fallback. The default copy directory is `profile/documents`; configuration belongs to [deployment](../operations/deployment.md).

## Guarantees
- Database rollback prevents partial document metadata, links, versions, or change records.
- Stale replacements fail without adding a revision, and earlier version text remains unchanged.
- Reusing an explicit committed change ID for a new write is rejected. This is distinct from the assistant's replay of an already-consumed staged attachment described in the [interface](../interfaces/api/documents-profile.md#validation-and-results).
- Application document reads use database content even if a generated candidate file is stale or manually edited.

## Failure Modes
Invalid ownership or schemas fail before a document is saved. Missing owners are checked within the creation transaction. Persisted link rows with zero or multiple owner targets fail consistency validation when read.

A file-write failure after commit is reported and leaves the copy pending for a later change or startup retry; the committed database mutation is not replayed. Startup copy failures propagate to the caller rather than using the postcommit reporting path. Without a configured file writer, document database behavior continues without local copies.

Invalid or unreadable structured profile JSON fails loading. Unsupported, malformed, encrypted, oversized, or textless uploads fail conversion. Extracted text does not preserve original PDF/DOCX layout or provide a way to recreate the source file.

## Scaling Characteristics
Document and version discovery pages results, but the reader first loads the owner's documents or full version records and then sorts and slices them. Each saved revision stores the complete text rather than a delta. Content reads are capped at 50,000 characters, the same limit enforced for newly saved content. No document full-text index or independently measured latency/volume target is established here.

## Constraints
The service accepts raw document IDs and `document:doc_…` aliases; content reads and HTTP routes have narrower acceptance. Use the raw IDs returned by discovery. Candidate documents cannot use local files as an editing channel. Upload conversion and temporary attachment lifetime are separate from managed persistence.

## Used By
- [Documents and Candidate Profile](../capabilities/documents-profile.md)
- [Save, read, and revise documents](../workflows/documents-profile-maintenance.md)
- [Document interface contracts](../interfaces/api/documents-profile.md)

## Related Requirements
The [document capability](../capabilities/documents-profile.md#capability-specific-nonfunctional-requirements) specifies revision and save consistency. Source evidence includes:

- [Service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/services.test.ts): unchanged-content updates, source-field validation, historical reads, multi-owner discovery, and uploaded-source immutability.
- [Persistence tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/test/document-store.test.ts): owner discovery, historical content and provenance, rollback, stale updates, duplicate changes, and candidate file retries.
- [CLI tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/test/documents.test.ts) and [context-search tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/context-search.test.ts): command behavior, owner resolution, and truncation.
- [Upload tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/test/document-upload-handler.test.ts) and [conversion tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/test/document-conversion.test.ts): staging boundary, supported extraction, rejected inputs, and limits.
- [Tool tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/test/gig-finder-tools.test.ts) and [agent tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/test/gig-finder-agent.test.ts): staged saves and escaped untrusted catalog metadata.
- [HTTP tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/test/request-handler.test.ts) and [viewer tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/test/client/document-viewer.test.ts): version routes, downloads, and invalid references.

These sources were inspected for documentation; this pass does not claim a fresh application test run.

## Related ADRs

- [ADR 0003: Keep document content out of conversation history](../decisions/0003-document-context-in-conversations.md)
- [ADR 0006: Make database document state authoritative](../decisions/0006-authoritative-document-state.md)
- [ADR 0016: Mutate domain-owned tables through the owning domain service](../decisions/0016-own-domain-table-mutations.md)

## Related documents

- [Documents and Candidate Profile](../capabilities/documents-profile.md)
- [Document Interfaces](../interfaces/api/documents-profile.md)
- [Maintain and Reuse Documents](../workflows/documents-profile-maintenance.md)
