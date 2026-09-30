---
type: interface
scope: application
summary: The operations available through the browser, HTTP, command line, and assistant tools.
load_when:
  - the operations available through the browser, http, command line, and assistant tools
---

# Interface Guide

GigFinder offers several ways to use the same records. They do not all expose the same operations or use the same default filters. Read the detailed contract for the route you are changing.

## Detailed Contracts

| Area | Contract |
|---|---|
| Gigs and posting identity | [Opportunity interfaces](api/opportunities.md) |
| People and their roles in Gigs | [Networking interfaces](networking.md) |
| Work items and completion | [Task interfaces](api/tasks.md) |
| Communications and participants | [Interaction interfaces](interactions.md) |
| Saved documents, versions, and upload conversion | [Document interfaces](api/documents-profile.md) |
| Conversation, model selection, and tools | [Conversational agent interfaces](api/conversational-agent.md) |
| Company searches, position review, and reprocessing | [Scout interfaces](gig-scout.md) |

## Ways to Use the Application

The browser boards load Gigs, people, and tasks and filter them locally. The assistant and CLI can perform edits that those boards do not offer. Scout has dedicated browser and HTTP controls for its search/review workflows. See the [application overview](../APPLICATION.md) for what those capabilities accomplish.

The [HTTP router](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts) exposes a selected set of JSON endpoints and a streaming assistant response. It is not a general create/read/update/delete API for every record. The [CLI](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/cli/cli.ts) and [agent tools](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/gig-finder-tools.ts) call shared application services directly. Tool schemas are executable input contracts, not additional HTTP routes.

## Shared HTTP Behavior

JSON responses produced by the router use `Cache-Control: no-store`. Responses include `x-request-id`, taken from the incoming header or generated for the request. Each recognized route checks its supported methods. Requests reaching the generic non-GET fallback receive 405 with `Read-only API`; dedicated agent, settings, upload, and Scout writes are handled before that fallback.

[Error handling](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/error-response.ts) preserves the status/message of `WebRequestError`, maps domain validation errors to 422 with a code, and returns 500 for unrecognized exceptions. Some routes classify their own conflicts and input errors, so use their detailed contracts rather than assuming every conflict has the same status.

`GET /healthz` returns 200 or 503 based on database validation, with the application revision and database checks. [Observability](../operations/observability.md) explains what a healthy response establishes.

## Authentication and Compatibility

The application has no login or per-user authorization checks. See [security and privacy](../requirements/security.md) for the access assumptions.

HTTP paths have no application version prefix. Assistant responses use the installed AI SDK's UI-message stream, marked `v1`; that identifies the stream protocol. The inspected source has no separate OpenAPI specification, so routing and runtime schemas are the authoritative interface definitions.

## External Systems

The [model provider adapter](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/agent/codex-provider.ts) uses runtime credentials to request assistant responses and Scout evaluations. [Scout sourcing](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/sourcing/source-plan.ts) retrieves postings from configured employer sites or their applicant tracking systems. The candidate's structured profile is a local JSON input; managed candidate documents are read from the database, with derived file copies.

The [architecture overview](../architecture/overview.md) explains these connections. [Deployment](../operations/deployment.md) covers runtime configuration and external state.

## Related documents

- [GigFinder](../APPLICATION.md)
- [Architecture Overview](../architecture/overview.md)
- [Security and Privacy](../requirements/security.md)
