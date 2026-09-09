---
type: domain
scope: application
summary: Understand the main business concepts and relationships.
load_when:
  - Understand the main business concepts and relationships.
related:
  - APPLICATION.md
  - domain/terminology.md
  - architecture/persistence.md
---

# Domain Model

| Concept | Relationships and boundary |
|---|---|
| Gig | Tracked role with associated people, tasks, interactions, and managed documents. |
| Person | Professional contact with interactions, tasks, documents, and Gig relationships. |
| Gig-person relationship | Connects a person to an opportunity with a relationship category. |
| Task | Work related to a Gig, person, or general purpose; separate from a Gig's next-action summary. |
| Interaction | Communication/event with participants and optional Gig context; completed interactions supply contact recency. |
| Managed document | Versioned content with an owner/purpose; managed candidate documents supply additional context. |
| Candidate profile | Configured structured candidate data; distinct from managed profile documents. |
| Scout company/source | Where and how to discover employer positions. |
| Scout position | Discovered posting with description/evaluation evidence, review state, and optional Gig association. |
| Scout run | Discovery execution over company work; distinct from position processing/backfill. |
| Conversation | Persisted conversation turns and document references. |
| Change | Audit identity for a supported domain operation, not every application write. |

Each [capability](../APPLICATION.md#major-capabilities) owns detailed entity rules. Entity revision, document version, Scout state revision, and configuration version are distinct concurrency identities. See [terminology](terminology.md) and [persistence](../architecture/persistence.md).
