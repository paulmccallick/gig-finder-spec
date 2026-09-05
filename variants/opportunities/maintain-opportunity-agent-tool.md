---
id: create-opportunity-agent-tool
capability: opportunities
feature: opportunity-records
workflow: ../../workflows/opportunities/maintain-opportunity.md
surface: agent-tool
summary: Agent creation is a complete-object confirmed operation with runtime-supplied idempotency.
aliases: [create_gig, add Gig]
requires: [../../workflows/opportunities/maintain-opportunity.md]
contract: ../../contracts/operations/create_gig.schema.json
---

# Create an opportunity via Agent tool

## Exposure

Conversation tool `create_gig`.

## Inputs and validation

Use the exact [create schema](../../contracts/operations/create_gig.schema.json). The contract file is an `input`/`result` characterization envelope, not the literal tool invocation envelope: the runtime sends only its `input`. Create requires every field. JSON Schema cannot express all Zod refinements, so the shared workflow's domain-validation rules remain required.

## Interaction sequence

Resolve duplicates, summarize friendly intended effect, confirm, execute once, and confirm result.

## Outputs or presentation

Success includes `status: ok`, the complete current `record`, and a non-null `changeId`. Source code declares strict input schemas but no equally strict output schema; the contract therefore fixes status families while the workflow/core entity definition governs record meaning.

## Confirmation and authorization

Explicit user confirmation is required.

## Surface-specific failures

Strict unknown/missing fields fail before execution; runtime domain refinements may reject otherwise schema-valid combinations.

## Refresh and consistency

Successful change output triggers dashboard collection reload.

## Current limitations

Availability is not exposed; create input is intentionally verbose.

## Shared specification

[Canonical behavior](../../workflows/opportunities/maintain-opportunity.md)
