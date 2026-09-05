---
id: opportunity-relationships
capability: networking
title: Person–opportunity relationships
summary: Record a typed role connecting one exact Person and Gig.
aliases: [Gig contact, opportunity relationship, recruiter link]
requires: [../../foundations/identity-and-references.md, ../../foundations/changes-revisions-reversal.md]
workflows: [../../workflows/networking/link-person-opportunity.md]
operational_models: []
quality_scenarios: []
variants: []
contracts: [../../contracts/operations/list_gig_person_relationships.schema.json, ../../contracts/operations/get_gig_person_relationship.schema.json, ../../contracts/operations/create_gig_person_relationship.schema.json]
implementation_areas: [src/core/gig-people.ts, src/core/services.ts, src/agent/gig-finder-tools.ts, src/cli]
test_suites: [src/core/test/read-services.test.ts, src/agent/test/gig-finder-tools.test.ts]
---

# Person–opportunity relationships

## Product role

Owns the durable statement that one exact Person plays a typed role for one exact opportunity. It supplies opportunity-specific networking context without duplicating the Person or folding relationship ownership into either record.

## Feature set

| Constituent behavior | Implemented outcome |
|---|---|
| Typed relationship creation | Links one existing Person and Gig with one supported role and optional context. |
| Pair uniqueness | Prevents duplicate records for the same Person, Gig, and role identity. |
| Relationship retrieval | Lists and reads typed links from the relevant opportunity or person context. |
| Audit participation | Records creation as an eligible reversible change with an exact inverse. |

## Purpose and boundary

This feature gives a known Person one explicit role relative to a known Gig without rewriting either parent. It does not infer a role from title/employer and does not replace Interactions or Person-wide relationship context.

## Access points

Agent tools list/get/create relationships. The supported CLI accepts `gig-people add`, although printed usage omits it. No dashboard control creates or edits these records.

## Configuration and defaults

There is no user configuration. Relationship values are `interviewer`, `hiring_manager`, `recruiter`, `recruiting_coordinator`, `employee`, `former_peer`, `professional_contact`, or `personal_contact`; notes are optional.

## Durable state and lifecycle

Creation produces an independent durable ID and revision 1. The same parent pair may have separate records for different relationship roles. Parent revisions do not change.

## Validation and invariants

Both exact parents must exist and the relationship value must be defined. The active `(Gig, Person, relationship role)` triple is unique; an identical active triple is rejected while a different role for the same parents is allowed. Agent creation requires confirmation. Conflicting idempotency replay and missing parents fail atomically.

## Outputs and downstream effects

Relationship queries filter by Gig, Person, or role. Agent Person detail composes linked Gig IDs and roles. No pipeline/contact state changes follow automatically.

## Failure, retry, and recovery

Resolve both parents again after not-found. Unsupported persisted values surface as consistency errors rather than being mapped. A duplicate triple fails without another record. Retry uncertain creation only after listing current relationships.

## Current limitations

There is no supported update or delete. The CLI command is implemented but undiscoverable in printed help.

## Detailed specifications

- [Link a person to an opportunity](../../workflows/networking/link-person-opportunity.md)
