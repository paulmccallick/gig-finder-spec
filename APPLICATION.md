---
type: application
scope: gig-finder
summary: How GigFinder helps a candidate find roles and organize their job search.
load_when:
  - learning what GigFinder does
  - choosing which capability to read
---

# GigFinder

## Purpose

GigFinder helps a job seeker find suitable roles and keep track of the work involved in pursuing them. It brings together job postings, application progress, professional contacts, conversations with those contacts, to-do items, and supporting documents.

The candidate can review boards or ask the assistant for help using the information they have saved. Gig Scout searches configured companies for positions to consider; the candidate decides which ones to add to their opportunity list.

## Users

The main user is the candidate conducting a job search. They choose roles to pursue, record progress, maintain relationships, and ask the assistant to read or update their information.

The conversational assistant can act on those requests through supported application commands. Scout performs background searches and evaluates postings. An operator sets up the application, company sources, candidate information, credentials, and backups. One person may be both candidate and operator.

The application uses one set of job-search data. It has no separate user accounts or permissions for different candidates.

## Scope

GigFinder helps answer these questions:

- Which roles are worth looking at, and which ones am I pursuing?
- Where does each application stand, and what is my next step?
- Whom do I know at a company, and when did I last speak with them?
- What happened in an email exchange, call, meeting, or interview?
- What work is due, and which documents support it?

The boards show saved information. The assistant and command-line interface provide many of the editing operations; Scout has its own search and review controls. The [interface guide](interfaces/README.md) explains what is available through each route.

## Out of Scope

GigFinder records job-search activity but does not submit applications, send emails or LinkedIn messages, or create calendar invitations. Opening a posting link takes the candidate to the external posting; it does not apply or update application progress automatically.

Scout searches the company sources configured for the application. It does not search every employer or the entire web.

## Major Capabilities

| Capability | What it helps the candidate do |
|---|---|
| [Gig Scout](capabilities/gig-scout.md) | Find relevant positions across all active configured companies, review job descriptions and fit assessments, and choose roles to pursue. |
| [Opportunities](capabilities/opportunities.md) | Track roles from initial interest through applications, interviews, and outcomes; keep fit assessments, posting links, and next actions together. |
| [Networking](capabilities/networking.md) | Keep track of professional contacts, record interactions, prioritize outreach, and optionally connect people to roles they can help with. |
| [Tasks](capabilities/tasks.md) | Keep a prioritized list of work, such as following up with a contact or preparing for an interview, with due dates and completion status. |
| [Documents and profile](capabilities/documents-profile.md) | Save and revise supporting documents, attach them to roles or people, and give the assistant information about the candidate. |
| [Conversational agent](capabilities/conversational-agent.md) | Ask for job-search advice using saved information and request supported changes in conversation. |

## System Context

The browser and command-line interface use the same application data. The server reads candidate information and saved records, calls an external AI provider for conversation and Scout evaluations, and retrieves postings from configured employer career sites or their recruiting systems.

Application data and credentials live outside the deployed software image. The [architecture overview](architecture/overview.md) explains how the components connect and links to deployment and data-storage details.

## Key Terminology

A **Gig** is a role the candidate tracks. A **Scout position** is a discovered posting that the candidate has not necessarily chosen to pursue. A **managed document** is saved text with a stable ID and readable earlier versions. See the [domain model](domain/model.md) for how records relate and the [glossary](domain/terminology.md) for other application terms.

## Evidence and Currency

Checked against source revision `5fc45b3634316f7c8d46690a6a268950d623a781` on 2026-09-29. Source links use the published [implementation revision](https://github.com/paulmccallick/gig-finder/tree/3dca919a98d25a33cf7f0bf0c6738a1c03944584), whose runtime, configuration, scripts, and tests are identical to the audit baseline; only migration design/plan documents differ. Supporting interface and architecture documents link to the implementation behind their claims. Legacy documentation supplies discovery leads; source and tests establish current behavior. This describes the audited source revision, not a verified running production instance.

## Related documents

- [Domain Model](domain/model.md)
- [Glossary](domain/terminology.md)
- [Architecture Overview](architecture/overview.md)
- [Interface Guide](interfaces/README.md)
