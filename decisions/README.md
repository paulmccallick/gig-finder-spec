---
type: architecture
scope: architectural-decisions
summary: Index of the original architectural decisions and the current implementation documents they explain.
load_when:
  - understanding why an architectural approach was chosen
  - reconsidering a significant technical decision
---

# Architectural Decisions

These 17 architecture decision records (ADRs) were moved from the code repository. They explain **why** technical choices were made. Read the current architecture document to understand **how** the application works, then load the relevant ADR when the reason for that approach matters.

The original wording, statuses, dates, and sections are preserved. Existing mentions of other ADRs now have clickable links. Missing sections such as alternatives were not invented during the move. Current-code qualifications belong in the implementation documents linked below, not in the original decision text.

## Decision Index

| Decision | Recorded reason | Current implementation |
|---|---|---|
| [ADR 0001: Use operation-list patches for agent updates](0001-agent-update-contracts.md) | Strict update operations let the model edit selected fields without changing the shared domain input contract. | [Conversational agent](../architecture/conversational-agent.md) |
| [ADR 0002: Isolate AI SDK UI in the web package](0002-isolate-ai-sdk-ui.md) | Keep browser/stream SDK types from coupling core contracts and storage to the UI framework. | [Conversational agent](../architecture/conversational-agent.md) |
| [ADR 0003: Keep document content out of conversation history](0003-document-context-in-conversations.md) | Avoid duplicating document bodies in saved conversations while retaining exact-version context. | [Documents and profile](../architecture/documents-profile.md) |
| [ADR 0004: Share one domain input contract across create and update](0004-share-domain-input-contracts.md) | Keep create/update field definitions and validation from drifting across clients. | [Interface guide](../interfaces/README.md) |
| [ADR 0005: Store mutations as revisioned, audited transactions](0005-revisioned-audited-change-transactions.md) | Save related changes together, retain their history, and support guarded reversal. | [Persistence](../architecture/persistence.md) |
| [ADR 0006: Make database document state authoritative](0006-authoritative-document-state.md) | Choose the database as the authority when managed documents also have filesystem copies. | [Documents and profile](../architecture/documents-profile.md) |
| [ADR 0007: Deploy Docker images with external state and verified rollback](0007-immutable-production-deployment.md) | Separate releases from private runtime state and recover after failed deployment. | [Deployment](../operations/deployment.md) |
| [ADR 0008: Adapt domain capabilities to strict agent tools](0008-agent-tool-contracts.md) | Adapt shared capabilities to strict model schemas without duplicating domain rules. | [Conversational agent](../architecture/conversational-agent.md) |
| [ADR 0009: Keep personal data out of source control](0009-keep-personal-data-out-of-source-control.md) | Keep private job-search information out of source control and release artifacts. | [Security and privacy](../requirements/security.md) |
| [ADR 0010: Use BunQueue for durable background work](0010-use-bunqueue-for-background-work.md) | Let searches outlive requests and recover on one host without an external Redis service. | [Gig Scout](../architecture/gig-scout.md) |
| [ADR 0011: Structure Scout as a core capability with uniform adapters](0011-use-uniform-source-adapters-for-scout.md) | Separate Scout orchestration from the variety of career-site retrieval methods. | [Gig Scout](../architecture/gig-scout.md) |
| [ADR 0012: Use templates for reusable JSON sources](0012-use-templates-for-reusable-json-sources.md) | Reuse configuration for companies sharing a career platform and allow narrow request hooks. | [Gig Scout](../architecture/gig-scout.md) |
| [ADR 0013: Allow private application data in local logs](0013-allow-private-data-in-local-logs.md) | Keep useful private diagnostics locally while excluding authentication secrets and tracked artifacts. | [Health checks and logs](../operations/observability.md) |
| [ADR 0014: Separate Scout discovery from position processing](0014-separate-scout-discovery-from-position-processing.md) | Give company discovery and position processing independent failure and retry boundaries. | [Gig Scout](../architecture/gig-scout.md) |
| [ADR 0015: Keep business logic out of operations](0015-keep-business-logic-out-of-operations.md) | Keep business decisions reusable instead of placing them in queue and process handlers. | [Architecture overview](../architecture/overview.md) |
| [ADR 0016: Mutate domain-owned tables through the owning domain service](0016-own-domain-table-mutations.md) | Prevent cross-domain writes from bypassing the owning service’s validation and history. | [Persistence](../architecture/persistence.md) |
| [ADR 0017: Own Gig posting identity resolution in the Gig domain](0017-own-gig-posting-identity-resolution.md) | Use one Gig-owned posting-resolution rule while Scout coordinates the reviewed workflow. | [Opportunities](../architecture/opportunities.md) |

## Reading Historical Decisions

An Accepted status records the decision's original status; it does not prove that every sentence describes today's implementation. In particular, [persistence](../architecture/persistence.md) explains the scope of revisioned writes, [deployment](../operations/deployment.md) distinguishes smoke and published image builds, and [Scout architecture](../architecture/gig-scout.md) explains the stages implemented since the original discovery/processing split.

The [documentation map](../MAP.md) routes behavior questions to capabilities and implementation questions to architecture. Load an ADR to understand a choice or assess a proposed change to that choice.

## Related documents

- [Architecture overview](../architecture/overview.md)
- [Persistence](../architecture/persistence.md)
- [Deployment](../operations/deployment.md)
- [Documentation map](../MAP.md)
