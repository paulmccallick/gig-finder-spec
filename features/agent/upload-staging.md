---
id: upload-staging
capability: conversational-agent
title: Agent upload staging
summary: Convert one supported upload into bounded temporary Markdown for agent reading or explicit durable save.
aliases: [attachment, staged document, upload]
requires: [../../foundations/managed-document-integrity.md, ../../foundations/agent-consent-and-privacy.md]
workflows: [../../workflows/agent/stage-upload.md]
operational_models: []
quality_scenarios: [../../quality-scenarios/agent/staging-capacity.md]
variants: []
contracts: []
implementation_areas: [src/web/document-upload-handler.ts, src/web/document-conversion.ts, src/core/staged-documents.ts, src/web/client/agent]
test_suites: [src/web/test/document-upload-handler.test.ts, src/web/test/document-conversion.test.ts, src/core/test/staged-documents.test.ts]
---

# Agent upload staging

## Product role

Owns the temporary bridge from a candidate-selected file to agent-readable Markdown and an optional durable managed document. It isolates conversion, capacity, expiry, and one-time reference semantics from both conversation history and durable document ownership.

## Feature set

| Constituent behavior | Implemented outcome |
|---|---|
| File acceptance | Validates one supported PDF, DOCX, or Markdown upload against size and capacity bounds. |
| Bounded conversion | Produces temporary Markdown, source hash, converter metadata, and extraction warnings. |
| Temporary reference | Issues an expiring process-local reference for agent inspection or later save. |
| Explicit durable save | Consumes the reference once to create a managed document with upload provenance. |
| Replay and cleanup | Returns the original consume result on replay and removes expired staging state. |

## Purpose and boundary

Upload staging converts one PDF, DOCX, or Markdown file to temporary Markdown and exposes an opaque reference to agent tools. It creates no managed document until confirmed managed-document creation succeeds.

## Access points

The agent-panel file picker uploads/replaces/discards one current attachment. Agent document read and create operations resolve the opaque reference. Arbitrary paths and binary managed content are unsupported.

## Configuration and defaults

Default converter limits are 10,000,000 source bytes, 50,000 extracted characters, 100 PDF pages, and 25,000,000 uncompressed DOCX bytes; positive deployment settings can change them. Staging/managed content retain a hard 50,000 JavaScript-character cap. Default temporary lifetime is 15 minutes; process capacity is 20 documents and 500,000 characters, each positively configurable.

## Durable state and lifecycle

Conversion records source SHA-256, detected media type, basename, converter/version, upload instant, and up to 20 nonblank warnings of at most 500 characters. Staged state is process memory with expiry and optional successful-consumption result. Reading does not consume. Successful save records the result for replay; retained response then lets UI discard/clear the attachment.

## Validation and invariants

Extension, declared type, and file signature must agree with a supported type; Markdown is valid UTF-8; extraction must be nonempty and within limits. Content is untrusted. A new upload is blocked during active upload/turn; replacement discards the prior reference first.

## Outputs and downstream effects

The UI receives a friendly filename, detected type, character count, warnings, expiry, and opaque reference. Saved uploaded-source documents inherit provenance and become immutable.

## Nonfunctional Requirements

| Classification | Implemented constraint | Scenario |
|---|---|---|
| Performance | Admission never exceeds the implemented per-file, item-count, and aggregate staging-capacity bounds. | [Staging capacity](../../quality-scenarios/agent/staging-capacity.md) |

## Failure, retry, and recovery

Unsupported/malformed/encrypted/image-only/oversized/empty conversion fails without usable staging. Capacity rejection leaves existing entries intact. Retry while the reference remains unexpired or upload again; process restart loses all staging.

## Current limitations

The service is process-local, one attachment at a time in UI, and not session/tenant-bound. Any request obtaining an exact unexpired random reference can resolve it; unpredictability is the only discovery barrier.

## Detailed specifications

- [Stage an upload](../../workflows/agent/stage-upload.md)
- [Capacity quality scenario](../../quality-scenarios/agent/staging-capacity.md)
