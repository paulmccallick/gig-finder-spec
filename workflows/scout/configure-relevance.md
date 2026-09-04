---
id: configure-relevance
capability: gig-scout
title: Configure Scout relevance screening
summary: Save versioned technology-role relevance criteria and a confidence threshold.
aliases: [Scout criteria, relevance settings, screening threshold]
requires: []
related: [run-scout.md, review-and-promote.md]
implementation_areas: [src/core/scout/engine/scout-position-service.ts, src/agent/scout-position-screening.ts, src/web/client/ScoutPositionReview.tsx]
test_suites: [src/core/scout/engine/test/scout-position-service.test.ts, src/agent/test/scout-position-screening.test.ts]
---

# Configure Scout relevance screening

## Intent

The candidate wants future Scout position processing to use explicit relevance criteria and threshold.

## Access points

Gig Scout Positions view relevance settings.

## Preconditions

Scout position service is available; criteria and confidence threshold pass current validation.

## Workflow

1. Load the current criteria, threshold, and version.
2. Edit criteria and threshold.
3. Save a new configuration version.
4. Future queued processing binds its configuration snapshot/version; existing durable evaluation history remains.

## Decisions and variants

Relevance screening decides narrow technology-role relevance only. Candidate match is a separate evaluation using profile context and the exact description version.

## State changes

Adds/activates a relevance configuration version; does not rescore existing positions by itself.

## Outputs and observable effects

The UI reports the saved version or a failure message.

## Safety rules

Do not reinterpret relevance as candidate fit. Durable processing must retain its bound configuration even if settings later change.

## Failure, retry, and recovery

Invalid or unavailable settings fail without activation. Correct and save again.

## Known current behavior and limitations

The UI copy labels the criteria specifically for technology-role relevance. There is no general public API contract for this setting.

## Related workflows

- [Run Scout](run-scout.md)
