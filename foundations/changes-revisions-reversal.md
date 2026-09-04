---
id: changes-revisions-reversal
title: Atomic changes, revisions, and reversal
summary: Durable writes are audited, atomic, revision-aware, and selectively reversible.
aliases: [atomic write, revision conflict, undo]
---

# Atomic changes, revisions, and reversal

## Scope

Applies to each supported core-record and managed-document mutation. Scout decisions are atomic, but end-to-end promotion coordinates separate Gig, document, and Scout-state mutations; its workflow defines recovery if a later step fails.

## Canonical rule

A durable mutation completes as one audited transaction or leaves no durable product change. Mutable records advance revisions; versioned documents append versions. A dry run returns the projected result without persistence.

## Required behavior

- A change records actor, source, summary, occurrence time, and affected before/after state.
- Optimistic operations reject stale expected revisions or versions.
- Reusing a successful agent change identity with the same creation payload returns the existing creation; conflicting reuse fails.
- Updating a Task to `completed` establishes `completedAt`; moving it away clears `completedAt`.
- Reverting restores eligible recorded before-state only if no later change would be overwritten.

## Prohibited behavior

- Do not retain half of one transactional change, such as an Interaction without its participants or a document without its first version. This does not imply that a multi-transaction Scout promotion cannot stop after its Gig step commits.
- Do not silently overwrite a later record revision or document version.
- Do not claim a dry run or unchanged document update created durable history.

## Failure and retry implications

Validation, missing references, or transaction errors roll back the entire write. After a revision conflict, reload and obtain renewed consent where the effective change differs. An exact retry with the same idempotency identity is safe only under the matching-payload rule.

## Observable consequences

Supported reads expose record revisions or document versions where relevant. Database inspection can verify a single change boundary and complete history. A no-op document content replacement reports `changed: false`, null change ID, and no new version.

## Used by

- [Create or maintain an opportunity](../workflows/opportunities/maintain-opportunity.md)
- [Create or maintain a person](../workflows/networking/maintain-person.md)
- [Create or maintain a task](../workflows/tasks/maintain-task.md)
- [Record or correct an interaction](../workflows/interactions/maintain-interaction.md)
- [Update managed content](../workflows/documents/update-managed-document.md)
- [Revert an agent change](../workflows/agent/revert-change.md)
- [Review and promote Scout positions](../workflows/scout/review-and-promote.md)
