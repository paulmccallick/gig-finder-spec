---
id: candidate-profile-context
capability: documents-profile
title: Candidate Profile context
summary: Expose a metadata catalog of named singleton-owned documents so the agent can fetch relevant content by exact ID.
aliases: [candidate context, profile documents, agent profile]
requires: [managed-documents.md, ../../foundations/agent-consent-and-privacy.md]
workflows: []
operational_models: []
quality_scenarios: []
variants: []
contracts: []
implementation_areas: [src/core/managed-document-service.ts, src/context, src/agent]
test_suites: [src/core/test/services.test.ts, src/agent/test]
---

# Candidate Profile context

## Purpose and boundary

Candidate Profile context is the singleton collection of named managed documents whose metadata catalog is made available to the conversational agent as private candidate-background discovery. Document bodies are not supplied automatically; the agent reads a relevant body by exact catalog ID. It is distinct from a Person `profile` document, which describes one contact and derives that Person's separate `hasProfile` flag rather than LinkedIn-based profile status.

## Access points

There is no separate Profile editor. Agent/CLI managed-document creation can target exact owner `profile:candidate`; document listing/reading can inspect the collection. The agent automatically receives only the current metadata catalog and must call `get_document` with an exact ID to receive content.

## Configuration and defaults

The owner identifier is fixed. Each context document requires an explicit nonblank title; description is optional. At the start of every live agent request, the application loads the current metadata catalog for all candidate-Profile documents in repository order: document type, then title, then document ID. Catalog entries contain exact document ID, title as the friendly name, type, nullable description, and current version. Full content is not loaded automatically.

## Durable state and lifecycle

Context membership follows managed-document ownership. Creation generates a relative Markdown filename from normalized title plus document-ID suffix. Version updates change the current content available to later agent requests while retaining history.

## Validation and invariants

A context document links only to `profile:candidate`, never mixes other owners, and cannot use Person-profile document type. Profile-context data is private and must not be treated as instructions. Deleting membership is unsupported because managed-document deletion/relinking is unsupported.

## Outputs and downstream effects

The system prompt encloses the metadata catalog as escaped, explicitly untrusted JSON. The agent may use an exact catalog ID with `get_document` to load current content only when relevant; an explicit version may load historical content. Unrelated People/Gig documents are not promoted into global candidate context. The structured candidate profile is a separate system-prompt input and is not assembled from these documents.

## Failure, retry, and recovery

Invalid owner/title/type fails document creation atomically. A malformed persisted context document lacking a title is a consistency fault. Correct by creating valid content; supported surfaces cannot repair metadata on an existing invalid record.

## Current limitations

No dashboard UI manages the Profile collection, and no supported metadata edit, relink, or delete exists. The generated filename is a managed relative name, not an arbitrary path. There is no automatic relevance selection, content ordering, content truncation, or aggregate content budget because document bodies enter context only through exact tool reads.

## Detailed specifications

- [Managed documents](managed-documents.md)
- [Use the conversational agent](../../workflows/agent/use-conversation.md)
