---
type: interface
scope: application
summary: Select the correct browser, HTTP, CLI, tool, or external boundary.
load_when:
  - Select the correct browser, HTTP, CLI, tool, or external boundary.
related:
  - APPLICATION.md
  - architecture/overview.md
  - requirements/security.md
---

# Interface Index

## Surface Contracts

| Boundary | Contract and semantics |
|---|---|
| Browser | Boards read Gigs, people, and tasks; Scout, documents, and agent views have specialized interactions. Browser filters are not necessarily backend query defaults. |
| HTTP | Handwritten routing in `request-handler.ts`; selected JSON endpoints and an AI SDK message stream, not a full CRUD API. |
| CLI | `bin/gig-finder` dispatches source CLI commands against configured local services. Input and output options belong to CLI contracts. |
| Agent tools | Registered tools with strict schemas call application services. Tool discovery does not imply HTTP endpoint availability. |
| External systems | Provider requests, employer/ATS retrieval, runtime filesystem inputs, and deployment registry access. |

Load capability interface documents for exact operations: [opportunities](../capabilities/opportunities.md#related-interfaces), [networking](../capabilities/networking.md#related-interfaces), [tasks](../capabilities/tasks.md#related-interfaces), [interactions](../capabilities/interactions.md#related-interfaces), [documents](../capabilities/documents-profile.md#related-interfaces), [conversation](../capabilities/conversational-agent.md#related-interfaces), [Scout](../capabilities/gig-scout.md#related-interfaces).

## HTTP Common Behavior

JSON helpers set `Cache-Control: no-store`. Responses receive `x-request-id` from the incoming header or a generated ID. Methods are checked per route. The generic non-GET fallback is 405 `Read-only API`; the GET fallback delegates to static serving or returns 404. This does not mean all APIs are read-only: agent, settings, uploads, and Scout routes are handled earlier.

`WebRequestError` returns its specified status/message; `DomainValidationError` becomes 422 with a code; unrecognized exceptions become 500. Individual routes further classify failures, so do not assume a single global conflict status. `/healthz` returns 200 or 503 based on database validation and includes revision/integrity/foreign-key counts.

## Authentication and Compatibility

There is no application authentication or version-negotiation layer. Current HTTP paths are unversioned. Agent UI streams declare AI SDK UI message-stream version `v1`, which is a transport marker rather than the application's API version. No authoritative OpenAPI specification was found in the inspected source; executable routing and schemas remain the boundary reference.

## External Integrations

Model calls use the Codex-provider adapter and runtime credentials. Scout connects to configured employer/ATS sources through source adapters and reusable templates. Candidate profile JSON is a local context input. Managed candidate-document context is read from authoritative database content; materialized profile files are derived copies. See [architecture](../architecture/overview.md), [security](../requirements/security.md), and [deployment](../operations/deployment.md).

## Implementation References

**INTERFACE-ARCH-001** Current router, error, CLI, tool, provider, and Scout sourcing references are listed in [IMPLEMENTATION_MAP.md](../IMPLEMENTATION_MAP.md#interface-arch-001).
