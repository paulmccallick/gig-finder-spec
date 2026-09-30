---
type: architecture
scope: conversational-agent
summary: Context construction, runtime, persistence boundaries, staging, and model provider implementation.
load_when:
  - changing runtime, context, persistence, or tools
---

# Conversational Agent Architecture

## Purpose

Explain how a candidate's request becomes a streamed answer, how saved information reaches the model, and why an interrupted reply can leave completed application changes behind. The [API and tool contract](../interfaces/api/conversational-agent.md) defines the boundaries used here.

## Components

| Component | Responsibility |
|---|---|
| `AgentPanel` | Browser conversation, attachment and model controls, using AI SDK `useChat` and `DefaultChatTransport` |
| Web adapter | Translate SDK UI messages and stream events into application-owned contracts and back |
| `ConversationService` | Validate input, select saved context, hide recognized identifiers, restore document content, and save the turn |
| `GigFinderConversationRuntime` | Convert application messages into model messages and translate `fullStream` output |
| `GigFinderAgent` | Call `streamText` with profile instructions, current UTC time, and core-service tools |

## Processing Model

The service loads saved messages, adds the current user message, and selects recent history within a character estimate. It then restores document content and attachment references for model use and applies the estimate again. Restoring content from compact saved metadata is called **rehydration**. The candidate profile is supplied to the runtime; the profile-document catalog is read for each response, and relevant document bodies require tool reads.

The runtime requires read, mutation, and tool-extension capabilities together, or none. Production composition supplies all three. Without them the prompt states the lack of live data. There is no separate service that checks user confirmation before a tool executes. The system prompt supplies advice and document-handling rules; selected tool descriptions add explicit-confirmation instructions. These instructions do not create an approval state.

Evidence: [composition](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/app.ts), [adapter](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/agent-handler.ts), [service](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/conversation-service.ts), [runtime](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/ai-sdk-conversation-runtime.ts), [system prompt](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/system-prompt.ts), [tool callbacks](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts).

## Context and Current Limits

These are implementation defaults, not service objectives.

| Concern | Current behavior |
|---|---|
| User text | 8,000 combined text characters |
| History | `(64,000 - 12,000 - 12,000) * 4 = 160,000` serialized characters estimated, not tokenizer accounting |
| Selection | Walk backward through messages, stop at budget, remove leading assistant messages; repeat after hydration |
| Oversized last message | Still included; the estimate is not a strict context ceiling |
| Saved tool output | Above 16,000 serialized characters, save truncation flag, original size, and preview |
| Document history | Managed reads retain versioned metadata; latest retained occurrence per reference is hydrated at recorded version |
| Recent list | 20, descending last-active time then ID |
| Title | First completed turn; eight-word prompt, 40 output-token cap, 80-character cleaned result/fallback |
| Agent steps | 20 by default; configured smoke modes use two |
| Model retries | One SDK retry for response and title |

Recognized internal identifiers are sanitized in assistant text/reasoning and titles. User text only has staged references hidden. Structured parts retain references. Streaming sanitization buffers the last six whitespace-delimited tokens to reduce split-identifier exposure; this is pattern-based display filtering, not a general secrets filter.

Evidence: [context/sanitization](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/conversation-service.ts), [title](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/ai-sdk-conversation-runtime.ts), [agent defaults](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-agent.ts).

## Persistence and Guarantees

`saveTurn` wraps conversation insertion/update, audit change creation, and both message inserts in one SQLite transaction. Messages receive consecutive sequence values. Updates save a before-image and increment revision. Tool commits happen independently before the final conversation save; no response-level rollback, server queue, or cross-request lock exists in the conversation service. Browser guards serialize only its own active workspace.

The completion callback skips save on a reported abort/error. Step exhaustion can save, and service saving does not require nonempty assistant text. The browser separately treats a response as retained when it has text or a `tool-calls` finish reason, without abort/disconnect/error. Neither these browser decisions nor the model finish event acknowledge persistence: finish is emitted before callback persistence completes. Callback failure becomes an error event.

Evidence: [repository](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/conversation-store.ts), [service](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/conversation-service.ts), [stream translator](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/ai-sdk-conversation-runtime.ts).

## Staging

Staging holds converted attachment content temporarily while the candidate asks about it or chooses to save it. Conversion and managed-document storage are explained in the [document architecture](documents-profile.md).

Extracted uploads live in an in-process Map. Defaults: a 15-minute lifetime, 20 items, 500,000 aggregate characters, with environment overrides. Each item still obeys the 50,000-character managed-content cap. Stage/get prune expired entries; discard deletes by reference. No account or conversation binding is stored. Restart loses staging.

