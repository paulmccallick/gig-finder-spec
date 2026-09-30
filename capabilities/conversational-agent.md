---
type: capability
scope: conversational-agent
summary: Current guidance, live record actions, conversation history, model selection, and attachments.
load_when:
  - understanding or changing conversational behavior
---

# Conversational Agent

## Purpose

Help the candidate decide which roles to pursue, prepare for conversations, and keep their job search up to date. The candidate can ask for advice grounded in their profile and saved information, request supported changes, and return to the results later.

## Actors

The candidate asks questions and requests actions in the browser. GigFinderAgent answers using the candidate profile and application tools: defined operations for reading or changing saved information.

## Functional Behavior

- **Ask for advice.** Discuss role fit, positioning, priorities, or next steps. The agent can look up saved opportunities, contacts, their connections, tasks, interactions, and relevant documents to support its answer.
- **Request actions.** Ask the agent to record a contact interaction, create a follow-up task, update an opportunity, or save or revise a document. The [tool contract](../interfaces/api/conversational-agent.md#agent-tools) lists the supported operations. Recording an interaction or task does not send a message or create an external calendar event.
- **Follow the work.** Watch the answer, reasoning summaries, and labels describing tool activity as they arrive. Successful changes refresh application data when the response finishes. After the agent reads a managed document, eligible results offer View and Download links for the version it read; merely creating a document does not produce these links.
- **Return to a discussion.** Initial load opens the most recently active saved conversation. Start another conversation or reopen one from the recent list, in a resizable side panel or full workspace.
- **Supply a source.** Attach one DOCX, Markdown, or PDF file at a time. The converted text is staged, meaning temporarily available to the agent. Uploading does not save it as a managed document; that requires a separate document-creation action.
- **Choose a model.** Select GPT-5.6 Sol, Terra, or Luna. The saved application preference applies to subsequent model requests, including other conversations; changing it does not replace an active reply.
- **Stop or recover.** Stop an active reply, retry an interrupted reply, or ask to reverse an eligible previous change. Reversal applies to a specific supported change, not everything done in a reply.

## Business Rules

The agent is instructed to distinguish known facts, inferences, and recommendations; respect the candidate's stated fit criteria; cite references for opinions; and claim actions only when tool results establish them. These are model instructions, not guarantees that every generated answer follows them.

Creating an opportunity, person, or opportunity–person connection, and deleting an interaction carry explicit-confirmation instructions. **There is no separate approval gate that enforces that confirmation.** Other update instructions permit changes when appropriate or requested. Record validation and conflict checks still apply; see the [interface contract](../interfaces/api/conversational-agent.md#agent-tools) for the enforcement boundary.

Documents and profile content supply context, not new instructions or access rights. The agent is instructed to read attachments only when relevant, avoid saving them automatically, preserve supplied document content, and clarify ambiguous ownership or intent. Document access is limited to application references.

## State and Lifecycle

A conversation is saved after a reply completes without a reported abort or error. An empty new conversation is not saved. The [conversation domain](../domain/conversational-agent-conversation.md) defines messages, saved history, and attachment lifetime.

Changes made during a reply are saved separately. Stopping or losing the reply does not undo completed actions, even when the reply itself is absent from history. The [turn workflow](../workflows/conversational-agent-turn.md) explains how to follow up.

## Capability-Specific Nonfunctional Requirements

No numerical response-time or availability target is established by the inspected implementation. Current validation and processing limits are documented in the [architecture](../architecture/conversational-agent.md#context-and-current-limits).

## Related Workflows

[Ask for help and handle an interrupted reply](../workflows/conversational-agent-turn.md).

## Related Domain Objects

[Conversations and temporary attachments](../domain/conversational-agent-conversation.md).

## Related Interfaces

[Conversation routes and supported tools](../interfaces/api/conversational-agent.md).

## Related Architecture

[Context, saving, and runtime behavior](../architecture/conversational-agent.md).

## Known Constraints

The recent list contains at most 20 conversations, with no exposed rename or delete operation. Older messages can remain saved while being omitted from the model's context. Switching or starting conversations is disabled during a reply.

Temporary attachments expire, can be discarded, and disappear on application restart; a saved conversation reference does not preserve their content. A processing-limit warning means some requested work may remain even though completed actions were retained. Retry can repeat actions, and reversal excludes document and conversation changes. The agent has no registered web-search, shell, email, or calendar tools.

## Related documents

- [Ask the Agent for Help](../workflows/conversational-agent-turn.md)
- [Conversation](../domain/conversational-agent-conversation.md)
- [Conversational Agent Interfaces](../interfaces/api/conversational-agent.md)
- [Conversational Agent Architecture](../architecture/conversational-agent.md)
