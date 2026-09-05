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
| profile status | Derived `verified` when a LinkedIn profile URL is present, otherwise `missing`; separate `hasProfile` indicates a linked Person profile document. |

## Features

| Feature | Use when | Document |
|---|---|---|
| People | Browse, create, or update canonical contacts | [Open](../features/networking/people.md) |
| Person–opportunity relationships | Assign a known Person's typed role on a known Gig | [Open](../features/networking/opportunity-relationships.md) |
| Contact recency | Understand latest completed contact projected from Interaction history | [Open](../features/networking/contact-recency.md) |

## Shared foundations

- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)
- [Queries and pagination](../foundations/queries-and-pagination.md)

## Evidence pointers (optional)

- Implementation areas: `src/core/people.ts`, `src/core/services.ts`, `src/core/gig-people.ts`, `src/web/client/NetworkingBoard.tsx`
- Test suites: `src/core/test/people.test.ts`, `src/core/test/read-services.test.ts`, `src/agent/test/`, `src/cli/test/`
