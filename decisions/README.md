---
type: architecture
scope: application
summary: Find recorded architectural rationale and its verification boundary.
load_when:
  - Find recorded architectural rationale and its verification boundary.
related:
  - architecture/persistence.md
  - operations/deployment.md
---

# Decision Provenance

Historical rationale cannot be reconstructed reliably from implementation alone. The code repository contains accepted ADRs. Use them to understand recorded intent, then compare their implementation claims with current architecture. This corpus does not invent alternatives, motivation, or acceptance dates.

| Recorded decision | Verified current mechanism / qualification |
|---|---|
| [0005 — Revisioned audited changes](app::docs/architecture/decisions/0005-revisioned-audited-change-transactions.md) | `DataStore.change`, typed history, expected-revision writes, and bounded reversal implement this for supported entities. Do not generalize its “every mutable row” language to settings, conversations, and Scout state. |
| [0007 — External-state Docker deployment](app::docs/architecture/decisions/0007-immutable-production-deployment.md) | Dockerfile and deployment script separate state and enforce commit-shaped deployment tags with database rollback. Its build-once language is broader than current CI: the smoke image and published multi-platform image are built separately. |

These linked ADRs retain their existing recorded status; this index is not a new architectural decision or reapproval. See [persistence](../architecture/persistence.md) and [deployment](../operations/deployment.md) for authoritative current implementation descriptions and code evidence. Other code-repository ADRs should be verified before use; this index makes no blanket currency claim for them.
