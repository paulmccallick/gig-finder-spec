---
type: interface
scope: conversational-agent
summary: Conversation routes, stream semantics, model settings, staging removal, and tool contracts.
load_when:
  - integrating with or changing conversational boundaries
---

# Conversational Agent Interfaces

These boundaries support sending a candidate request, reopening saved discussions, selecting a model, and supplying temporary source material. The [capability](../../capabilities/conversational-agent.md) describes what the candidate can accomplish; this document defines how the browser and model invoke it.

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

The browser sends only its latest message. The service loads any saved history for the supplied conversation ID; a new valid ID starts a conversation when the first turn is saved.

Unsupported methods return 405. Submitted conversation IDs match `[A-Za-z0-9_-]{1,100}`. Missing IDs, malformed JSON, service-rejected messages/history, and excessive user text produce 400. The UI adapter assumes some message structure before service validation; this is not a guarantee that every malformed JSON shape receives 400. Request size rejection at 32,000 bytes checks declared Content-Length, not a separately counted body size. A user message requires an ID string and valid parts; nonempty text is not required by service validation. The adapter discards unsupported UI parts; saved attachment parts are hidden from returned UI messages.

These handlers establish no per-user authentication or conversation ownership and expose no approval endpoint. Broader deployment controls cannot be inferred from conversation IDs. The wire format delegates to installed AI SDK helpers; there is no application version segment or explicit stream-resume API.

Evidence: [routing](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts), [adapter](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/agent-handler.ts), [validation](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/conversation-service.ts).

## Stream Contract

The response streams incremental UI updates rather than returning one JSON answer. Internal events cover start/message ID; start/finish step; text/reasoning start, delta, end; tool input start, delta, available; tool output available/error; finish/reason; and error/errorText. The web adapter maps to the SDK UI protocol. A tool failure may be a structured output value, not a transport error. A finish event reports model completion, not a successful conversation save. Errors can follow finish; see [architecture](../../architecture/conversational-agent.md).

Evidence: [event contracts](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/conversation-contracts.ts), [translation](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/ai-sdk-conversation-runtime.ts).

## Browser Result Handling

Successful mutation output is recognized by `status: "ok"` and a `changeId` field. At response finish, this triggers the browser's application-data refresh; it does not establish that the conversation turn was saved.

Only successful `get_document` results with valid managed-document metadata produce View/Download actions. Actions are deduplicated by reference and read version, and use `/documents/:reference/versions/:version` and `/api/documents/:reference/versions/:version/download`. Compacted saved read results retain the metadata needed to show these links when reopening history. The [document interface](documents-profile.md) defines their behavior. Create/update results alone do not create action cards.

Evidence: [workspace result handling](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/agent/AgentPanel.tsx), [document actions](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/agent/DocumentActions.tsx).

## Agent Tools

Tools are model-callable application operations; they are not additional HTTP endpoints. Authoritative strict Zod schemas reside in [tool registrations](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts) and [update operations](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/update-tool-schemas.ts). The schemas define exact accepted fields, nullability, and limits.

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

The wrapper returns failures as `{status:"error", error, message}`. Codes include `duplicate_change`, `duplicate`, `not_found`, `consistency_error`, `not_revertible`, `revision_conflict`, `validation_failed`, `unsupported`, and `tool_failed`. Successful mutations include relevant records/document metadata and change identifiers; document results also report `changed`. Creation tools for gigs, people, and relationships, and interaction deletion, instruct the model to obtain explicit confirmation. Their callbacks validate input and call mutation services without checking a confirmation token or approval state; see [business rules](../../capabilities/conversational-agent.md#business-rules).

## Related documents

- [Conversational Agent](../../capabilities/conversational-agent.md)
- [Conversational Agent Architecture](../../architecture/conversational-agent.md)
- [Document Interfaces](documents-profile.md)
