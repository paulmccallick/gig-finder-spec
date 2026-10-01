---
type: architecture
scope: conversational-agent
summary: Context construction, runtime, persistence boundaries, staging, and model provider implementation.
load_when:
  - changing runtime, context, persistence, or tools
related:
  - capabilities/conversational-agent.md
  - workflows/conversational-agent-turn.md
  - interfaces/api/conversational-agent.md
  - architecture/documents-profile.md
---

# Conversational Agent Architecture

## Components and Processing Model

**AGENT-ARCH-001** The browser agent panel uses the AI SDK chat transport. The web adapter translates SDK UI messages/events to application-owned contracts. The conversation service owns validation, history selection, sanitization, document rehydration, and saving. The runtime converts model messages and translates stream events. The agent invokes text generation with profile instructions, current UTC time, and core-service tools.

The runtime requires read, mutation, and tool-extension capabilities together, or none. Production composition supplies all three. Without them the prompt states the lack of live data. There is no separate consent arbiter.

Implementation locations are recorded in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#agent-arch-001).

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

Implementation locations are recorded in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#agent-arch-001).

## Persistence and Guarantees

Conversation saving wraps conversation insertion/update, audit change creation, and both message inserts in one SQLite transaction. Messages receive consecutive sequence values. Updates save a before-image and increment revision. Tool commits happen independently before the final conversation save; no response-level rollback, server queue, or cross-request lock exists in the conversation service. Browser guards serialize only its own active workspace.

The completion callback skips save on abort/error. Step exhaustion can save. Model finish is emitted before callback persistence completes, so finish is not a persistence acknowledgement. Callback failure becomes an error event.

Implementation locations are recorded in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#agent-arch-001).

## Staging

Extracted uploads live in an in-process Map. Defaults: 15-minute TTL, 20 items, 500,000 aggregate characters, with environment overrides. Each item still obeys the 50,000-character managed-content cap. Stage/get prune expired entries; discard deletes by reference. No account or conversation binding is stored. Restart loses staging.

The creation tool reads exact staged references, preserves extracted content, and records consumption after managed creation. Reuse of a live consumed reference returns its original result. The UI discards saved references after retained completion; saved history cannot resolve discarded or expired staging. Conversion validation belongs to the [document boundary](../interfaces/api/documents-profile.md#upload-conversion-boundary).

Implementation locations are recorded in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#agent-arch-001).

## Model Selection and Provider

Catalog: Sol/Terra/Luna; built-in default: Sol. `CODEX_AGENT_MODEL` supplies the fallback when no preference exists. The global SQLite key is `agent_model`, not scoped to a conversation. Response and title independently read selection.

The provider reads `auth.json` from configured `CODEX_HOME` or the home `.codex` directory, extracts an access token and ChatGPT account ID (including JWT fallback), rejects tokens expiring within 60 seconds, and calls the Responses adapter at `https://chatgpt.com/backend-api/codex`. It implements no refresh. Requests submit `store: false`; response generation requests automatic reasoning summaries. These are submitted options, not independently verified provider retention guarantees.

Implementation locations are recorded in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#agent-arch-001).

## Reversal and Failure Modes

Tools use `agent-tool:<toolCallId>` change identifiers; revert uses `agent-revert:<toolCallId>`. A regenerated response can produce different call IDs, so retry does not universally deduplicate previous effects.

Revert examines histories for gigs, people, gig-person relationships, tasks, interactions, and participants. It rejects missing/no-reversible-history changes, mismatched immediate revisions, and invalid interaction supersession dependencies. Restoration and its linked audit change are transactional. Document/conversation-only changes have no eligible histories in this path.

The tool wrapper converts domain/schema failures to structured results; unexpected exceptions become generic `tool_failed`. Runtime errors usually become generic messages, with selected Codex authentication/model/smoke errors passed through. Debug model logging contains generated text, reasoning, and tool inputs; display sanitization does not establish log redaction.

Implementation locations are recorded in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#agent-arch-001).

## Used By

[Capability](../capabilities/conversational-agent.md), [workflow](../workflows/conversational-agent-turn.md).
