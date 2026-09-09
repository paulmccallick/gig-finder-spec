---
type: requirement
scope: application
summary: Distinguish enforced constraints from unmeasured service targets.
load_when:
  - Distinguish enforced constraints from unmeasured service targets.
related:
  - requirements/security.md
  - requirements/reliability.md
  - architecture/overview.md
---

# Global Nonfunctional Constraints

## Evidence Policy

This corpus separates enforced behavioral constraints, documented operating policies, and unknown service objectives. Implementation constants are not automatically business requirements. Capability-specific limits belong with that capability/interface; implementation mechanisms belong in architecture.

## Consistency and Recovery

Supported audited mutations preserve transaction consistency and reject stale updates. This applies to a domain operation, not an entire conversation or integration. See [reliability](reliability.md).

## Security and Privacy

The application has one configured context and no application authentication boundary. State and credentials are external runtime inputs. See [security](security.md).

## Unestablished Targets

No quantified service-wide latency SLO, throughput target, maximum business-record volume, availability percentage, or RPO/RTO was established by inspected code. Queue defaults, body limits, lock timeouts, and test timeouts are not such targets. No production performance measurement was performed.

## Implementation

[Architecture](../architecture/overview.md), [persistence](../architecture/persistence.md), [deployment](../operations/deployment.md).
