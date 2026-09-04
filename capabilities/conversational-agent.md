---
id: conversational-agent
title: Conversational agent
aliases: [GigFinderAgent, chat, assistant]
---

# Conversational agent

## Purpose and boundary

Lets the candidate ask questions over private profile and tracker context and request supported record/document mutations through strict tools. It does not provide arbitrary filesystem or network browsing.

## Vocabulary

| Term | Meaning here |
|---|---|
| turn | One user message and completed assistant response. |
| tool | Strict read or mutation operation listed in the contract catalog. |
| staged upload | Temporary converted document reference attached to a prompt. |

## Workflows

| Workflow | Use when | Document |
|---|---|---|
| Use a conversation | Ask, resume, switch, or retry agent work | [Open](../workflows/agent/use-conversation.md) |
| Stage an upload | Attach PDF, DOCX, or Markdown for agent use | [Open](../workflows/agent/stage-upload.md) |
| Choose a model | Change the agent model | [Open](../workflows/agent/choose-model.md) |
| Revert a change | Undo an eligible agent-recorded mutation | [Open](../workflows/agent/revert-change.md) |

## Shared foundations

- [Agent consent and privacy](../foundations/agent-consent-and-privacy.md)
- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)

## Evidence pointers (optional)

- Implementation areas: `src/agent/`, `src/core/conversation-service.ts`, `src/web/client/agent/`, `src/web/agent-handler.ts`
- Test suites: `src/agent/test/`, `src/core/test/conversation-service.test.ts`, `src/web/test/agent-handler.test.ts`, `src/web/test/client/agent/`
