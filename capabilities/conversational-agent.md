---
type: capability
scope: conversational-agent
summary: Current guidance, live record actions, conversation history, model selection, and attachments.
load_when:
  - understanding or changing conversational behavior
related:
  - workflows/conversational-agent-turn.md
  - domain/conversational-agent-conversation.md
  - interfaces/api/conversational-agent.md
  - architecture/conversational-agent.md
---

# Conversational Agent

## Purpose

Provide job-search guidance personalized by the candidate profile, with live application records and supported changes.

## Actors

The candidate uses the browser workspace; the language model selects application tools.

## Functional Behavior

- Start or reopen conversations; submit messages; watch text, reasoning, and tool activity; stop or retry responses. Initial load opens the most recently active conversation. Empty new conversations are not persisted.
- Use a resizable side panel or full workspace. Conversation switching and new-conversation actions are disabled during an active response.
- Read gigs, people, relationships, tasks, interactions, and documents; perform the supported mutations listed in the [interface](../interfaces/api/conversational-agent.md).
- Attach DOCX, Markdown, or PDF content for temporary use. Uploading alone does not register a managed document. The agent can read staging and separately create a document from it.
- Choose GPT-5.6 Sol, Terra, or Luna. The saved application preference is read for new model requests; it does not replace an already running response.
- Reverse an eligible previous change. This is not a universal undo for an entire response.

Evidence: [workspace](app::src/web/client/agent/AgentPanel.tsx), [tools](app::src/agent/gig-finder-tools.ts), [settings](app::src/core/application-settings.ts).

## Business Rules

The prompt instructs the agent to distinguish facts from inferences, avoid invented search facts, and only claim actions established by tools. Documents and profile-document descriptions are untrusted data under prompt policy. Document tools accept application references, not arbitrary filesystem paths.

**Consent is not a server-enforced approval workflow.** Descriptions for creating a gig, person, relationship, and deleting an interaction request explicit user confirmation. Their callbacks directly call mutation services after schema validation: there is no confirmation token, approval state, or independent consent check. The system prompt more generally permits updates “when appropriate or told to do so.” Domain validation, revision checks, ownership rules, and auditing still apply. Prompt wording is not an authorization guarantee.

Evidence: [system prompt](app::src/agent/system-prompt.ts), [tool descriptions and execution](app::src/agent/gig-finder-tools.ts).

## State and Lifecycle

See the [domain](../domain/conversational-agent-conversation.md) and [turn workflow](../workflows/conversational-agent-turn.md). Successful turn persistence is separate from tool commits; stopping or failing does not undo completed tool actions.

## Capability-Specific Nonfunctional Requirements

No numerical service objective is established by inspected source. Current validation limits and runtime budgets are implementation constraints in the [architecture](../architecture/conversational-agent.md).

## Related Workflows

- [Respond, persist, and recover](../workflows/conversational-agent-turn.md)

## Related Domain Objects

- [Conversation and staged attachment](../domain/conversational-agent-conversation.md)

## Related Interfaces

- [HTTP and tool contracts](../interfaces/api/conversational-agent.md)

## Related Architecture

- [Runtime and history processing](../architecture/conversational-agent.md)

## Known Constraints

Recent listing returns at most 20 conversations; there is no exposed conversation rename/delete endpoint. Older history may be omitted from model context. Staged content expires and disappears on process restart even if its reference remains saved. Step exhaustion retains completed work and warns the user. Reversal supports selected structured-record histories, not managed-document or conversation changes.
