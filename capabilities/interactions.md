---
id: interactions
title: Interactions
aliases: [contact event, meeting, message]
---

# Interactions

## Purpose and boundary

Lets the candidate record planned or completed communications involving one or more People and optionally a Gig. Person last-contact fields are derived from these records.

## Vocabulary

| Term | Meaning here |
|---|---|
| Interaction | A message, call, meeting, interview, conversation, or other contact event. |
| participant | A unique existing Person linked to the Interaction. |
| supersedes | Marks a correction chain without erasing the prior Interaction. |

## Features

| Feature | Use when | Document |
|---|---|---|
| Interaction history | Search, record, correct, supersede, or soft-delete contact events | [Open](../features/interactions/interaction-history.md) |

## Shared foundations

- [Identity and references](../foundations/identity-and-references.md)
- [Atomic changes](../foundations/changes-revisions-reversal.md)
- [Dates and ordering](../foundations/dates-time-ordering.md)

## Evidence pointers (optional)

- Implementation areas: `src/core/interactions.ts`, `src/core/interaction-service.ts`, `src/agent/gig-finder-tools.ts`, `src/cli/`
- Test suites: `src/core/test/`, `src/data/test/store.test.ts`, `src/agent/test/`, `src/cli/test/`
