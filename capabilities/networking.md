---
id: networking
title: Networking
aliases: [Person, contact, relationship]
---

# Networking

## Purpose and boundary

Lets the candidate maintain canonical people, relationship state, and typed links to opportunities. Actual contact events are Interactions; follow-up commitments are Tasks.

## Vocabulary

| Term | Meaning here |
|---|---|
| Person | Canonical contact with identity and relationship fields. |
| status | Outreach/relationship lane, including paused and do-not-contact. |
| profile status | Derived `verified` when a Person profile document exists, otherwise `missing`. |

## Workflows

| Workflow | Use when | Document |
|---|---|---|
| Browse people | Find and inspect contacts | [Open](../workflows/networking/browse-people.md) |
| Maintain a person | Create or update a contact | [Open](../workflows/networking/maintain-person.md) |
| Link person and opportunity | Assign a person's role on a Gig | [Open](../workflows/networking/link-person-opportunity.md) |

## Shared foundations

- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)
- [Queries and pagination](../foundations/queries-and-pagination.md)

## Evidence pointers (optional)

- Implementation areas: `src/core/people.ts`, `src/core/services.ts`, `src/core/gig-people.ts`, `src/web/client/NetworkingBoard.tsx`
- Test suites: `src/core/test/people.test.ts`, `src/core/test/read-services.test.ts`, `src/agent/test/`, `src/cli/test/`
