---
id: documents-profile
title: Documents and profile
aliases: [managed document, profile context, artifact]
---

# Documents and profile

## Purpose and boundary

Lets the candidate attach durable text content to Gigs, People, or the candidate Profile, read immutable versions, download content, and maintain editable documents. Temporary agent uploads and Scout-created descriptions feed this capability but retain their initiating workflows. Candidate-Profile document bodies are available only through exact reads; the conversational agent receives a metadata catalog, not their content.

## Vocabulary

| Term | Meaning here |
|---|---|
| managed document | Registered text with ownership and versions. |
| staged document | Temporary converted upload available to one agent workflow. |
| candidate Profile | Singleton owner `profile:candidate` whose named documents appear in the agent's metadata catalog and may then be read by exact ID. |

## Features

| Feature | Use when | Document |
|---|---|---|
| Managed documents | List, read, create, or append exact versioned content | [Open](../features/documents/managed-documents.md) |
| Candidate Profile context | Understand metadata-only discovery and exact reads for singleton private documents | [Open](../features/documents/candidate-profile-context.md) |

## Shared foundations

- [Managed-document integrity](../foundations/managed-document-integrity.md)
- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)

## Evidence pointers (optional)

- Implementation areas: `src/core/documents.ts`, `src/core/managed-document-service.ts`, `src/core/document-reader.ts`, `src/web/client/DocumentViewer.tsx`
- Test suites: `src/core/test/services.test.ts`, `src/data/test/document-store.test.ts`, `src/web/test/`, `src/cli/test/documents.test.ts`
