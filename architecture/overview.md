---
type: architecture
scope: application
summary: Investigate components and implementation boundaries.
load_when:
  - Investigate components and implementation boundaries.
related:
  - architecture/persistence.md
  - interfaces/README.md
  - requirements/global-nfrs.md
  - decisions/README.md
---

# Architecture Overview

## Components

```text
React browser ──HTTP/stream──> Bun web composition
                                  ├── Conversation runtime ──> Model provider
CLI composition ──> Core services <┤
                                  └── Scout runtimes ──> Sources/model provider
Core ports <── SQLite adapters + managed content / artifact adapters
```

**APPLICATION-ARCH-001** The shared application layer composes Gigs, people, relationships, tasks, interactions, history, changes, documents, document reading, context search, and settings. Conversations and Scout are composed alongside it by the local and web application roots.

The React client presents opportunity, networking, task, Scout, document, and agent views. HTTP exposes selected operations, not generic CRUD for every service. CLI and agent tools call shared domain services through separate adapters.

## Processing Model

The Bun server hosts HTTP, conversation streaming, and two Scout queue runtimes. SQLite adapters persist business state; separate database paths hold Scout queues. Upload staging is in memory. Candidate configuration loads at startup; conversation model selection reads persisted settings for turns.

## Boundaries

Dependency-cruiser rules prohibit core dependencies on application adapters and constrain adapter construction to composition roots. Core schemas, CLI parsing, agent schemas, and HTTP handling impose distinct contracts. Shared domain access does not imply identical surface behavior.

## Guarantees and Failure Modes

See [persistence](persistence.md) for transaction scope. A conversation is not one transaction across tools. Scout asynchronously reconciles persisted work and queue state. `/healthz` checks database validity and reports the revision; it does not verify model-provider or employer-source availability.

## Requirements and Decisions

[Global constraints](../requirements/global-nfrs.md), [security](../requirements/security.md), [decision index](../decisions/README.md).

## Implementation References

Current source symbols and verification locations are in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#application-arch-001).
