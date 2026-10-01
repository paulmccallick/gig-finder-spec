# Documentation Map

This tree describes the inspected application. Load only the documents relevant to the task. Begin with [APPLICATION.md](APPLICATION.md) for purpose, actors, scope, and system context.

## Capabilities

| When working on… | Start here |
|---|---|
| Tracked roles, pipeline, availability, posting identity | [Opportunities](capabilities/opportunities.md) |
| People, Gig relationships, contact recency | [Networking](capabilities/networking.md) |
| Commitments, due dates, completion | [Tasks](capabilities/tasks.md) |
| Communications, meetings, interviews, participants | [Interactions](capabilities/interactions.md) |
| Document ownership, versions, conversion, candidate context | [Documents and profile](capabilities/documents-profile.md) |
| Conversation, tools, models, staging, reversal | [Conversational agent](capabilities/conversational-agent.md) |
| Discovery, relevance, processing, review, promotion | [Gig Scout](capabilities/gig-scout.md) |

## Significant Workflows

- [Resolve a posting into a Gig](workflows/opportunities-posting-resolution.md).
- [Maintain and reuse managed documents](workflows/documents-profile-maintenance.md).
- [Discover company positions](workflows/gig-scout-discovery.md).
- [Process, review, and promote positions](workflows/gig-scout-review-processing.md).
- [Conversation, persistence, and interruption](workflows/conversational-agent-turn.md).
- [Interaction correction and contact history](workflows/interactions-contact-history.md).

## Supporting Context

- Business concepts: [model](domain/model.md), [terminology](domain/terminology.md); capability documents route to detailed entities.
- Application boundaries: [interface index](interfaces/README.md); capability interfaces own surface-specific contracts.
- Cross-cutting constraints: [global NFRs](requirements/global-nfrs.md), [security/privacy](requirements/security.md), [reliability](requirements/reliability.md).
- Implementation design only when needed: [architecture overview](architecture/overview.md), [persistence](architecture/persistence.md), then capability-specific architecture.
- Volatile source paths, symbols, and verification locations: [implementation map](IMPLEMENTATION_MAP.md), keyed by stable specification statement IDs.
- Operating the application: [deployment](operations/deployment.md), [observability](operations/observability.md), [recovery](operations/recovery.md).
- Why a technical approach exists: [recorded decisions and qualifications](decisions/README.md). Do not infer rationale from code alone.

## Authority and Maintenance

Read the specification before implementation. Use [IMPLEMENTATION_MAP.md](IMPLEMENTATION_MAP.md) to locate current code and verification evidence. If code and specification disagree, record and resolve the discrepancy explicitly; do not automatically change either side or infer a requirement from an implementation constant.

Superseded spec-repository documentation has been removed and was not used as source material. Code-repository PRDs/plans are historical leads, not current behavior. Update affected capability, domain, interface, workflow, requirement, and architecture documents together when behavior changes.
