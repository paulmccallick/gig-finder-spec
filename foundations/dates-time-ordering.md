---
id: dates-time-ordering
title: Dates, time, and ordering
summary: Calendar dates and instants have distinct validation and visible ordering rules.
aliases: [Pacific date, due date, timestamp]
---

# Dates, time, and ordering

## Scope

Applies to Gig activity/action dates, Person connection dates, Task dates, Interaction timestamps, UI overdue calculations, and Scout event times.

## Canonical rule

Calendar fields use valid `YYYY-MM-DD` values. Interaction instants use ISO 8601 timestamps with an explicit offset; optional timezone names use valid IANA identifiers. Dashboard `today` and CLI default mutation dates are evaluated in America/Los_Angeles.

## Required behavior

- A Gig or Task is overdue only when it has a due date before today and remains actionable.
- Task ordering is overdue, due today, other dated, then undated; ties use due date, priority, title, then stable ID where applicable.
- Interaction list ordering is newest start first, then ID.
- An Interaction end cannot precede its start.

## Prohibited behavior

- Do not accept impossible calendar dates or offset-free Interaction timestamps.
- Do not label completed or canceled tasks overdue.

## Failure and retry implications

Malformed values fail validation without persistence. Retry with an explicit valid value; do not reinterpret an ambiguous local time.

## Observable consequences

UI metrics and ordering change at the Pacific calendar boundary. Stored Interaction instants preserve their supplied offset string while comparisons use the represented instant.

## Used by

- [Opportunity records](../features/opportunities/opportunity-records.md)
- [Posting availability](../features/opportunities/posting-availability.md)
- [Contact recency](../features/networking/contact-recency.md)
- [Task tracking](../features/tasks/task-tracking.md)
- [Interaction history](../features/interactions/interaction-history.md)
