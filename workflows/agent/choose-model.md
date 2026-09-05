---
id: choose-model
capability: conversational-agent
feature: model-selection
title: Choose the agent model
summary: Persist one supported model choice for subsequent agent interactions.
aliases: [change model, agent settings, model picker]
requires: []
related: [use-conversation.md]
implementation_areas: [src/core/application-settings.ts, src/data/settings-store.ts, src/web/client/agent/AgentPanel.tsx]
test_suites: [src/core/test/application-settings.test.ts, src/web/test/client/data/settings.test.ts]
---

# Choose the agent model

## Intent

The candidate wants future agent requests to use a different supported catalog model.

## Access points

Agent-panel model picker.

## Preconditions

Selected ID is exactly `gpt-5.6-sol`, `gpt-5.6-terra`, or `gpt-5.6-luna`.

## Workflow

1. Open agent settings/model control.
2. Choose a catalog entry.
3. Persist the selection; subsequent agent runtime creation uses it.

## Decisions and variants

Unknown model IDs are rejected rather than passed through to a provider. With no persisted setting, the startup default is a valid deployment-provided identifier when configured, otherwise `gpt-5.6-sol`.

## State changes

Updates application setting `agentModel`; it does not alter conversation history.

## Outputs and observable effects

The picker reflects the saved model. Save failure is shown and does not claim the new value is active.

## Safety rules

Only the three exact catalog identifiers may persist.

## Failure, retry, and recovery

Invalid input or storage failure leaves the prior/default choice. Retry after the settings service is available.

## Current limitations

The model setting is global application state rather than per-conversation. Availability at the provider may still fail at request time.

## Related specifications

- [Use the conversational agent](use-conversation.md)
