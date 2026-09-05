---
id: managed-documents
capability: documents-profile
title: Managed documents
summary: Preserve owner-linked text with immutable versions, provenance, exact reads, and safe replacement.
aliases: [managed content, document version, job description]
requires: [../../foundations/managed-document-integrity.md, ../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md]
workflows: [../../workflows/documents/read-documents.md, ../../workflows/documents/create-managed-document.md, ../../workflows/documents/update-managed-document.md]
operational_models: []
quality_scenarios: [../../quality-scenarios/documents/stale-document-update.md]
variants: [../../variants/documents/create-managed-document-agent-tool.md, ../../variants/documents/create-managed-document-cli.md]
contracts: [../../contracts/operations/list_documents.schema.json, ../../contracts/operations/list_document_versions.schema.json, ../../contracts/operations/get_document.schema.json, ../../contracts/operations/create_document.schema.json, ../../contracts/operations/update_document.schema.json]
implementation_areas: [src/core/documents.ts, src/core/managed-document-service.ts, src/core/document-reader.ts, src/data/document-store.ts]
test_suites: [src/core/test/services.test.ts, src/data/test/document-store.test.ts, src/agent/test, src/cli/test/documents.test.ts]
---

# Managed documents

## Purpose and boundary

A managed document preserves exact plain/Markdown text, type, owners, provenance, and immutable versions. It may belong to Gigs, People, or singleton candidate Profile context. Temporary uploaded content belongs to agent upload staging until explicitly saved; Scout-authored job descriptions use the same durable document/version model with different provenance.

## Access points

UI links view/download exact content. Strict agent tools list, read, create, and update. The supported CLI lists, reads, creates from a local file, and updates. There is no dashboard editor or delete.

## Configuration and defaults

Content has a hard 50,000 JavaScript-character limit. Types are `job_description`, `notes`, `interview_prep`, and `profile`; managed media is plain text or Markdown. Display name is title, otherwise uploaded filename, otherwise type label.

## Durable state and lifecycle

Creation atomically records metadata, links, version 1, SHA-256 content hash, provenance, and audit change. Update appends a complete immutable version at an expected current version. Identical content at that version is a no-op with no new version/change. Historical versions remain readable. Upload provenance makes the document immutable; inline and Scout-created documents remain eligible for supported update rules.

## Validation and invariants

At least one unique owner link is required and Gig/Person IDs must resolve. Job descriptions require a Gig; Person profiles require exactly one Person and may also link Gigs; candidate Profile ownership is only singleton `profile:candidate`, cannot use type profile, and requires a title; interview preparation needs a Gig or candidate Profile. Update replaces complete content and cannot change owners/type/title/description. Source provenance requires a source description.

## Outputs and downstream effects

Lists return metadata, sorted by display name; exact reads return current or requested version and content. Owner details expose summaries. Candidate Profile documents feed a metadata-only agent catalog; their bodies enter context only after an exact `get_document` read. Gig job descriptions feed dashboard/Scout resolution; Person profile documents derive `hasProfile` but do not determine LinkedIn-based profile status.

## Failure, retry, and recovery

Invalid owners/content/provenance fail without partial document or audit. Missing ID/version returns not-found. Stale update returns revision conflict; reread and intentionally rebase. A no-op update is safely repeatable.

## Current limitations

There is no supported metadata-only update or deletion. The dashboard/Scout choose the lexicographically first Gig job description when several exist. Standard JSON Schema and runtime JavaScript count some Unicode content lengths differently; runtime validation is authoritative.

## Detailed specifications

- [Discover, view, and download](../../workflows/documents/read-documents.md)
- [Create managed content](../../workflows/documents/create-managed-document.md)
- [Update managed content](../../workflows/documents/update-managed-document.md)
- [Stale update quality scenario](../../quality-scenarios/documents/stale-document-update.md)
