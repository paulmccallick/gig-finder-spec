---
id: {{feature-or-workflow-id}}-{{surface}}
capability: {{capability-id}}
feature: {{owning-feature-id}}
workflow: {{optional relative workflow link}}
surface: {{ui | agent-tool | cli | public-api}}
summary: {{Meaningful surface-specific difference}}
aliases: [{{surface-specific wording}}]
requires: [{{required links}}]
contract: {{optional relative agent-tool schema link}}
---

# {{Behavior}} via {{Surface}}

## Exposure

{{How the actor discovers and invokes this supported surface.}}

## Inputs and validation

{{Surface inputs, defaults, validation, and rejected behavior.}}

## Interaction sequence

{{Only surface-specific ordering requirements.}}

## Outputs or presentation

{{How the shared outcome appears.}}

## Confirmation and authorization

{{Surface-specific consent and authorization.}}

## Surface-specific failures

{{Unique failures and visible/retry behavior.}}

## Refresh and consistency

{{When the surface reflects durable changes and stale-state behavior.}}

## Current limitations

{{Observed surface-only limitations.}}

## Shared specification

[Owning feature]({{relative feature link}})