The creation tool reads exact staged references, preserves extracted content, and records consumption after managed creation. Reuse of a live consumed reference returns its original result. The UI discards references returned by successful `create_document` results after retained completion; it does not discard unconsumed attachments on send or conversation switch. Saved history cannot resolve discarded or expired staging. Conversion validation belongs to the [document boundary](../interfaces/api/documents-profile.md#upload-conversion-boundary).

Evidence: [staging](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/staged-documents.ts), [configuration](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/app.ts), [creation tool](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts), [UI cleanup](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/agent/AgentPanel.tsx).

## Model Selection and Provider

The application stores one model preference shared across conversations. Catalog: Sol/Terra/Luna; built-in default: Sol. `CODEX_AGENT_MODEL` supplies the fallback when no preference exists. The global SQLite key is `agent_model`, not scoped to a conversation. Response and title independently read selection.

The provider reads `auth.json` from configured `CODEX_HOME` or the home `.codex` directory, extracts an access token and ChatGPT account ID (including JWT fallback), rejects tokens expiring within 60 seconds, and calls the Responses adapter at `https://chatgpt.com/backend-api/codex`. It implements no refresh. Requests submit `store: false`; response generation requests automatic reasoning summaries. These are submitted options, not independently verified provider retention guarantees.

Evidence: [settings](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/application-settings.ts), [settings store](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/settings-store.ts), [provider](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/codex-provider.ts), [agent](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-agent.ts).

## Reversal and Failure Modes

Tools use `agent-tool:<toolCallId>` change identifiers; revert uses `agent-revert:<toolCallId>`. A regenerated response can produce different call IDs, so retry does not universally deduplicate previous effects.

Revert examines histories for gigs, people, gig-person relationships, tasks, interactions, and participants. It rejects missing/no-reversible-history changes, records edited again after the change being undone, and interaction dependencies that would leave a replacement referring to an invalid earlier interaction. Restoration and its linked audit change are transactional: both succeed together or neither is committed. Document/conversation-only changes have no eligible histories in this path.

The tool wrapper converts domain/schema failures to structured results; unexpected exceptions become generic `tool_failed`. Runtime errors usually become generic messages, with selected Codex authentication/model/smoke errors passed through. Debug model logging contains generated text, reasoning, and tool inputs; display sanitization does not establish log redaction.

Evidence: [tool wrapper](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts), [reversal](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/store.ts), [logging](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-agent.ts), [safe errors](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/ai-sdk-conversation-runtime.ts).

## Browser Results and Interruption

The workspace shows model text, reasoning summaries, and friendly tool-activity labels. Successful managed `get_document` output supplies version-specific View/Download actions; creation or update output alone does not. After a reply ends, any successful output containing a `changeId` triggers application-data refresh, including replies that were interrupted.

Stop calls the SDK cancellation function and the HTTP handler passes the request signal to the runtime. A runtime-reported abort causes the service to skip saving; a browser disconnect alone cannot prove that server processing or earlier tool commits stopped. The browser's ordinary retry invokes SDK regeneration, while its step-limit warning suppresses that retry button. There is no stream-resume endpoint.

The request handler sets a 120-second idle timeout for agent message requests. This is an idle-stream setting, not a total response-time guarantee.

Evidence: [workspace](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/agent/AgentPanel.tsx), [document links](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/agent/DocumentActions.tsx), [HTTP handler](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts), [runtime](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/ai-sdk-conversation-runtime.ts).

## Used By

[Capability](../capabilities/conversational-agent.md), [workflow](../workflows/conversational-agent-turn.md).

## Related ADRs

- [ADR 0001: Use operation-list patches for agent updates](../decisions/0001-agent-update-contracts.md)
- [ADR 0002: Isolate AI SDK UI in the web package](../decisions/0002-isolate-ai-sdk-ui.md)
- [ADR 0003: Keep document content out of conversation history](../decisions/0003-document-context-in-conversations.md)
- [ADR 0004: Share one domain input contract across create and update](../decisions/0004-share-domain-input-contracts.md)
- [ADR 0008: Adapt domain capabilities to strict agent tools](../decisions/0008-agent-tool-contracts.md)

## Related documents

- [Conversational Agent](../capabilities/conversational-agent.md)
- [Ask the Agent for Help](../workflows/conversational-agent-turn.md)
- [Conversational Agent Interfaces](../interfaces/api/conversational-agent.md)
- [Document and Profile Architecture](documents-profile.md)
