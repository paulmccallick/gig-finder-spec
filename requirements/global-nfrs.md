---
type: requirement
scope: application
summary: Shared data-protection and consistency constraints, and unspecified service targets.
load_when:
  - shared data-protection and consistency constraints, and unspecified service targets
---

# Shared Quality Constraints

These documents describe how GigFinder protects saved information and what callers can rely on when work fails. Capability-specific rules and input limits remain in the relevant [capability documents](../APPLICATION.md#major-capabilities).

## Saving Consistent Data

A supported domain operation saves its related database writes together. Some operations also check a caller-supplied revision or document version to reject outdated edits. Other edit services only check for a conflicting write during their own read/write interval. [Reliability](reliability.md) explains those boundaries and the consequences of an interrupted conversation or Scout job.

## Access and Private Information

GigFinder uses one configured set of job-search data and has no application login or separate user permissions. Candidate information can be included in model requests and logs. [Security and privacy](security.md) describes these limits and the operating assumptions.

## Targets Not Specified

The inspected source does not specify a service-wide response-time target, throughput, supported record volume, uptime percentage, maximum acceptable data loss, or maximum recovery time. Configuration limits and retry settings are not measured performance or recovery guarantees.

The [architecture overview](../architecture/overview.md) explains the current implementation. [Deployment](../operations/deployment.md) describes the supplied operating setup; neither is a promise that a larger or different deployment has been tested.

## Related documents

- [Security and Privacy](security.md)
- [Reliability and Consistency](reliability.md)
- [Architecture Overview](../architecture/overview.md)
