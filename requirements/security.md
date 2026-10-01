---
type: requirement
scope: security
summary: Understand actual access, privacy, and consent boundaries.
load_when:
  - Understand actual access, privacy, and consent boundaries.
related:
  - capabilities/conversational-agent.md
  - operations/observability.md
  - architecture/overview.md
---

# Security and Privacy

## Current Access Boundary

HTTP does not implement login, session authentication, per-user authorization, tenant isolation, or a mutation approval token. The source server defaults to loopback; the container listens on all interfaces internally and deployment publishes to host loopback. Network access restrictions belong to the operating environment.

Configured actor labels and Scout's `User` actor are audit labels, not verified identities. Agent consent instructions are conversational policy, not an enforced approval mechanism. See [conversational agent](../capabilities/conversational-agent.md).

## Private Data Handling

Candidate context, conversations, documents, employer data, and tool arguments/results can contain private content. Model operations send relevant context to the provider. Logs redact selected authorization/cookie header paths, not arbitrary private data. Operators must protect context, credentials, logs, and backups. The code repository's coding guide forbids committing real personal data or credentials.

## Limits

No application-level encryption-at-rest or automatic complete private-data redaction is established. Upload limits and reference checks do not provide account isolation.

## Evidence

**SEC-ARCH-001** Current implementation references for routing, configuration, deployment, logging, agent policy, and repository policy are listed in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#sec-arch-001).
