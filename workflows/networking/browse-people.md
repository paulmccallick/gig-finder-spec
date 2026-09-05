---
id: browse-people
capability: networking
feature: people
title: Browse and inspect people
summary: Find contacts and inspect identity, relationship, derived contact history, documents, and Gig links.
aliases: [view network, search people, open contact]
requires: [../../foundations/queries-and-pagination.md]
related: [maintain-person.md, link-person-opportunity.md, ../interactions/browse-interactions.md]
implementation_areas: [src/core/people.ts, src/core/services.ts, src/web/client/NetworkingBoard.tsx, src/agent/gig-finder-tools.ts]
test_suites: [src/core/test/people.test.ts, src/core/test/read-services.test.ts, src/agent/test/gig-finder-tools.test.ts]
---

# Browse and inspect people

## Intent

The candidate wants to find, prioritize, or understand an existing relationship without changing it.

## Access points

Dashboard Networking workspace; agent `search_gigs_and_people`, `list_people`, `get_person`; CLI `people list|get`.

## Preconditions

Exact detail requires a Person ID. The UI loads the full current people collection at workspace startup.

## Workflow

1. Choose search and supported priority/status/strength filters.
2. The system returns current People in deterministic priority/name order for dashboard presentation or a bounded agent page.
3. Open one Person to inspect name, company, title, LinkedIn URL, relationship type/strength/introducer/notes, priority, status, why-interesting, notes, tags, connection date, profile status, and derived last-contact fields.
4. Agent detail additionally resolves all linked Gig IDs and relationship roles.

## Decisions and variants

The dashboard omits `paused` and `do_not_contact` people entirely. It defaults to high priority and uses four exact lanes: Ready to Reach (`not_contacted`, `outreach_planned`), In Motion (`outreach_sent`, `awaiting_response`, `follow_up_due`), On Calendar (`conversation_scheduled`), and Active Circle (`active_relationship`). “Active tranche” further limits to high/medium priorities and selected active statuses.

## State changes

None.

## Outputs and observable effects

Dashboard metrics count actionable relationships, scheduled conversations, high priorities, and verified profiles. `verified` is derived from presence of the LinkedIn profile URL; `hasProfile` separately reports a linked Person `profile` document. Latest-contact fields derive from the latest completed Interaction rather than editable Person fields.

## Safety rules

Search and opening LinkedIn never update contact status. Exact IDs from results must be used for mutations and links.

## Failure, retry, and recovery

Read failures follow the same dashboard data-fault behavior as Gig reads. Unsupported legacy relationship values produce consistency errors instead of being silently mapped.

## Current limitations

- Paused and do-not-contact people cannot be viewed in the dashboard, even with search/filter changes; agent and CLI reads can retrieve them.
- The dashboard is read-only and has no contact editor.
- Dashboard search covers name, company, title, why-interesting, tags, and relationship text; agent query covers a smaller documented subset.

## Related specifications

- [Maintain a person](maintain-person.md)
- [Record interactions](../interactions/maintain-interaction.md)
