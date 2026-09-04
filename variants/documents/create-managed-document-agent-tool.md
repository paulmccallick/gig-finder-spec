---
id: create-managed-document-agent-tool
capability: documents-profile
workflow: ../../workflows/documents/create-managed-document.md
surface: agent-tool
summary: Agent can preserve inline text or consume one opaque staged upload after confirmation.
aliases: [create_document, save upload]
requires: [../../workflows/documents/create-managed-document.md, ../../contracts/operations/create_document.schema.json]
contract: ../../contracts/operations/create_document.schema.json
---

# Create managed content via Agent tool

## Exposure

Conversation tool `create_document`.

## Inputs and validation

Strict input pairs `inline_content` with content/null reference, or `staged_document` with null content/exact staged reference and Markdown.

## Interaction sequence

Resolve owners, confirm, create, and consume staged reference if used.

## Outputs or presentation

Returns metadata without content, `changed: true`, and a non-null change ID; staged success includes the exact input staged reference. The complete schema file validates a characterization fixture containing both an observed invocation and result. Validate a runtime invocation against `#/properties/input` and a recorded response against `#/properties/result`; do not send the containing `{input,result}` object to the tool.

## Confirmation and authorization

Explicit confirmation is required.

## Surface-specific failures

Expired/missing staged reference and dangling Gig/Person owners map to not-found; invalid pairings and ownership contracts fail validation. Upload conversion failures occur before tool invocation.

## Refresh and consistency

Strict tool-input validation occurs before execution. Consumption is replay-safe and a retained response clears the UI attachment. During execution, a consumed-reference replay returns the original result before repeating ownership, target-existence, or managed-document business validation of the otherwise schema-valid new payload.

## Known limitations

No arbitrary path access and no binary managed content. The returned `filePath`, when present for candidate Profile context, is a generated relative managed filename rather than a server path. A consumed reference does not detect a changed schema-valid replay payload. Staged references are not bound to the conversation/session that uploaded them.

## Shared workflow

[Canonical behavior](../../workflows/documents/create-managed-document.md)
