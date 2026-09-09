---
type: application
scope: gig-finder
summary: Understand application purpose, actors, boundaries, and capabilities.
load_when:
  - Understand application purpose, actors, boundaries, and capabilities.
related:
  - domain/model.md
  - architecture/overview.md
  - interfaces/README.md
---

# Application

## Purpose

GigFinder helps a job seeker manage an opportunity pipeline, professional relationships, follow-up work, application documents, and discovery of potential roles. A conversational assistant operates on the same records used by the browser boards and CLI.

## Users

- A job seeker reviews information, makes decisions, and requests changes.
- The conversational agent reads context and invokes domain tools on the user's behalf.
- Scout workers discover and evaluate positions using configured company sources and candidate context.
- An operator configures local state, credentials, deployment, and recovery.

The application has one configured context and actor; it does not implement user accounts or tenant separation.

## Scope

Store and relate job-search records; maintain document versions and supported change history; present boards; conduct conversations; discover and screen positions before review and promotion into the tracked pipeline.

## Out of Scope

The inspected application does not submit applications to employers, send email or LinkedIn messages, synchronize a calendar, or provide an employer-facing applicant tracking system. A recorded application, interaction, or task describes activity; it does not perform the external activity. Authentication and network access control are not application capabilities.

## Major Capabilities

| Capability | Responsibility |
|---|---|
| [Opportunities](capabilities/opportunities.md) | Track Gigs, pipeline progress, availability, fit, and posting identity. |
| [Networking](capabilities/networking.md) | Track people, their relationship to the candidate and to Gigs, and derived contact recency. |
| [Tasks](capabilities/tasks.md) | Track commitments, priorities, due dates, and completion. |
| [Interactions](capabilities/interactions.md) | Record communications, meetings, interviews, and participants. |
| [Documents and profile](capabilities/documents-profile.md) | Maintain authoritative documents and supply candidate context. |
| [Conversational agent](capabilities/conversational-agent.md) | Work through conversation, tools, document context, and supported reversal. |
| [Gig Scout](capabilities/gig-scout.md) | Discover positions, process descriptions, screen, review, and promote. |

## System Context

Browser and CLI operate against a configured local application context. The server connects to a model provider for conversation and Scout evaluation and to employer/ATS sources for discovery. Local files supply candidate context and provider credentials. Deployment uses Docker images published through GitHub Actions and GHCR; runtime state lives outside the image.

## Key Terminology

A **Gig** is a tracked opportunity. A **Scout position** is a discovered posting that may become associated with a Gig. A **managed document** has a durable identity and versioned content. A **change** groups supported domain mutations for audit and possible reversal. See the [glossary](domain/terminology.md) and [domain model](domain/model.md).

## Evidence and Currency

Written from code checkout `3dca919a98d25a33cf7f0bf0c6738a1c03944584`, inspected on 2026-09-09. Code-repository documentation was used only where verified against implementation. Older application documentation in the spec repository was excluded as source material. Implementation references are in the [architecture overview](architecture/overview.md) and capability interface/architecture documents. This is source inspection, not a claim that production was exercised.
