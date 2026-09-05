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

## Features

| Feature | Use when | Document |
|---|---|---|
| Conversations | Ask, resume, switch, stream, stop, or retry agent work | [Open](../features/agent/conversations.md) |
| Upload staging | Attach and temporarily convert PDF, DOCX, or Markdown | [Open](../features/agent/upload-staging.md) |
| Model selection | Persist the global supported model choice | [Open](../features/agent/model-selection.md) |
| Change reversal | Undo an exact eligible audited mutation safely | [Open](../features/agent/change-reversal.md) |

## Shared foundations

- [Agent consent and privacy](../foundations/agent-consent-and-privacy.md)
- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)

## Evidence pointers (optional)

- Implementation areas: `src/agent/`, `src/core/conversation-service.ts`, `src/web/client/agent/`, `src/web/agent-handler.ts`
- Test suites: `src/agent/test/`, `src/core/test/conversation-service.test.ts`, `src/web/test/agent-handler.test.ts`, `src/web/test/client/agent/`
