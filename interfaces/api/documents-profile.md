---
type: interface
scope: documents-profile
summary: Agent and CLI document writes, version-specific HTTP reads, upload conversion, and candidate profile input.
load_when:
  - integrating document reads and writes
  - changing document tools, upload formats, or viewer routes
---
# Document Interfaces

## Purpose
Connect callers to the [save, read, and revise workflow](../../workflows/documents-profile-maintenance.md). The assistant and CLI create and update saved documents; HTTP provides version-specific reads and temporary uploads. The [capability](../../capabilities/documents-profile.md) explains the ownership and revision rules, and the [architecture](../../architecture/documents-profile.md) explains persistence and candidate loading.

## Agent Tools
Contracts are defined by [tool schemas and implementations](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts).

| Tool | Input and result semantics |
| --- | --- |
| `search_gigs_and_people` | Company/person names resolve owners; returns identity summaries and truncation, not document content. |
| `list_documents` | Owner `{entityType, entityId}`, optional offset/limit; returns managed references, display names and current versions, or owner not found. |
| `list_document_versions` | Managed ID and optional page; returns descending version metadata without content; unsupported for non-managed identifiers. |
| `get_document` | Exact reference and optional version; returns content, current/selected versions, media type, and truncation metadata. Staged reads are an agent extension. |
| `create_document` | 1–20 links, type, nullable title/description/source description, media type, `sourceKind`. `inline_content` requires content and null reference; `staged_document` requires reference, null content, and Markdown media type. |
| `update_document` | Managed ID, positive expected version, complete replacement content, change summary. Returns changed/unchanged and document metadata. |

Owner discovery sorts by display name then reference. Pages default to 20; limits are 1–50 and offsets nonnegative. See [reader](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/document-reader.ts) and [pagination](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/queries.ts). [Name search](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/context-search.ts) normalizes punctuation/case, queries up to 50 candidates per term, caps final gigs/people at 20 each, and signals candidate-query or final-result truncation.

## Validation and Results

Saved text contains 1–50,000 characters. Titles, descriptions, and source descriptions are nullable; supplied values are trimmed, nonblank, and limited to 200, 255, and 500 characters respectively. Updates require a positive expected version and a trimmed, nonblank change summary of at most 500 characters. The agent create tool limits owner links to 20; the core creation schema only sets a minimum of one. Type-specific ownership checks are enforced by the service.

Domain mutations enforce [managed schemas](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/documents.ts) and return `document`, `changeId`, `changed`; unchanged has null change ID. Errors include validation, `not_found`, `revision_conflict`, and `duplicate_change`. Reusing a committed explicit change ID is rejected, not generically replayed as success. For a staged attachment already consumed by a successful save, `create_document` returns the recorded save result instead of making another document; this depends on the staged record still being available. That replay is separate from the core change-ID rejection.

Internal service callers may supply official-source provenance when saving Scout job descriptions. Creation requires a source description when provenance is present; updates require the description and provenance together. Agent create/update schemas do not expose those official-source fields.

## HTTP Reads

These routes read a saved version; they do not expose document creation or revision.

- `GET /api/documents/{reference}/versions/{version}` returns reference, storage, display name, type, media type, selected/current versions, and content as JSON.
- Add `/download` to return content with UTF-8 media type, `Cache-Control: no-store`, and a sanitized attachment filename ending `.md` or `.txt`.
- Invalid route/reference/version: 400. Missing document/version: 404. Unsupported method on a valid route: 405.
- References satisfy the route's managed ID pattern; versions are positive safe integers. There is no current-version HTTP shortcut or document-write REST endpoint here.
- Browser route `/documents/{reference}/versions/{version}` presents that version with a download link.

Evidence: [routing/response](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts), [viewer](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/DocumentViewer.tsx), [route tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/test/request-handler.test.ts). These handlers contain no document-specific authentication mechanism; the [security documentation](../../requirements/security.md) covers the deployment boundary. No separately versioned public API compatibility policy is defined here.

Core service get/update/version discovery accepts raw managed IDs and `document:doc_…` aliases; content-reader get and HTTP routes require raw `doc_…` references. Retain exact IDs returned by discovery.

## CLI
`documents list` selects an owner; `documents get <id>` returns current full record; `documents versions <id>` returns full version records. Creation reads UTF-8 `--content-file` and ownership/type/media/metadata flags. Update requires `--content-file`, `--expected-version`, and `--change-summary`. CLI creation does not convert binary uploads. Owner listing requests only the first 50 documents and exposes no paging flags; version listing returns all full version records despite using a bounded discovery check internally. See [CLI](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/cli.ts), [adapter](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/db-store.ts), [tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/test/documents.test.ts).

## Upload Conversion Boundary
`POST /api/agent/documents` accepts multipart field `file`. Successful conversion and staging returns 201 with reference, filename, detected format, source hash, converter/version, warnings, upload/expiry times, and Markdown character count, with no-store caching. This does not create a managed document. Temporary reference lifecycle and staging DELETE belong to the [conversational-agent interface](conversational-agent.md).

Accepted extensions: `.pdf`, `.docx`, `.md`, with compatible declared MIME types and format validation. Markdown must be UTF-8 without NUL bytes. Conversion normalizes line endings, removes trailing whitespace before newlines, reduces long blank-line runs, and trims the result, including for Markdown uploads. DOCX omits embedded images and records warnings. PDFs require extractable text; no OCR. Errors map to 413 (size/page/extraction limit), 415 (unsupported format/MIME), 422 (malformed, encrypted, image-only, empty extraction). Invalid multipart/missing file/cancelled upload produce 400; staging capacity produces 429.

Runtime defaults: upload 10,000,000 bytes; extraction 50,000 characters; PDF 100 pages; DOCX declared uncompressed size 25,000,000 bytes. Overrides: `DOCUMENT_UPLOAD_MAX_BYTES`, `DOCUMENT_EXTRACTION_MAX_CHARACTERS`, `DOCUMENT_PDF_MAX_PAGES`, `DOCUMENT_DOCX_MAX_UNCOMPRESSED_BYTES`. Raising extraction limits does not raise the managed schema's fixed content limit. Evidence: [handler](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/document-upload-handler.ts), [converter](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/document-conversion.ts), [configuration](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/app.ts), [conversion tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/test/document-conversion.test.ts).

## Candidate Context Input
The structured profile is a separate JSON input, not a managed candidate document. Structured JSON is validated by [candidateProfileSchema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/types.ts) and loaded by [profile-loader](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/profile-loader.ts). Missing/unreadable/invalid input throws at load. Candidate catalog entries contain ID, name, type, description, and current version; bodies are read separately. The web application loads the structured profile at startup and supplies the document catalog through a live callback, as described in the [architecture](../../architecture/documents-profile.md#data-flow).

## Related documents

- [Documents and Candidate Profile](../../capabilities/documents-profile.md)
- [Document and Profile Architecture](../../architecture/documents-profile.md)
- [Maintain and Reuse Documents](../../workflows/documents-profile-maintenance.md)
