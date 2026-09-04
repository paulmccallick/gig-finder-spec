---
id: update-managed-document
capability: documents-profile
title: Update managed content
summary: Replace editable content at an expected current version while retaining immutable history.
aliases: [edit document, add document version, replace notes]
requires: [../../foundations/managed-document-integrity.md, ../../foundations/changes-revisions-reversal.md]
related: [read-documents.md, create-managed-document.md]
implementation_areas: [src/core/managed-document-service.ts, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/services.test.ts, src/data/test/document-store.test.ts, src/agent/test/gig-finder-tools.test.ts, src/cli/test/documents.test.ts]
---

# Update managed content

## Intent

The candidate wants a complete replacement of an editable document while preserving the exact previous version.

## Access points

Agent `update_document`; CLI `documents update`.

## Preconditions

Exact managed document ID, expected positive current version, nonempty complete replacement within 50,000 characters, and concise factual change summary. Uploaded-source documents are ineligible.

## Workflow

1. Read the current document/version.
2. Prepare complete replacement content and change summary.
3. Validate expected version and editability.
4. If content hash is unchanged at that version, return a no-op.
5. Otherwise append one immutable version and make it current in the same audited change.

## Decisions and variants

Only content and per-version source metadata change through this workflow; ownership/type/title/description are not exposed as supported update inputs. Prior versions remain exact and addressable.

## State changes

New content advances current version by one. Unchanged content produces no version and no change ID.

## Outputs and observable effects

Result reports metadata, whether changed, and change ID or null. New reads without version return replacement content; explicit old version reads return prior content.

## Safety rules

Do not patch fragments: input is the complete replacement. Never update converted uploaded source content. Require renewed state after conflict.

## Failure, retry, and recovery

Missing/invalid ID, stale version, oversized/empty content, or immutable upload fails without changes. Re-read and intentionally rebase before retrying a stale edit.

## Known current behavior and limitations

There is no dashboard editor and no supported document deletion. Agent history compacts document tool outputs, so it may rehydrate an exact previously read version rather than carry full bodies indefinitely.

## Related workflows

- [Read documents](read-documents.md)
