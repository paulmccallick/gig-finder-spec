---
type: domain
scope: conversational-agent-conversation
summary: Conversation, turn, message-part, and temporary attachment lifecycle.
load_when:
  - reasoning about history or attachment lifetime
---

# Conversation

## Definition

A conversation is a saved discussion in which the candidate asks for guidance or work and the agent responds. It records what was said and the tool activity that accompanied the response. It is separate from the opportunities, contacts, tasks, interactions, and documents discussed or changed.

## Attributes

A conversation has an identifier, title, creation time, and last-active time. Its ordered messages identify the speaker and contain text, reasoning summaries, attachment references, or tool activity. A **turn** is one candidate message and one assistant response saved together.

Tool activity records an operation's name, input, and result or error. A response can contain several model steps, each involving generated text or tool calls.

## Relationships

Tool results may point to a record, document version, or saved change. Those objects have their own lifecycles: deleting or losing a reply does not reverse the work it describes.

A **staged attachment** is temporarily available text extracted from an upload, with its source information and expiry. A **managed document** is content separately saved in the application's document collection. Converting the attachment into a managed document records the creation result on the temporary attachment; this is called consumption. Consumption does not itself delete the attachment.

## States

A new conversation begins unsaved in the browser. It becomes saved when its first eligible turn is stored. Later eligible turns extend the same conversation and advance its last-active time.

An attachment is available until discarded or expired. While available, it can be unconsumed or consumed. A reference in saved history does not extend this lifetime.

## State Transitions

- A completed reply without a reported abort or error saves the candidate/assistant pair. The first turn receives a generated title, with the candidate's text as fallback.
- An aborted or failed reply is not appended. An existing conversation keeps its earlier saved turns; independently completed actions remain saved.
- A reply stopped by the agent's step limit can still become a saved turn, even if requested work is unfinished.
- Creating a managed document from a live attachment marks that attachment consumed. Reusing the same live consumed reference returns the original creation result. Discard, expiry, or application restart removes access to the staged content.

## Invariants

Saved messages retain their order and each turn's pair is stored together. Conversation history is a record of a discussion, not an undo boundary for application changes.

Saved document-read results identify the version read, which can differ from the document's latest version. Reopening a conversation can therefore offer a historical document version.

Recognized internal identifiers are hidden from ordinary displayed text, but structured references remain part of the conversation data. Older saved messages may be excluded from a later reply's context. The [architecture](../architecture/conversational-agent.md) explains context selection and persistence.

## Related Capabilities

[Conversational agent](../capabilities/conversational-agent.md).

## Related Workflows

[Ask for help, save a turn, and recover from interruption](../workflows/conversational-agent-turn.md).

## Related documents

- [Conversational Agent](../capabilities/conversational-agent.md)
- [Ask the Agent for Help](../workflows/conversational-agent-turn.md)
- [Conversational Agent Architecture](../architecture/conversational-agent.md)
