---
id: {{stable-model-id}}
capability: {{capability-id}}
feature: {{owning-feature-id}}
title: {{Operational model name}}
summary: {{One-sentence operational scope}}
elements: [{{only applicable registered elements}}]
requires: [{{shared foundations or indispensable feature links}}]
implementation_areas: [{{optional coarse paths}}]
test_suites: [{{optional suite-level paths or commands}}]
---

# {{Operational model}}

## Purpose and boundary

{{Why this feature qualifies and which operational behavior this model owns.}}

## Governing invariants

{{Invariants spanning the declared structural elements.}}

<!-- Include only headings declared by elements; delete every unused section. -->

## Work levels and coordination

{{Independently durable work levels and ownership boundaries.}}

## Configuration binding

{{Snapshot/reference timing and effect of later edits.}}

## State models

| State | Entered when | Leaves when |
|---|---|---|
| {{complete vocabulary}} | {{entry condition}} | {{terminal or permitted transition}} |

## Completion and aggregation

{{Terminal inputs and exact derived completion/status rules.}}

## Retry, replay, and reconciliation

{{Retry, replay, redelivery, partial-state repair, and idempotency semantics.}}

## Concurrency and ordering

{{Bounds and ordering guarantees/non-guarantees.}}

## External-source trust

{{Validation, ambiguity, empty-result, and source-failure rules.}}

## Durable evidence and observability

{{Durable evidence, actor-visible diagnostics, and inspection outcomes.}}

## Bounds and limits

{{Configured and hard operational bounds.}}
