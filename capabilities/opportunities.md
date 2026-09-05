---
id: opportunities
title: Opportunities
aliases: [Gig, opportunity, pipeline role]
---

# Opportunities

## Purpose and boundary

Lets the candidate track a role from identification through application outcomes, including fit, activity, next action, compensation, availability, source, and related artifacts. People, interactions, tasks, documents, and Scout acquisition retain their own workflow rules.

## Vocabulary

| Term | Meaning here |
|---|---|
| Gig | One durable opportunity record. |
| stage | `identified`, `applied`, `recruiter_contact`, `screening`, `technical_interview`, `final_round`, `offer`, `monitoring`, or `closed`. |
| outcome | `pending` while open; a terminal/non-pending result when closed. |
| availability | Posting observation: `unknown`, `available`, or `unavailable`; separate from stage/outcome. |

## Features

| Feature | Use when | Document |
|---|---|---|
| Opportunity records | Browse, create, or change a Gig and its pipeline details | [Open](../features/opportunities/opportunity-records.md) |
| Posting availability | Understand Scout-observed available/unavailable state and board segmentation | [Open](../features/opportunities/posting-availability.md) |

## Shared foundations

- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)
- [Dates and ordering](../foundations/dates-time-ordering.md)
- [Queries and pagination](../foundations/queries-and-pagination.md)

## Evidence pointers (optional)

- Implementation areas: `src/core/gigs.ts`, `src/core/gig-domain-service.ts`, `src/web/client/App.tsx`, `src/agent/gig-finder-tools.ts`, `src/cli/`
- Test suites: `src/core/test/`, `src/web/e2e/gig-board.e2e.ts`, `src/agent/test/`, `src/cli/test/`
