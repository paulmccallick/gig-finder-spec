---
id: create-managed-document
capability: documents-profile
feature: managed-documents
title: Create managed content
summary: Save exact inline or staged text with valid ownership, provenance, and first version.
aliases: [save document, add job description, add profile context]
requires: [../../foundations/managed-document-integrity.md, ../../foundations/identity-and-references.md, ../../foundations/agent-consent-and-privacy.md]
related: [read-documents.md, ../agent/stage-upload.md]
implementation_areas: [src/core/managed-document-service.ts, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/services.test.ts, src/agent/test/gig-finder-tools.test.ts, src/cli/test/documents.test.ts]
---

# Create managed content

## Intent

The candidate wants supplied text or an uploaded source preserved as a durable document connected to the correct product context.

## Access points

Agent `create_document` for inline or staged content; CLI `documents create` for content read from a local file.

## Preconditions

At least one valid link, a supported type/media type, and nonempty content within 50,000 JavaScript characters. Agent invocation additionally requires confirmation; direct CLI invocation does not. Staged source requires an unexpired exact staged reference and Markdown media type.

## Workflow

1. Resolve intended owners and type before creation.
2. The strict agent input schema first validates shape, source pairing, string constraints, and media type. Execution then resolves the staged reference. For a new reference, managed-document validation checks ownership and referenced records before creation; for an already consumed reference, current execution returns the stored consumption before those business checks are repeated.
3. Preserve complete supplied content; do not summarize or rewrite it.
4. Atomically create the document, ownership links, immutable version 1, content hash, provenance, and audit change. For staged input, upload provenance is taken from the server-side staged object; callers neither provide nor override it.
5. If staged, mark that reference consumed so a repeated successful tool delivery returns the same saved result rather than duplicating the document.

## Decisions and variants

See the managed-document foundation for ownership rules. Type `notes` has no extra type-specific owner restriction, but still requires at least one link and obeys the candidate Profile singleton rule. Display name is explicit title, otherwise uploaded filename, otherwise a type label (so inline null-title content uses the type label). Profile context requires a title; descriptions are trimmed nonblank strings of at most 255 characters when present. Source description is trimmed/nonblank and at most 500.

## State changes

Creates a new `doc_…` managed document at version 1 with a non-null change ID. A staged upload records conversion provenance and becomes immutable; only successful `create_document` consumes the staged reference. Reading alone does not consume or clear it. Consumption state is retained for idempotent replay.

## Outputs and observable effects

Returns metadata excluding content, `changed: true`, and a non-null change ID. Metadata contains the document ID, links, type, nullable title/description/source description, managed media type, nullable upload provenance, nullable generated relative Profile-context filename, display name, version, SHA-256 content hash, and creation/update timestamps. The relative filename is not a server filesystem path and is null unless the document is owned by `profile:candidate`. Owner details/lists now include the document summary. A staged result includes the exact input staged reference and non-null upload provenance; the executor enforces equality by looking up and returning the same staged object's `reference` even though standard JSON Schema cannot compare the two instance values. Inline creation omits the staged-reference field and has null upload provenance.

## Safety rules

Do not attach to guessed owners or mix candidate Profile ownership with other links. Do not invent source descriptions. Profile documents for People and candidate Profile context are distinct concepts.

## Failure, retry, and recovery

Missing owner/reference and dangling Gig or Person IDs map to `not_found`. Invalid source pairing, duplicate links, invalid owner/type combinations, or other domain validation maps to `validation_failed`; unexpected failures map to `tool_failed`. Conversion fails before this tool is invoked. Except for the consumed-reference behavior below, failure creates no document. After uncertain staged delivery, replaying the same consumed reference returns its consumption result.

## Current limitations

The CLI reads arbitrary user-selected local content files because direct CLI invocation is the supported boundary; the agent tool cannot browse paths. Inline-created documents have null upload provenance and can later use the update workflow; staged uploaded-source documents cannot. Standard JSON Schema `maxLength` counts Unicode code points, while runtime Zod/JavaScript enforces the 50,000 content limit in UTF-16 code units; runtime validation is authoritative for astral Unicode and for post-trim text lengths. A consumed staged reference is checked after strict input-schema validation but before ownership, target-existence, and other managed-document business validation: reusing that reference returns the original saved result even if otherwise schema-valid links, type, title, or other submitted fields now differ or would fail those later checks. This is a current idempotency limitation, not permission to mutate the saved document; use a new upload/reference for a genuinely different creation. There is no dashboard creation form.

## Related specifications

- [Stage an upload](../agent/stage-upload.md)
- [Read documents](read-documents.md)
