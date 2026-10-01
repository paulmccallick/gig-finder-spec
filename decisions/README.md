---
type: architecture
scope: application
summary: Find recorded architectural rationale and its verification boundary.
load_when:
  - Find recorded architectural rationale and its verification boundary.
related:
  - architecture/persistence.md
  - operations/deployment.md
---

# Decision Provenance

Historical rationale cannot be reconstructed reliably from implementation alone. This directory contains the 17 accepted ADRs moved from the application repository. Use them to understand recorded intent, then compare their implementation claims with current architecture. This corpus does not invent alternatives, motivation, or acceptance dates.

| Recorded decision | Verified current mechanism / qualification |
|---|---|
| [0001 — Agent update contracts](0001-agent-update-contracts.md) | See [conversational-agent architecture](../architecture/conversational-agent.md). |
| [0002 — Isolate AI SDK UI](0002-isolate-ai-sdk-ui.md) | See [conversational-agent architecture](../architecture/conversational-agent.md). |
| [0003 — Document context in conversations](0003-document-context-in-conversations.md) | See [documents and profile architecture](../architecture/documents-profile.md). |
| [0004 — Shared domain input contracts](0004-share-domain-input-contracts.md) | See the [interface guide](../interfaces/README.md). |
| [0005 — Revisioned audited changes](0005-revisioned-audited-change-transactions.md) | `DataStore.change`, typed history, expected-revision writes, and bounded reversal implement this for supported entities. Do not generalize its “every mutable row” language to settings, conversations, and Scout state. |
| [0006 — Authoritative document state](0006-authoritative-document-state.md) | See [documents and profile architecture](../architecture/documents-profile.md). |
| [0007 — External-state Docker deployment](0007-immutable-production-deployment.md) | Dockerfile and deployment script separate state and enforce commit-shaped deployment tags with database rollback. Its build-once language is broader than current CI: the smoke image and published multi-platform image are built separately. |
| [0008 — Agent tool contracts](0008-agent-tool-contracts.md) | See [conversational-agent architecture](../architecture/conversational-agent.md). |
| [0009 — Personal data outside source control](0009-keep-personal-data-out-of-source-control.md) | See [security requirements](../requirements/security.md). |
| [0010 — BunQueue background work](0010-use-bunqueue-for-background-work.md) | See [Scout architecture](../architecture/gig-scout.md). |
| [0011 — Uniform Scout source adapters](0011-use-uniform-source-adapters-for-scout.md) | See [Scout architecture](../architecture/gig-scout.md). |
| [0012 — Reusable JSON source templates](0012-use-templates-for-reusable-json-sources.md) | See [Scout architecture](../architecture/gig-scout.md). |
| [0013 — Private data in local logs](0013-allow-private-data-in-local-logs.md) | See [observability](../operations/observability.md). |
| [0014 — Separate Scout discovery and processing](0014-separate-scout-discovery-from-position-processing.md) | See [Scout architecture](../architecture/gig-scout.md). |
| [0015 — Business logic outside operations](0015-keep-business-logic-out-of-operations.md) | See the [architecture overview](../architecture/overview.md). |
| [0016 — Domain-owned mutations](0016-own-domain-table-mutations.md) | See [persistence](../architecture/persistence.md). |
| [0017 — Gig-owned posting identity resolution](0017-own-gig-posting-identity-resolution.md) | See [opportunity architecture](../architecture/opportunities.md). |

These linked ADRs retain their existing recorded status; this index is not a new architectural decision or reapproval. See [persistence](../architecture/persistence.md) and [deployment](../operations/deployment.md) for authoritative current implementation descriptions and code evidence. The index makes no blanket currency claim for historical implementation details.
