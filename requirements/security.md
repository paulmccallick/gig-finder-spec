---
type: requirement
scope: security
summary: Who can access job-search data and where private information is sent or stored.
load_when:
  - who can access job-search data and where private information is sent or stored
---

# Security and Privacy

## Access to the Application

GigFinder does not ask users to log in or check their permissions for individual records. Anyone who can reach its HTTP service can use the exposed operations. The default source server listens on the local computer only. The supplied container deployment also publishes its port on the host's loopback address, although the service listens on all interfaces inside the container. [Deployment](../operations/deployment.md) describes that setup.

Actor names stored with changes identify the label supplied by the application or configuration. They are not authenticated user identities.

The assistant's instructions ask for confirmation before certain actions, but the server does not require a separate approval token before executing those tools. [Conversational-agent rules](../capabilities/conversational-agent.md#business-rules) explain which requests depend on prompt policy rather than a technical permission check.

## Private Information

Candidate details, saved documents, messages, and tool inputs/results can contain personal information. The application sends relevant information to the model provider for responses and evaluations. Logs can also contain generated text and tool data.

The logger removes values at selected authorization/cookie header paths. It does not remove all private information. Operators therefore need to control access to the data directory, credentials, logs, and backups. [Observability](../operations/observability.md) explains logging behavior. The code repository's [privacy instructions](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/.agents/skills/coding-guide/SKILL.md) prohibit committing real personal data or credentials.

## Limits of Protection

The inspected implementation has no application-managed encryption at rest or automatic complete removal of personal data from logs. Upload validation and document-reference checks constrain those inputs; they do not create separate accounts or permissions.

## Implementation Evidence

[HTTP routing](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts), [server configuration](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/app.ts), [deployment binding](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/bin/deploy-local.sh), [log redaction](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/observability/logger.ts), and [assistant instructions](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/system-prompt.ts) establish these behaviors. The [architecture overview](../architecture/overview.md) shows where the components run.

## Related ADRs

- [ADR 0009: Keep personal data out of source control](../decisions/0009-keep-personal-data-out-of-source-control.md)
- [ADR 0013: Allow private application data in local logs](../decisions/0013-allow-private-data-in-local-logs.md)

## Related documents

- [Conversational Agent](../capabilities/conversational-agent.md)
- [Health Checks and Logs](../operations/observability.md)
- [Architecture Overview](../architecture/overview.md)
