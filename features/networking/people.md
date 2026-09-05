---
id: people
capability: networking
title: People
summary: Maintain canonical contacts, relationship context, priority, and outreach status.
aliases: [Person, contact, network record]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md]
workflows: [../../workflows/networking/browse-people.md, ../../workflows/networking/maintain-person.md]
operational_models: []
quality_scenarios: []
variants: []
contracts: [../../contracts/operations/search_gigs_and_people.schema.json, ../../contracts/operations/list_people.schema.json, ../../contracts/operations/get_person.schema.json, ../../contracts/operations/create_person.schema.json, ../../contracts/operations/update_person.schema.json]
implementation_areas: [src/core/people.ts, src/core/services.ts, src/web/client/NetworkingBoard.tsx, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/people.test.ts, src/core/test/read-services.test.ts, src/agent/test, src/cli/test]
---

# People

## Purpose and boundary

A Person is the canonical durable contact record. It owns identity, employer/title, relationship type/strength/introducer/notes, priority, outreach status, why-interesting, notes/tags, and connection date. Opportunity roles are separate relationship records; contact events are Interactions; profile status and last-contact fields are derived.

## Access points

The dashboard browses/details People but does not edit. Strict agent tools and the supported CLI search, read, create, and update them.

## Configuration and defaults

Core/CLI creation defaults relationship type to `professional_contact`, strength to `unknown`, introducer and relationship notes to null, priority to `unranked`, status to `not_contacted`, why-interesting to null, and notes/tags to empty arrays. Strict agent creation requires every declared field. Relationship type is any nonblank string; strengths are `strong`, `warm`, `limited`, and `unknown`; priorities are `high`, `medium`, `low`, and `unranked`; statuses are `not_contacted`, `outreach_planned`, `outreach_sent`, `awaiting_response`, `conversation_scheduled`, `active_relationship`, `follow_up_due`, `paused`, and `do_not_contact`. The dashboard initially filters to high priority and omits paused/do-not-contact records before user filtering.

## Durable state and lifecycle

Creation establishes revision 1; every successful supported update appends audit history and advances revision. Relationship/outreach status changes do not delete the Person. Completed Interactions derive latest-contact values. Profile status is `verified` when a LinkedIn profile URL is present and `missing` otherwise; separate `hasProfile` is true when a Person `profile` document is linked.

## Validation and invariants

Name is nonblank; URL/date/enum fields validate; unknown and immutable keys are rejected. ID, metadata, derived contact fields, and profile status are not mutable. Creation rejects an existing exact LinkedIn profile URL or an existing case-insensitive trimmed name/company pair. The LinkedIn URL, when present, must use HTTPS and the LinkedIn profile path. Other real-world variations can evade these deterministic keys, so callers should search first.

## Outputs and downstream effects

Reads compose the Person with derived contact/profile values and, for agent detail, linked Gig identities/roles. Dashboard lanes map `not_contacted`/`outreach_planned` to Ready to Reach, `outreach_sent`/`awaiting_response`/`follow_up_due` to In Motion, `conversation_scheduled` to On Calendar, and `active_relationship` to Active Circle; `paused` and `do_not_contact` are omitted. Metrics derive from status, priority, and profile state. Exact Person IDs support Tasks, Interactions, documents, and Gig relationships.

## Failure, retry, and recovery

Invalid input and conflicting replay fail without partial change. Missing IDs return not-found. Reread after consistency/conflict failures; CLI dry-run validates without persistence.

## Current limitations

There is no supported Person deletion or dashboard editor. Paused and do-not-contact People are inaccessible in the dashboard but remain readable through agent and CLI. Duplicate real people can still exist when names, companies, or profile URLs differ beyond the enforced keys.

## Detailed specifications

- [Browse and inspect people](../../workflows/networking/browse-people.md)
- [Create or maintain a person](../../workflows/networking/maintain-person.md)
- [Derived contact recency](contact-recency.md)
