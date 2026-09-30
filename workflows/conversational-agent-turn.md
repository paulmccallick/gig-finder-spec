---
type: workflow
scope: conversational-agent-turn
summary: Submission, streaming, persistence, attachment handling, and interruption behavior.
load_when:
  - tracing a response or investigating partial work
---

# Ask the Agent for Help

## Purpose

Let the candidate get advice or request a concrete job-search action, follow the result, and continue the discussion later. If a reply stops, the candidate needs to distinguish unfinished conversation from actions that have already been saved.

## Actors

The candidate, GigFinderAgent, and the application operations used to look up or change information.

## Trigger

The candidate sends a message, with optional attached source material. An attachment alone can also be submitted.

## Preconditions

The browser allows one active reply in its workspace. Sending waits until any upload conversion or model-preference save completes. Live model requests require configured provider authentication.

## Inputs

The candidate's latest message and optional temporary attachment, alongside saved conversation history, the candidate profile, and relevant application records or documents. The backend supplies saved history; the browser does not choose the authoritative history.

## Normal Flow

1. Open the most recent saved conversation, select another recent discussion, or start a new one. Optionally choose a model for subsequent requests.
2. Optionally attach a DOCX, Markdown, or PDF file. The application converts it to temporary text and shows the filename, extracted character count, and any extraction warnings. Uploading alone does not add it to saved documents.
3. Send a question or action request. The application supplies recent conversation context and the candidate profile. The agent can read relevant saved information, including profile documents whose contents it requests.
4. Follow the streamed answer, reasoning summaries, and activity labels. For an action request, the agent calls supported operations; successful changes take effect as they complete.
5. When the reply completes without a reported abort or error, the application saves the candidate message and assistant response together. A new conversation receives a title.
6. The browser refreshes application data if it received a successful change result, and refreshes the recent-conversation list after a retained completion. Successful managed-document reads can offer View and Download links to the version read. Attachments successfully saved as managed documents are then discarded from temporary staging.

## Alternate Flows

- **Continue a discussion:** older messages may be left out of model context. Previously read document content is restored where possible at its recorded version; the agent can request current content when needed.
- **Keep an attachment temporary:** sending or reading it does not consume it. The selected attachment remains until replaced, discarded, or saved and cleaned up; its underlying content still expires even if the browser continues showing it. Starting or switching conversations does not itself clear the selected attachment.
- **Change models mid-reply:** the active reply continues on its selected model. The new preference affects later model requests; even first-turn title generation separately reads the preference.
- **Reach the processing limit:** the browser warns that requested work may be unfinished and completed actions were retained. This response can be saved, and its warning omits the usual Retry response button. The candidate can send a follow-up request about the remaining work.
- **Reverse a change:** the candidate can ask to reverse one eligible earlier action. The operation must identify the saved change and rejects reversal that would overwrite later edits. It does not reverse document or conversation changes.

## Failure Behavior

**Stop requests cancellation; it does not undo actions.** When the runtime reports an abort or stream error, that turn is not saved. A disconnected browser cannot establish whether the server completed or saved work. Check the current records or ask the agent to inspect them before repeating an action.

The browser offers Retry response for interrupted responses, but retry makes another model request and is not a guarantee against duplicate effects. An intentionally stopped reply does not receive the generic interruption warning solely because it was stopped.

Upload conversion or capacity failures leave no new staged item. The candidate can discard an attachment; failed server cleanup is tolerated because temporary content expires. Title-generation failure falls back to the candidate's text. A conversation-save error can arrive after the model's finish event, so seeing generated text finish is not proof that history was saved.

## Completion / Postconditions

After a successful conversation save, history contains the ordered candidate/assistant pair and tool activity. Independently completed record or document actions remain saved regardless of the conversation outcome. Use successful operation results and current records to establish what was actually done.

## Nonfunctional Requirements

No separate workflow target is established. The [runtime limits](../architecture/conversational-agent.md#context-and-current-limits) describe current message, context, and processing bounds.

## Related Documentation

- [Conversational agent capability and consent rules](../capabilities/conversational-agent.md).
- [Conversation and attachment lifecycle](../domain/conversational-agent-conversation.md).
- [Message, stream, and tool contracts](../interfaces/api/conversational-agent.md).
- [Runtime, context, and persistence implementation](../architecture/conversational-agent.md).

## Related documents

- [Conversational Agent](../capabilities/conversational-agent.md)
- [Conversation](../domain/conversational-agent-conversation.md)
- [Conversational Agent Interfaces](../interfaces/api/conversational-agent.md)
- [Conversational Agent Architecture](../architecture/conversational-agent.md)
