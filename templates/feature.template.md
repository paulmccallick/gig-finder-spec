---
id: {{stable-feature-id}}
capability: {{capability-id}}
title: {{User-recognizable feature name}}
summary: {{One-sentence implemented outcome}}
aliases: [{{user phrase}}, {{synonym}}]
requires: [{{foundation or indispensable feature links}}]
workflows: [{{actor-sequence links, or empty}}]
operational_models: [{{qualifying model links, or empty}}]
quality_scenarios: [{{qualifying scenario links, or empty}}]
variants: [{{meaningful surface-variant links, or empty}}]
contracts: [{{strict agent-tool schema links, or empty}}]
implementation_areas: [{{optional coarse paths}}]
test_suites: [{{optional suite-level paths or commands}}]
---

# {{Feature}}

## Product role

{{Distinct product responsibility, actor or downstream behavior served, and why this is a feature rather than a workflow step or implementation component.}}

## Feature set

| Constituent behavior | Implemented outcome |
|---|---|
| {{product behavior}} | {{observable or durable outcome}} |

## Purpose and boundary

{{Implemented functional boundary and user-recognizable outcome.}}

## Access points

{{Supported UI, agent tool, CLI, or public API. Say when no direct access exists.}}

## Configuration and defaults

{{Material configuration, snapshots, defaults, and hard bounds. State when none exist.}}

## Durable state and lifecycle

{{Created/updated/retained state, lifecycle, and transient state that affects behavior.}}

## Validation and invariants

{{Accepted/rejected inputs, ownership, consistency, idempotency, and prohibited effects.}}

## Outputs and downstream effects

{{Actor-observable outputs and effects on other features.}}

<!-- Include only when operational_models is nonempty. -->
## Operational Model

{{Link each qualifying model and name the product-operational complexity it specifies without duplicating it.}}

<!-- Include only when quality_scenarios is nonempty. -->
## Nonfunctional Requirements

| Classification | Implemented constraint | Scenario |
|---|---|---|
| {{classification}} | {{concrete objectively testable constraint}} | [{{scenario}}]({{relative path}}) |

## Failure, retry, and recovery

{{Visible failure, durable state after failure, safe retry, and recovery.}}

## Current limitations

{{Observed defects and unsupported cases, neutrally stated.}}

## Detailed specifications

{{Links grouped only as needed: workflows, Operational Models, Quality Scenarios, variants, contracts. Say “None” for an empty group only when useful.}}
