---
type: interface
scope: documents-profile
summary: Managed-document agent, CLI, HTTP, upload conversion, and profile-loading contracts.
load_when:
  - integrating document reads and writes
  - changing document tools, upload formats, or viewer routes
related:
  - capabilities/documents-profile.md
  - architecture/documents-profile.md
  - workflows/documents-profile-maintenance.md
---
# Document Interfaces

## Agent Tools
Contracts are defined by [tool schemas and implementations](app::src/agent/gig-finder-tools.ts).

| Tool | Input and result semantics |
| --- | --- |
| `search_gigs_and_people` | Company/person names resolve owners; returns identity summaries and truncation, not document content. |
| `list_documents` | Owner `{entityType, entityId}`, optional offset/limit; returns managed references, display names and current versions, or owner not found. |
| `list_document_versions` | Managed ID and optional page; returns descending version metadata without content; unsupported for non-managed identifiers. |
| `get_document` | Exact reference and optional version; returns content, current/selected versions, media type, and truncation metadata. Staged reads are an agent extension. |
| `create_document` | 1–20 links, type, nullable title/description/source description, media type, discriminated source. Inline requires content and null reference; staged requires reference, null content, Markdown media type. |
| `update_document` | Managed ID, positive expected version, complete replacement content, change summary. Returns changed/unchanged and document metadata. |

Owner discovery sorts by display name then reference. Pages default to 20; limits are 1–50 and offsets nonnegative. See [reader](app::src/core/document-reader.ts) and [pagination](app::src/core/queries.ts). [Name search](app::src/core/context-search.ts) normalizes punctuation/case, queries up to 50 candidates per term, caps final gigs/people at 20 each, and signals candidate-query or final-result truncation.

Domain mutations enforce [managed schemas](app::src/core/documents.ts) and return `document`, `changeId`, `changed`; unchanged has null change ID. Errors include validation, `not_found`, `revision_conflict`, and `duplicate_change`. Reusing a committed explicit change ID is rejected, not generically replayed as success. Staged-consumption replay is separate tool behavior.

## HTTP Reads
- `GET /api/documents/{reference}/versions/{version}` returns reference, storage, display name, type, media type, selected/current versions, and content as JSON.
- Add `/download` to return content with UTF-8 media type, `Cache-Control: no-store`, and a sanitized attachment filename ending `.md` or `.txt`.
- Invalid route/reference/version: 400. Missing document/version: 404. Unsupported method on a valid route: 405.
- References satisfy the route's managed ID pattern; versions are positive safe integers. There is no current-version HTTP shortcut or document-write REST endpoint here.
- Browser route `/documents/{reference}/versions/{version}` presents that version with a download link.

Evidence: [routing/response](app::src/web/request-handler.ts), [viewer](app::src/web/client/DocumentViewer.tsx), [route tests](app::src/web/test/request-handler.test.ts). These handlers contain no document-specific authentication mechanism; application-wide security owns the deployment boundary. No separately versioned public API compatibility policy is defined here.

Core service get/update/version discovery accepts raw managed IDs and `document:doc_…` aliases; content-reader get and HTTP routes require raw `doc_…` references. Retain exact IDs returned by discovery.

## CLI
`documents list` selects an owner; `documents get <id>` returns current full record; `documents versions <id>` returns full version records. Creation reads UTF-8 `--content-file` and ownership/type/media/metadata flags. Update requires `--content-file`, `--expected-version`, and `--change-summary`. CLI creation does not convert binary uploads. Owner listing requests only the first 50 documents and exposes no paging flags; version listing returns all full version records despite using a bounded discovery check internally. See [CLI](app::src/cli/cli.ts), [adapter](app::src/cli/db-store.ts), [tests](app::src/cli/test/documents.test.ts).

## Upload Conversion Boundary
`POST /api/agent/documents` accepts multipart field `file`. Successful conversion and staging returns 201 with reference, filename, detected format, source hash, converter/version, warnings, upload/expiry times, and Markdown character count, with no-store caching. This does not create a managed document. Temporary reference lifecycle and staging DELETE belong to the [conversational-agent interface](conversational-agent.md).

Accepted extensions: `.pdf`, `.docx`, `.md`, with compatible declared MIME types and format validation. Markdown must be UTF-8 without NUL bytes. DOCX omits embedded images and records warnings. PDFs require extractable text; no OCR. Errors map to 413 (size/page/extraction limit), 415 (unsupported format/MIME), 422 (malformed, encrypted, image-only, empty extraction). Invalid multipart/missing file/cancelled upload produce 400; staging capacity produces 429.

Runtime defaults: upload 10,000,000 bytes; extraction 50,000 characters; PDF 100 pages; DOCX declared uncompressed size 25,000,000 bytes. Overrides: `DOCUMENT_UPLOAD_MAX_BYTES`, `DOCUMENT_EXTRACTION_MAX_CHARACTERS`, `DOCUMENT_PDF_MAX_PAGES`, `DOCUMENT_DOCX_MAX_UNCOMPRESSED_BYTES`. Raising extraction limits does not raise the managed schema's fixed content limit. Evidence: [handler](app::src/web/document-upload-handler.ts), [converter](app::src/web/document-conversion.ts), [configuration](app::src/web/app.ts), [conversion tests](app::src/web/test/document-conversion.test.ts).

## Candidate Context Input
Structured JSON is validated by [candidateProfileSchema](app::src/agent/types.ts) and loaded by [profile-loader](app::src/agent/profile-loader.ts). Missing/unreadable/invalid input throws at load. Candidate catalog entries contain ID, name, type, description, and current version; bodies are read separately.
