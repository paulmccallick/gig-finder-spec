---
id: use-conversation
capability: conversational-agent
feature: conversations
title: Use the conversational agent
summary: Ask context-aware questions and carry supported work across persisted conversation turns.
aliases: [chat with agent, resume conversation, retry response]
requires: [../../foundations/agent-consent-and-privacy.md]
related: [stage-upload.md, choose-model.md, revert-change.md, ../../contracts/README.md]
implementation_areas: [src/core/conversation-service.ts, src/agent/gig-finder-agent.ts, src/web/client/agent/AgentPanel.tsx]
test_suites: [src/core/test/conversation-service.test.ts, src/agent/test/ai-sdk-conversation-runtime.test.ts, src/web/test/client/agent/AgentPanel.test.ts]
---

# Use the conversational agent

## Intent

The candidate asks a question or requests supported tracker/document work and receives a streamed, context-aware answer with visible tool activity.

## Access points

Dashboard agent panel or full-screen layout. Strict operations are cataloged in [agent tool contracts](../../contracts/README.md); load only the operation selected for the request.

## Preconditions

A configured provider/model and readable private context. Conversation IDs are 1–100 letters, digits, underscore, or hyphen. User text is limited to 8,000 characters.

## Workflow

1. Open the agent; recent conversations load newest-first, with the most recent selected. Start new or switch only while idle.
2. Send one valid user message, optionally with a staged reference.
3. The service selects the latest complete turns that fit its history budget, rehydrates the latest relevant managed document reads, and streams reasoning/text/tool activity.
4. The agent may read freely and asks for consent before durable mutation.
5. On normal completion, persist the user and compacted assistant message atomically; generate a short title for a new conversation, falling back to the first user text.
6. Refresh dashboard data after a successful mutation result.

## Decisions and variants

The UI supports stop during processing and regenerate after failure/interrupt. At the configured tool-step limit, already completed actions remain and the UI warns that requested work may be incomplete. Recent listing is limited to 20 conversations.

## State changes

Completed turns update conversation last-active time and message history. Tool mutations have their own durable change boundaries. Layout width/mode is UI state, not product records.

## Outputs and observable effects

Text/reasoning stream incrementally; tool activity is summarized. Successful managed document reads expose View/Download actions. Known internal identifiers are sanitized from assistant narrative and titles.

## Safety rules

Follow consent/privacy foundation. Input history has a bounded character estimate derived from a 64k-token maximum with reserved/non-history allowances. Persisted tool result bodies are compacted at 16,000 serialized characters.

## Failure, retry, and recovery

Aborted turns and finish-reason error are not persisted. Disconnect/error or zero delivered text yields an interrupted warning. Completed tool mutations are not rolled back by a later model failure; inspect state before retry/regenerate.

## Current limitations

Conversation history truncation is character-estimated, not provider-tokenized. Title generation failure silently falls back. Sanitization targets known identifier patterns and is not a general data-loss-prevention system.

## Related specifications

- [Stage an upload](stage-upload.md)
- [Choose a model](choose-model.md)
- [Revert a change](revert-change.md)
