---
id: managed-document-integrity
title: Managed-document integrity
summary: Managed documents preserve exact content, ownership, provenance, and immutable version history.
aliases: [document version, provenance, managed content]
---

# Managed-document integrity

## Scope

Applies to managed text documents, uploaded staged sources once saved, profile context, Gig descriptions, and Scout-promoted descriptions.

## Canonical rule

Managed content is non-empty text of at most 50,000 characters in `text/plain` or `text/markdown`. Creation establishes version 1; an editable replacement appends a version and retains prior content.

## Required behavior

- `job_description` links to at least one Gig; `profile` links to exactly one Person; `interview_prep` links to a Gig or candidate Profile.
- A candidate Profile context document links only to `profile:candidate`, is not document type `profile`, and has a name.
- Uploaded PDF, DOCX, or Markdown is converted/staged as Markdown with filename, media type, hash, converter, warnings, and upload time; saved content preserves that provenance.
- An explicit version read returns exactly that immutable version while also reporting the current version.

## Prohibited behavior

- Do not rewrite supplied source content during creation.
- Do not edit a document created from an uploaded source; uploaded source documents are immutable.
- Do not expose arbitrary filesystem paths through document references.

## Failure and retry implications

Missing owners, invalid ownership combinations, stale versions, expired staged references, or unsupported identifiers fail without a partial document mutation. Identical replacement content is a successful no-op. Scout promotion is a workflow-level exception: its Gig write may commit before a later document write fails; retry must reconcile that Gig and complete or verify the exact document.

## Observable consequences

Supported reads show display name, type, media type, version, and content. Version lists omit content. Database inspection verifies ownership, hashes, provenance, and immutable version rows.

## Used by

- [Discover and read documents](../workflows/documents/read-documents.md)
- [Create managed content](../workflows/documents/create-managed-document.md)
- [Update managed content](../workflows/documents/update-managed-document.md)
- [Stage an upload](../workflows/agent/stage-upload.md)
- [Review and promote Scout positions](../workflows/scout/review-and-promote.md)
