---
type: architecture
scope: persistence
summary: Where data is stored and which writes, versions, and restores belong together.
load_when:
  - where data is stored and which writes, versions, and restores belong together
---

# Persistence

## What Is Stored Where

| Storage | Contents |
|---|---|
| Application SQLite database | Gigs, people, relationships, tasks, interactions, change history, managed documents and versions, conversations, settings, and Scout records. |
| Two Scout queue databases | Jobs waiting for company searches and position processing. These are separate from the application database. |
| Scout description directory | Retrieved descriptions stored as files, with their identities and source details in the database. |
| Candidate profile JSON | Structured candidate information loaded from configuration. |
| Managed candidate-document files | Copies written from saved database content. Editing a copy does not edit the document in the application. |

The [context resolver](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/context.ts) chooses paths. See [document storage](documents-profile.md) and [Scout storage](gig-scout.md) for their detailed formats and responsibilities.

## Saving a Domain Change

For supported records, `DataStore.change` creates a change-history entry and applies the associated writes in one SQLite transaction. A transaction saves all of those writes together or rolls them back together. Previous record contents go into history tables, and each updated record receives the next revision number. See [change execution](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/changes.ts), [transaction implementation](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/store.ts), and [database schema](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/schema.ts).

At the storage layer, updates compare an expected revision with the current record. Ordinary Gig, Person, Task, and Interaction update services obtain that revision by reading the record internally. This protects the interval between the service's read and write; it does not tell the service whether the user's earlier view was outdated. Some interfaces instead require the caller to supply a version or revision, such as document updates and interaction deletion. The [interface guide](../interfaces/README.md) links to those contracts.

Supported deletions mark a record deleted and retain history. Reverting an eligible change creates another recorded change; it checks for later edits and dependent records before restoring earlier data. The [conversation implementation](conversational-agent.md) describes the undo tool and its limits.

## Separate Save Boundaries

Document versions, conversation turns, settings, Scout records, queue jobs, and files do not all share one transaction. For example, a tool can commit an update before its conversation is saved, and a Scout promotion can create a Gig before its job description has finished saving. Each owning implementation documents how it handles partial completion: [conversations](conversational-agent.md), [documents](documents-profile.md), and [Scout](gig-scout.md).

For managed candidate documents, a failed file-copy write after a database commit is reported and left for retry. Opening the local application rewrites these copies from database content; a failure during that startup synchronization can prevent the application from opening. See [local application startup](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/local-application.ts) and [document persistence](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/document-store.ts).

## Database Opening and Scale

[Database opening](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/database.ts) enables foreign-key checks and a 5,000 ms wait for database locks. Normal startup opens an existing database; creation and migration are explicit [maintenance operations](../operations/recovery.md). The lock wait is an implementation setting, not a promise about request response time.

The supplied deployment uses local SQLite files. The source does not establish a replicated database or coordinated multi-server deployment. Database backup and restore cover the application database, not all queues and external files; see [recovery](../operations/recovery.md).

## Related Documentation

[Reliability guarantees](../requirements/reliability.md) explains the effects visible to callers. [Architectural decisions](../decisions/README.md) records why revisioned changes and external runtime state were chosen.

## Reading the Earlier Decisions

[ADR 0005](../decisions/0005-revisioned-audited-change-transactions.md) uses broad language about mutable rows. Its revision/history contract applies to the supported audited domain records described here; settings, conversations, managed documents, and Scout state do not all use that same contract. The original ADR wording is retained as recorded rationale.

## Related ADRs

- [ADR 0005: Store mutations as revisioned, audited transactions](../decisions/0005-revisioned-audited-change-transactions.md)
- [ADR 0006: Make database document state authoritative](../decisions/0006-authoritative-document-state.md)
- [ADR 0016: Mutate domain-owned tables through the owning domain service](../decisions/0016-own-domain-table-mutations.md)

## Related documents

- [Reliability and Consistency](../requirements/reliability.md)
- [Recovery and Maintenance](../operations/recovery.md)
- [Architectural Decisions](../decisions/README.md)
