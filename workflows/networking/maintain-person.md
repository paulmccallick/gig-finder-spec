---
id: maintain-person
capability: networking
feature: people
title: Create or maintain a person
summary: Create one canonical contact or update explicit identity and relationship fields.
aliases: [add contact, update person, change relationship status]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md, ../../foundations/agent-consent-and-privacy.md]
related: [browse-people.md, link-person-opportunity.md]
implementation_areas: [src/core/people.ts, src/core/services.ts, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/people.test.ts, src/core/test/input-contracts.test.ts, src/agent/test/gig-finder-tools.test.ts, src/cli/test/cli.test.ts]
---

# Create or maintain a person

## Intent

The candidate wants one canonical relationship record or needs to change its explicit identity, relationship, priority, or workflow status.

## Access points

Agent `create_person`/`update_person`; CLI `people add|update`. The dashboard is read-only.

## Preconditions

Resolve likely duplicates first. Agent creation requires explicit confirmation; update requires an exact Person ID.

## Workflow

1. Search by known company/person names and inspect candidates. Creation also rejects an exact existing LinkedIn profile URL or a case-insensitive trimmed name/company match.
2. Supply the intended fields. Name must be nonblank; LinkedIn URL must be HTTPS under the LinkedIn profile path; calendar dates and enum values validate.
3. Agent updates express ordered set/clear operations; CLI supplies a strict JSON patch.
4. Persist one audited change and return the composed Person.

## Decisions and variants

Core/CLI creation defaults relationship type to `professional_contact`, strength to `unknown`, introducer/relationship notes to null, priority to `unranked`, status to `not_contacted`, why-interesting to null, and notes/tags to empty arrays; agent creation requires all contract fields. Relationship type is any nonblank string. Strength is `strong`, `warm`, `limited`, or `unknown`; priority is `high`, `medium`, `low`, or `unranked`; status is `not_contacted`, `outreach_planned`, `outreach_sent`, `awaiting_response`, `conversation_scheduled`, `active_relationship`, `follow_up_due`, `paused`, or `do_not_contact`. Nested relationship fields merge on update; notes and tags replace as arrays. Nullable identity and relationship fields may be cleared.

## State changes

Creates or advances the Person revision. Derived last-contact fields do not accept direct mutation and change only through completed Interactions. Profile status is also immutable as a direct field but follows whether `linkedInProfileUrl` is present; linked Person-profile documents instead change `hasProfile`.

## Outputs and observable effects

Subsequent reads and dashboard refresh show the new lane/priority. The result includes a change ID for eligible reversal.

## Safety rules

Do not create a duplicate merely because names vary. Do not directly set derived dates, profile status, metadata, or ID. Do not interpret `do_not_contact` as deletion.

## Failure, retry, and recovery

Strict schemas reject unknown/immutable keys. Duplicate change identity with mismatched payload fails. Dry-run leaves no change. Resolve and reload after not-found or consistency failures.

## Current limitations

There is no supported delete-Person operation and no dashboard editor. Deterministic duplicate checks cannot identify a real person whose normalized name/company and LinkedIn URL both differ from the stored record.

## Related specifications

- [Browse people](browse-people.md)
- [Link person and opportunity](link-person-opportunity.md)
