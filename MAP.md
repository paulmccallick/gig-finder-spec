# Documentation Map

Start with the [application overview](APPLICATION.md) if you are new to GigFinder. Then choose the document that matches your question. Load implementation details only when you need them.

## Capabilities

| To understand or change… | Read |
|---|---|
| How the candidate finds suitable roles at configured companies | [Gig Scout](capabilities/gig-scout.md) |
| How roles, applications, interview progress, and outcomes are tracked | [Opportunities](capabilities/opportunities.md) |
| How contacts, their interactions, and their optional connections to roles are tracked | [Networking](capabilities/networking.md) |
| How work is prioritized, scheduled, and marked complete | [Tasks](capabilities/tasks.md) |
| How documents are saved/revised and candidate information is supplied | [Documents and profile](capabilities/documents-profile.md) |
| How the assistant answers questions and changes saved information | [Conversational agent](capabilities/conversational-agent.md) |

Each capability links to its detailed workflows, domain objects, interfaces, and implementation documents.

## End-to-End Workflows

- [Search configured companies for relevant positions](workflows/gig-scout-discovery.md).
- [Evaluate positions and decide which to pursue](workflows/gig-scout-review-processing.md).
- [Choose whether a posting belongs to a new or existing opportunity](workflows/opportunities-posting-resolution.md).
- [Save, read, and revise supporting documents](workflows/documents-profile-maintenance.md).
- [Ask the assistant for help and handle an interrupted response](workflows/conversational-agent-turn.md).
- [Record or correct a conversation with a contact](workflows/interactions-contact-history.md).

## Shared Concepts and Rules

- [Domain model](domain/model.md): how roles, people, tasks, interactions, and documents relate; links to each detailed object description.
- [Glossary](domain/terminology.md): application terms in plain language.
- [Shared quality constraints](requirements/global-nfrs.md): which data-protection and consistency guarantees are documented, and which service targets are unspecified.
- [Security and privacy](requirements/security.md): who can access data and where private information can go.
- [Reliability](requirements/reliability.md): what remains saved after failures and the limits of recovery.

## Implementation and Operation

- [Interface guide](interfaces/README.md): browser, HTTP, command-line, and agent-tool operations, with links to each detailed contract.
- [Architecture overview](architecture/overview.md): components and code entry points, with links to each capability's implementation.
- [Persistence](architecture/persistence.md): database writes, revisions, document versions, and file storage.
- [Deployment](operations/deployment.md): building, configuring, and replacing the running application.
- [Observability](operations/observability.md): using health responses and logs to investigate problems.
- [Recovery](operations/recovery.md): database maintenance, backups, and restore limits.
- [Architectural decisions](decisions/README.md): all 17 original ADRs, indexed by the choice they explain and linked to the current implementation. Load these when investigating why an approach was chosen or reconsidering it.

## Maintaining This Documentation

The [authoring instructions](AGENTS.md) describe how to update this repository. Use source links to verify behavior, and report disagreements between code and documentation. Do not treat an implementation setting as a new product requirement. Historical plans in the code repository are background material, not evidence that a feature currently works that way.

All supporting documents must have clickable links from the documents that introduce them. [README](README.md) explains how to run the documentation checks.
