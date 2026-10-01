---
type: domain
scope: conversational-agent-conversation
summary: Conversation, turn, message-part, and temporary attachment lifecycle.
load_when:
  - reasoning about history or attachment lifetime
related:
  - capabilities/conversational-agent.md
  - workflows/conversational-agent-turn.md
  - architecture/conversational-agent.md
---

# Conversation

## Definition and Attributes

A conversation is a durable sequence of candidate messages and agent responses with an identifier, title, creation time, and last-active time. A turn consists of one user message and one assistant message. Messages have identifiers and ordered text, reasoning, attachment reference, step-boundary, or tool parts.

## Relationships

Tool activity contains a name, call identifier, input, and result or error. Results may identify records, document versions, or committed changes. The conversation references these objects; it does not own or roll back their lifecycle.

A staged attachment is temporary extracted Markdown with upload provenance, expiry, and optional managed-document creation result. A saved reference does not keep content alive. Repeated creation from the same live consumed reference returns its original creation result.

## States and Transitions

- A new conversation exists only in the client until a completed turn is saved.
- Successful response persistence appends both messages and advances last-active time. First-turn title generation falls back to user text on failure.
- Aborted/error responses are not appended by the service. Independently committed record changes remain.
- Staged attachments become consumed, discarded, or expired. Consumed content remains until discard/expiry; consumption is not deletion.

## Invariants

Messages preserve sequence; the pair is saved together. Recognized internal identifiers are hidden in display text while structured tool/reference parts retain them. Sanitization is not removal of identifiers from all stored data.

## Related Capabilities and Workflows

[Agent](../capabilities/conversational-agent.md), [turn lifecycle](../workflows/conversational-agent-turn.md).

**AGENT-FB-003** Current implementation references for conversation contracts, persistence, staging, and creation tools are listed in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#agent-fb-003).
