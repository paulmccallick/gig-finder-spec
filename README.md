# GigFinder Canonical Specification

This corpus describes GigFinder's current supported behavior from application code, database schemas/migrations, and tests. Start with the capability matching the actor's intent, choose its feature, then load only the feature and explicit dependencies. Load a workflow, Operational Model, Quality Scenario, surface variant, or strict tool contract only when the feature routes the task there. [Authoring rules](AUTHORING.md) define the canonical format.

## Capabilities

| Capability | Covers | Entry point |
|---|---|---|
| Opportunities | Pipeline records, availability, fit, and related people | [Open](capabilities/opportunities.md) |
| Networking | People and relationship tracking | [Open](capabilities/networking.md) |
| Tasks | Job-search commitments and completion | [Open](capabilities/tasks.md) |
| Interactions | Messages, calls, meetings, and interviews | [Open](capabilities/interactions.md) |
| Documents and profile | Managed content, versions, uploads, and candidate context | [Open](capabilities/documents-profile.md) |
| Conversational agent | Conversations, supported tools, model choice, and undo | [Open](capabilities/conversational-agent.md) |
| Gig Scout | Sourcing runs, screening, review, and Gig promotion | [Open](capabilities/gig-scout.md) |

## Shared foundations

- [Identity and references](foundations/identity-and-references.md)
- [Atomic changes, revisions, and reversal](foundations/changes-revisions-reversal.md)
- [Dates, time, and ordering](foundations/dates-time-ordering.md)
- [Queries and pagination](foundations/queries-and-pagination.md)
- [Managed-document integrity](foundations/managed-document-integrity.md)
- [Agent mutation consent and privacy](foundations/agent-consent-and-privacy.md)
