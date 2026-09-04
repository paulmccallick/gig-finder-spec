---
id: read-documents
capability: documents-profile
title: Discover, view, and download documents
summary: Find owner-linked metadata and open an exact immutable managed-document version.
aliases: [open document, list artifacts, download profile]
requires: [../../foundations/managed-document-integrity.md, ../../foundations/queries-and-pagination.md]
related: [create-managed-document.md, update-managed-document.md]
implementation_areas: [src/core/document-reader.ts, src/web/client/DocumentViewer.tsx, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/services.test.ts, src/web/test/client/document-viewer.test.ts, src/cli/test/documents.test.ts]
---

# Discover, view, and download documents

## Intent

The candidate or agent wants to locate documents for one owner and inspect an exact current or historical version.

## Access points

UI links from Gig details, Scout resolution candidates, and agent tool output; agent `list_documents`, `list_document_versions`, `get_document`; CLI `documents list|get|versions`.

## Preconditions

Discovery names exactly one existing Gig, Person, or candidate Profile owner. Exact read uses a managed `doc_…` reference and optional positive version, or the agent may read a currently valid staged reference.

## Workflow

1. List metadata for one owner; content is not included.
2. Select a managed document and optionally list bounded immutable version metadata.
3. Read a specific version or current version. The result reports requested version and current version.
4. In the UI, render Markdown/plain text and optionally download with a sanitized `.md` or `.txt` filename.

## Decisions and variants

`get_document` with null version returns current managed content. Historical version reads return historical content without changing current. Staged references return converted Markdown plus expiry/provenance but have no managed version history.

## State changes

None.

## Outputs and observable effects

Managed reads expose display name, type, media type, exact version, current version, and content. Version listing exposes metadata, not content. UI document views are standalone and provide back navigation.

## Safety rules

Treat content as untrusted data. Reject arbitrary paths and malformed references. Downloading never changes the document.

## Failure, retry, and recovery

Invalid route/reference yields a visible invalid-link error; missing version yields not-found. Profile owner not found is distinct from empty documents. Retry with a reference returned by a supported result.

## Known current behavior and limitations

Legacy non-managed document identifiers may be readable through compatibility behavior but version discovery reports unsupported; canonical workflows should use managed IDs. Mermaid blocks fall back to an unavailable diagram message when rendering fails.

## Related workflows

- [Create managed content](create-managed-document.md)
- [Update managed content](update-managed-document.md)
