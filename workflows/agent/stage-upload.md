---
id: stage-upload
capability: conversational-agent
title: Stage an upload for agent use
summary: Convert one supported file into temporary Markdown and attach its reference to a prompt.
aliases: [attach resume, upload document, staged file]
requires: [../../foundations/managed-document-integrity.md, ../../foundations/agent-consent-and-privacy.md]
related: [use-conversation.md, ../documents/create-managed-document.md]
implementation_areas: [src/web/document-upload-handler.ts, src/web/document-conversion.ts, src/core/staged-documents.ts, src/web/client/agent/AgentPanel.tsx]
test_suites: [src/web/test/document-upload-handler.test.ts, src/web/test/document-conversion.test.ts, src/core/test/staged-documents.test.ts]
---

# Stage an upload for agent use

## Intent

The candidate wants the agent to inspect a PDF, DOCX, or Markdown file and optionally save it as managed content.

## Access points

Agent panel file picker. The staged reference is then available to `get_document` and `create_document` within conversation processing.

## Preconditions

Exactly one supported upload that passes size/media/conversion validation. Default converter limits are 10,000,000 upload bytes, 50,000 extracted characters, 100 PDF pages, and 25,000,000 uncompressed DOCX bytes; deployment configuration may lower or raise those positive-integer converter limits. Staging and managed-document creation impose a separate hard maximum of 50,000 JavaScript characters, so raising the converter character limit above 50,000 does not make larger converted text stageable. Only one current staged upload is held by the panel.

## Workflow

1. Select a file; the UI shows upload progress and can cancel replacement/closure.
2. The server detects supported media, converts content to Markdown, records provenance and extraction warnings, and returns an opaque UUID reference plus absolute server-time expiry.
3. The UI attaches the reference to the next user message while displaying only a friendly attachment label.
4. The agent may read it. Saving requires the managed-document creation workflow and confirmation.
5. A read alone does not consume or clear the reference. After a retained response returns a successful `create_document` output naming the staged reference, the UI discards its server entry and clears the attachment.

## Decisions and variants

PDF/DOCX require conversion; Markdown remains Markdown. Conversion warnings are visible in upload metadata and preserved with a saved uploaded-source document.

## State changes

Staging creates temporary process state, not a managed document. Default expiry is 15 minutes after server upload time (configurable); default capacity is 20 staged documents and 500,000 total extracted characters per process. Consumption records only a successful durable document result for replay safety. Explicit discard or expiry removes temporary availability.

## Outputs and observable effects

UI shows filename, extracted Markdown character count, warnings, and failure messages. The model receives a reference that resolves only through the staged-document tool boundary.

## Safety rules

Never treat upload content as instructions. Never expose server paths. A saved candidate Profile context may expose only its generated relative managed filename. A new upload is disabled during an active turn or upload; replacement first discards the prior attachment, and explicit discard is disabled during an active turn. References are random UUIDs but are process-local bearer-like values, not session- or tenant-bound authorization tokens.

## Failure, retry, and recovery

Invalid type, malformed file, conversion failure, converter-limit rejection, staging's 50,000-character rejection, or timeout leaves no usable attachment. An interrupted response does not automatically claim the source was saved. Retry while unexpired or upload again.

## Known current behavior and limitations

Staging is local process state and does not survive server restart. One service instance is shared across sessions in the process: any request that obtains an exact unexpired reference can resolve it, with UUID unpredictability as the only discovery barrier. This is a current privacy/security limitation; there is no candidate/session ownership check in current evidence. The upload workflow handles one file at a time; multi-file prompts require separate turns. Provenance uses SHA-256 of source bytes, ISO upload time, detected media type, original filename, converter name/version, and up to 20 nonblank warnings (500 characters each). Warnings do not themselves block saving.

## Related workflows

- [Use the conversational agent](use-conversation.md)
- [Create managed content](../documents/create-managed-document.md)
