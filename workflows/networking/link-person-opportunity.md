---
id: link-person-opportunity
capability: networking
title: Link a person to an opportunity
summary: Record one typed role connecting an exact Person and Gig.
aliases: [add recruiter to gig, gig contact, opportunity relationship]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md]
related: [browse-people.md, ../opportunities/browse-opportunities.md]
implementation_areas: [src/core/gig-people.ts, src/core/services.ts, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/read-services.test.ts, src/agent/test/gig-finder-tools.test.ts]
---

# Link a person to an opportunity

## Intent

The candidate wants to record how a known contact relates to a known opportunity.

## Access points

Agent `list/get_gig_person_relationship` and `create_gig_person_relationship`; CLI creation through `gig-people add` (the command is accepted though omitted from the printed usage).

## Preconditions

Exact existing Gig and Person IDs and a relationship value: `interviewer`, `hiring_manager`, `recruiter`, `recruiting_coordinator`, `employee`, `former_peer`, `professional_contact`, or `personal_contact`. Agent creation requires explicit confirmation.

## Workflow

1. Resolve both records and inspect existing relationships.
2. Choose one typed role and optional notes.
3. Create one auditable relationship with a durable relationship ID.
4. Retrieve it by ID or list by Gig, Person, or role.

## Decisions and variants

The same Person/Gig pair is not presented as a general update workflow; separate relationship records are identified independently. Unsupported persisted relationship values surface as consistency errors.

## State changes

One Gig-Person Relationship is created at revision 1. Neither parent record is rewritten.

## Outputs and observable effects

Agent Person detail includes linked Gig IDs/roles. Relationship list results are page-bounded and retain both exact parent IDs.

## Safety rules

Both references must exist. Do not infer role from a person's title. Do not create the relationship before agent confirmation.

## Failure, retry, and recovery

Missing parents, invalid role, or conflicting replay fail atomically. Re-resolve exact parents before retry.

## Known current behavior and limitations

No supported relationship update/delete operation exists. The CLI accepts creation but its help text does not advertise the `gig-people add` command.

## Related workflows

- [Browse people](browse-people.md)
- [Browse opportunities](../opportunities/browse-opportunities.md)
