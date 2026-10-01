---
type: architecture
scope: persistence
summary: Investigate transactions, versions, storage, and recovery boundaries.
load_when:
  - Investigate transactions, versions, storage, and recovery boundaries.
related:
  - requirements/reliability.md
  - operations/recovery.md
  - decisions/README.md
---

# Persistence

## Components

The application database contains domain records, typed histories, change envelopes, managed documents/versions, conversations, settings, and Scout state. Separate queue databases track discovery and position work. Scout description artifacts have a filesystem root. Managed profile files materialize authoritative database content.

## Processing Model and Guarantees

**PERSIST-ARCH-001** Database connections enable foreign keys and a 5,000 ms busy timeout. Normal opening does not create a missing database; initialization and migration are explicit maintenance operations. Do not infer WAL mode or distributed storage from SQLite usage.

For typed audited entities, the persistence change boundary executes an audit envelope and domain writes in one transaction. At that boundary, updates require expected revisions, store prior versions in typed history, and increment revisions. Ordinary Gig, Person, Task, and Interaction update services read that revision internally; this protects their read/write interval, not every stale client edit. Surface-specific contracts identify where the caller must supply a revision. Supported deletion is soft deletion. Reversal creates a new change and checks later revisions/dependencies.

These rules do not cover all persisted objects uniformly. Managed documents have separate versions; conversations/settings have their own repositories; Scout state and queues require separate coordination. Filesystem materialization and provider calls are not in one transaction with all business state.

## Failure Modes

Stale revisions fail instead of overwriting newer state. Postcommit profile materialization failures are logged/pending; startup synchronization rewrites copies and can fail application opening. Database restore does not restore Scout artifacts or queue files. See [recovery](../operations/recovery.md).

## Scaling Characteristics and Constraints

Current deployment uses a local database and application-owned workers. No replicated database, distributed lock service, or measured multi-instance capacity target is established. The busy timeout is a lock-wait setting, not a latency guarantee.

## Implementation References

Current source symbols and verification locations are in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#persist-arch-001).

## Used By

All [capabilities](../APPLICATION.md#major-capabilities). See [reliability](../requirements/reliability.md) and [decisions](../decisions/README.md).
