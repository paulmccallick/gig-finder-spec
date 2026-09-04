---
id: documents-profile
title: Documents and profile
aliases: [managed document, profile context, artifact]
---

# Documents and profile

## Purpose and boundary

Lets the candidate attach durable text content to Gigs, People, or the candidate Profile, read immutable versions, download content, and maintain editable documents. Temporary agent uploads and Scout-created descriptions feed this capability but retain their initiating workflows.

## Vocabulary

| Term | Meaning here |
|---|---|
| managed document | Registered text with ownership and versions. |
| staged document | Temporary converted upload available to one agent workflow. |
| candidate Profile | Singleton owner `profile:candidate` whose named documents form agent context. |

## Workflows

| Workflow | Use when | Document |
|---|---|---|
| Discover and read | List metadata, view, or download a version | [Open](../workflows/documents/read-documents.md) |
| Create managed content | Save inline or staged source content | [Open](../workflows/documents/create-managed-document.md) |
| Update managed content | Append a replacement version | [Open](../workflows/documents/update-managed-document.md) |

## Shared foundations

- [Managed-document integrity](../foundations/managed-document-integrity.md)
- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)

## Evidence pointers (optional)

- Implementation areas: `src/core/documents.ts`, `src/core/managed-document-service.ts`, `src/core/document-reader.ts`, `src/web/client/DocumentViewer.tsx`
- Test suites: `src/core/test/services.test.ts`, `src/data/test/document-store.test.ts`, `src/web/test/`, `src/cli/test/documents.test.ts`
