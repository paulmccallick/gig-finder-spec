---
type: workflow
scope: conversational-agent-turn
summary: Submission, streaming, persistence, attachment handling, and interruption behavior.
load_when:
  - tracing a response or investigating partial work
related:
  - capabilities/conversational-agent.md
  - domain/conversational-agent-conversation.md
  - interfaces/api/conversational-agent.md
  - architecture/conversational-agent.md
---

# Conversation Turn

## Purpose

**AGENT-WF-001** Answer a candidate message using application context and supported tools, preserving the completed turn.

## Actors

Candidate, application conversation service, model runtime, and domain tools.

## Trigger

Send submits text or a staged reference.

## Preconditions

The browser prevents overlapping sends in its workspace and blocks submission during upload or model-setting saves. The backend requires a valid conversation ID and user message; a saved conversation need not exist. The default live runtime requires provider authentication.

## Inputs

Conversation ID and latest user message. Staged references are appended to text. The client does not supply authoritative full history.

## Normal Flow

1. Optionally convert/upload one file, obtaining a staged reference and extraction metadata.
2. Load saved history, append user input, select recent context, rehydrate document reads, and restore attachment references for the model.
3. Read model settings and current profile-document catalog; construct the agent with candidate profile, current UTC time, and application tools.
4. Stream step, reasoning, text, and tool activity. Each mutation commits through its domain service independently.
5. On non-aborted completion without stream error, compact/sanitize the assistant message, generate a first-turn title or fallback, and atomically save both messages and conversation activity metadata.
6. The UI refreshes data after successful mutation output. Retained completion refreshes recent conversations. Saved staged references are discarded after normal text completion or step exhaustion.

## Alternate Flows

- Changing models affects subsequent requests. Title generation separately reads settings and can use a different model from the response if the preference changes meanwhile.
- A `tool-calls` finish can indicate step exhaustion: completed work and the turn are retained, and the UI shows a processing-limit warning without its usual retry button.
- History rehydration reads the most recent retained occurrence of each document at its recorded version. Missing content leaves the compact result unchanged.
- Submission does not discard an unconsumed upload; it remains available until discard or expiry.

## Failure Behavior

Validation fails before model processing. Stream errors produce user-safe events. Aborted/error turns are not saved, but earlier tool commits remain. Stop forwards cancellation; no response-wide rollback exists. Retry is another model request, not guaranteed exactly-once replay of earlier effects.

Title failure uses normalized user text capped at 80 characters. Upload conversion/capacity failures do not add a staged item. Failed client discard is tolerated because staging expires. A save failure may arrive after the model finish event because persistence runs in the completion callback.

## Completion / Postconditions

A successful save contains the ordered user/assistant pair and compact tool activity. Domain actions persist independently. Relevant tool output establishes whether an action occurred.

## Nonfunctional Requirements

No separate workflow target is established; [architecture](../architecture/conversational-agent.md) describes current limits.

## Related Documentation

[Capability](../capabilities/conversational-agent.md). Current implementation and verification references for this workflow are listed in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#agent-wf-001).
