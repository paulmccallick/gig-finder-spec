---
type: interface
scope: conversational-agent
summary: Conversation routes, stream semantics, model settings, staging removal, and tool contracts.
load_when:
  - integrating with or changing conversational boundaries
related:
  - capabilities/conversational-agent.md
  - architecture/conversational-agent.md
  - interfaces/api/documents-profile.md
---

# Conversational Agent Interfaces

## HTTP Contract

| Method and route | Input | Result |
|---|---|---|
| POST `/api/agent/messages` | JSON `{id, message}`; AI SDK UI user message | AI SDK UI-message stream; no-store |
| GET `/api/agent/conversations` | None | `{conversations: [{id,title,createdAt,lastActiveAt}]}`; latest 20; no-store |
| GET `/api/agent/conversations/:id` | URL-encoded ID | `{conversation,messages}` in UI format; no-store; 404 missing |
| POST `/api/agent/documents` | Multipart `file` | 201 staging metadata; [conversion boundary](documents-profile.md#upload-conversion-boundary) |
| DELETE `/api/agent/documents/:reference` | URL-encoded reference | 204 removed or 404 missing |
| GET `/api/settings/agent-model` | None | `{agentModel}` |
| PUT `/api/settings/agent-model` | `{modelId: "gpt-5.6-sol" | "gpt-5.6-terra" | "gpt-5.6-luna"}` | Saved `{agentModel}` |

Unsupported methods return 405. Conversation IDs match `[A-Za-z0-9_-]{1,100}`. Missing ID, malformed JSON, invalid message/history, and excessive user text produce 400. Request size rejection at 32,000 bytes checks declared Content-Length, not a separately counted body size. A user message requires an ID string and valid parts; nonempty text is not required by service validation. The adapter discards unsupported UI parts; saved attachment parts are hidden from returned UI messages.

These handlers establish no per-user authentication or conversation ownership and expose no approval endpoint. Broader deployment controls cannot be inferred from conversation IDs. The wire format delegates to installed AI SDK helpers; there is no application version segment or explicit stream-resume API.

Evidence: [routing](../../../gig-finder/src/web/request-handler.ts), [adapter](../../../gig-finder/src/web/agent-handler.ts), [validation](../../../gig-finder/src/core/conversation-service.ts).

## Stream Contract

Internal events cover start/message ID; start/finish step; text/reasoning start, delta, end; tool input start, delta, available; tool output available/error; finish/reason; and error/errorText. The web adapter maps to the SDK UI protocol. A tool failure may be a structured output value, not a transport error. Finish does not acknowledge persistence; see [architecture](../../architecture/conversational-agent.md).

Evidence: [event contracts](../../../gig-finder/src/core/conversation-contracts.ts), [translation](../../../gig-finder/src/agent/ai-sdk-conversation-runtime.ts).

## Agent Tools

Authoritative strict Zod schemas reside in [tool registrations](../../../gig-finder/src/agent/gig-finder-tools.ts) and [update operations](../../../gig-finder/src/agent/update-tool-schemas.ts). These are runtime tools, not HTTP endpoints.

| Area | Tools |
|---|---|
| Resolution | `search_gigs_and_people` |
| Gigs | `list_gigs`, `get_gig`, `create_gig`, `update_gig` |
| People | `list_people`, `get_person`, `create_person`, `update_person` |
| Relationships | `list_gig_person_relationships`, `get_gig_person_relationship`, `create_gig_person_relationship` |
| Tasks | `list_tasks`, `get_task`, `create_task`, `update_task` |
| Interactions | `list_interactions`, `get_interaction`, `create_interaction`, `update_interaction`, `delete_interaction` |
| Documents | `list_documents`, `list_document_versions`, `get_document`, `create_document`, `update_document` |
| Reversal | `revert_change` |

Updates use explicit set/clear operations. Reads use durable IDs and bounded/paginated queries. Document replacement takes expected version; interaction deletion takes expected revision. Revert requires an exact change ID and rejects overwriting later edits. No general filesystem, shell, email, calendar, or web-search tools are registered.

The wrapper returns failures as `{status:"error", error, message}`. Codes include `duplicate_change`, `duplicate`, `not_found`, `consistency_error`, `not_revertible`, `revision_conflict`, `validation_failed`, `unsupported`, and `tool_failed`. Successful mutations include relevant records/document metadata and change identifiers; document results also report `changed`. Confirmation wording on selected tools is prompt policy, not an execution guard; see [business rules](../../capabilities/conversational-agent.md#business-rules).
