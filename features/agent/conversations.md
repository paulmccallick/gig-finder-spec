---
id: conversations
capability: conversational-agent
title: Agent conversations
summary: Stream context-aware responses and persist only complete compacted turns around supported tool work.
aliases: [chat, agent turn, conversation history]
requires: [../../foundations/agent-consent-and-privacy.md, ../documents/candidate-profile-context.md]
workflows: [../../workflows/agent/use-conversation.md]
operational_models: []
quality_scenarios: [../../quality-scenarios/agent/interrupted-turn.md]
variants: []
contracts: []
implementation_areas: [src/core/conversation-service.ts, src/agent, src/data/conversation-store.ts, src/web/client/agent]
test_suites: [src/core/test/conversation-service.test.ts, src/agent/test, src/web/test/agent-handler.test.ts, src/web/test/client/agent]
---

# Agent conversations

## Product role

Owns the candidate's persistent conversational work session with the agent, including the context boundary, tool-mediated actions, streamed response, and durable turn history. Model choice, temporary uploads, and domain changes remain separate features that a conversation coordinates.

## Feature set

| Constituent behavior | Implemented outcome |
|---|---|
| Conversation lifecycle | Creates, selects, lists, and retains named durable conversation histories. |
| Context assembly | Combines system policy, structured candidate state, metadata catalogs, and bounded recent complete turns. |
| Streamed agent turn | Streams one response and supported tool work while distinguishing incomplete from complete output. |
| Durable persistence | Stores only complete compacted turns and preserves prior history across interruption. |
| Privacy boundary | Escapes untrusted context, applies known identifier redaction, and keeps private context scoped to the request. |

## Purpose and boundary

Conversations let the candidate ask about private tracker/profile context and request supported actions through strict tools. The feature owns request validation, history selection/hydration, streaming, turn persistence, titles, compaction, identifier sanitization, and post-tool consistency; each tool-owned product change keeps its own transaction boundary.

## Access points

The dashboard agent panel and full-screen layout start, resume, switch, stop, and regenerate conversations. Strict tool operations are discovered through feature-owned contracts, not arbitrary filesystem/network access.

## Configuration and defaults

Conversation IDs are 1–100 letters/digits/underscore/hyphen; user text is at most 8,000 JavaScript characters. Recent listing returns at most 20. Input uses a 64,000-token configured maximum minus 12,000 reserved and 12,000 non-history tokens, converted conservatively at four characters/token. Persisted generic tool results compact above 16,000 serialized characters.

## Durable state and lifecycle

The service selects latest complete turns fitting the character budget, rehydrates the latest exact managed-document reads, and streams the response. Normal non-error completion atomically saves sanitized user/assistant messages and updates last-active time; a new conversation receives a generated title or sanitized first-message fallback, capped at 80 characters. Tool mutations commit independently before turn persistence.

## Validation and invariants

Only valid user messages enter. Profile/tool/document content is untrusted data. Durable mutation requires friendly explicit confirmation. Known internal IDs are sanitized from assistant narrative/title; structured tool parts retain operational references. Selected history begins with a user message; incomplete leading assistant content is removed.

## Outputs and downstream effects

Text, reasoning, and tool events stream incrementally. Successful mutation outputs trigger dashboard refresh. Persisted managed-document reads retain compact identity/version metadata and are re-read at the exact prior version for later model context.

## Nonfunctional Requirements

| Classification | Implemented constraint | Scenario |
|---|---|---|
| Recoverability | An interrupted stream adds zero partial user/assistant turns; every earlier complete turn remains unchanged. | [Interrupted conversation turn](../../quality-scenarios/agent/interrupted-turn.md) |

## Failure, retry, and recovery

Abort or error finish does not save the turn. Disconnect, zero delivered text, or tool-step exhaustion produces an interruption/partial-work warning. Completed tool mutations are not rolled back by later model/stream failure; inspect durable state before regenerate/retry.

## Current limitations

History budgeting is character-estimated rather than provider-tokenized. Sanitization recognizes known patterns, not arbitrary sensitive data. Title generation failure silently falls back. Conversation turns are not durable async jobs and cannot resume mid-generation after process failure.

## Detailed specifications

- [Use the conversational agent](../../workflows/agent/use-conversation.md)
- [Interrupted-turn quality scenario](../../quality-scenarios/agent/interrupted-turn.md)
- [Strict agent-tool contract catalog](../../contracts/README.md)
