---
id: model-selection
capability: conversational-agent
title: Agent model selection
summary: Persist one supported global model choice for subsequent conversations.
aliases: [model picker, agent settings, change model]
requires: []
workflows: [../../workflows/agent/choose-model.md]
operational_models: []
quality_scenarios: []
variants: []
contracts: []
implementation_areas: [src/core/application-settings.ts, src/data/settings-store.ts, src/web/client/agent]
test_suites: [src/core/test/application-settings.test.ts, src/web/test/client/data/settings.test.ts]
---

# Agent model selection

## Product role

Owns the one global model identity used for subsequent GigFinder conversations. It provides a stable supported choice and deterministic default/override precedence without becoming part of an individual conversation's history or content.

## Feature set

| Constituent behavior | Implemented outcome |
|---|---|
| Supported catalog | Exposes the exact Sol, Terra, and Luna identifiers accepted by the application. |
| Global persistence | Saves one supported identifier as the candidate-wide selection. |
| Runtime resolution | Resolves deployment override, persisted choice, and Sol default in exact precedence order. |
| Selection validation | Rejects unknown identifiers without changing the prior effective model. |

## Purpose and boundary

Model selection chooses which compiled supported model subsequent agent runtimes request. It does not alter existing conversations or guarantee provider availability.

## Access points

The agent-panel model picker reads and writes the setting.

## Configuration and defaults

The exact accepted identifiers are `gpt-5.6-sol`, `gpt-5.6-terra`, and `gpt-5.6-luna`; labels are GPT-5.6 Sol, GPT-5.6 Terra, and GPT-5.6 Luna. The compiled default is `gpt-5.6-sol`. At startup a valid deployment-provided default replaces the compiled fallback only while no persisted selection exists; after a selection is saved, the persisted identifier wins.

## Durable state and lifecycle

One global application setting stores the selected identifier. New agent requests read it when creating runtime behavior. Conversation records do not snapshot or display a per-turn setting through this feature.

## Validation and invariants

Only exact catalog IDs persist. Unknown IDs are rejected rather than forwarded to a provider.

## Outputs and downstream effects

The picker reflects the saved selection; subsequent requests use it. Provider-side unavailability may still fail at request time.

## Failure, retry, and recovery

Invalid input or storage failure leaves the previous/default selection and shows failure. Retry after settings storage is available.

## Current limitations

Selection is application-global, not per conversation or user.

## Detailed specifications

- [Choose the agent model](../../workflows/agent/choose-model.md)
