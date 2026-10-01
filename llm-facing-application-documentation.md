# LLM-Facing Application Documentation Structure

## 1. Objective

Create a documentation system that describes an existing software application accurately enough for both humans and LLM-based software-engineering agents to understand, reason about, and modify the application.

The documentation represents the **current state of the application**. It is not primarily a requirements backlog or a history of how the application was developed.

The system must support **selective context loading**. An agent should be able to determine which documents are relevant to a task without loading the entire documentation corpus.

The documentation should answer four distinct questions:

1. **What does the application do?**
2. **What rules and constraints govern its behavior?**
3. **How is that behavior implemented?**
4. **Why were important architectural decisions made?**

These concerns should be separated so that implementation details do not become confused with application requirements.

---

# 2. Design Principles

## 2.1 Document Current Truth

Documentation under the primary documentation tree describes the application **as it currently behaves**.

Historical PRDs, user stories, tickets, and implementation plans are not authoritative descriptions of current behavior.

For example, if an old story says:

> Users may edit an order after submission.

but the current application only permits editing before submission, the current-state documentation must describe the latter behavior.

---

## 2.2 Organize Around Capabilities, Not Projects

The primary organizational unit is an application **capability**.

Examples:

* Authentication
* Customer Management
* Order Management
* Search
* Reporting
* Notifications
* Billing

Projects and initiatives are temporary. Capabilities generally persist for the life of the application.

---

## 2.3 Separate Requirements from Implementation

Documentation must distinguish between:

**Requirement**

> Search results must normally be returned within 500 ms.

and:

**Implementation**

> Search requests are served from an Elasticsearch cluster with application-level caching.

The first describes a constraint on the application.

The second describes the current technical solution.

Changing the implementation should not require changing the requirement unless the application's actual requirement also changes.

The specification records intended behavior and constraints. Implementation
sources record what currently runs. When they disagree, surface the
discrepancy explicitly and resolve it through a deliberate specification or
implementation change; do not automatically edit the specification to match
code or promote observed code behavior into a requirement.

### Stable Statement IDs

Give stable IDs to statements that need independent references from the
implementation map or other tooling. Use the form `<AREA>-<KIND>-<NNN>`, where
`KIND` is `BR` (business rule), `FB` (functional behavior), `WF` (workflow
step), `API` (interface contract), or `ARCH` (architecture/operations
constraint), for example `TASK-BR-001`, `TASK-FB-003`, `SCOUT-WF-002`, or
`TASK-ARCH-001`. Put the ID in bold at the start of the exact bullet, numbered
step, or paragraph it identifies. Keep one independently meaningful
statement per ID. IDs are immutable identifiers: do not renumber them when
text moves, and never reuse a retired ID. Assign IDs only where independent
traceability is useful; ordinary explanatory prose does not need one.

### Implementation Map

`IMPLEMENTATION_MAP.md` is the mutable index from stable specification IDs to
current implementation and verification locations. Keep exact source paths,
symbols, test-file paths, and other volatile implementation references there,
not in architecture prose. Each entry identifies the specification document
and statement, implementation location(s), verification location(s), and any
known discrepancy or verification status. Use repository-qualified paths so
the map remains useful across separate checkouts. Update the map when code or
tests move; do not change the specification ID solely because an
implementation location changed.

---

## 2.4 Avoid Duplication

Information should have one authoritative home.

Documents should link to related documentation instead of copying it.

For example, a workflow may state:

> Authorization rules are defined in `capabilities/access-control.md`.

It should not reproduce the entire authorization model.

---

## 2.5 Optimize for Progressive Context Loading

Agents should begin with a small documentation map and progressively load more detailed documents.

The expected retrieval pattern is:

```text
MAP
 ↓
APPLICATION OVERVIEW
 ↓
CAPABILITY
 ↓
Relevant supporting documentation
 ├── Workflow
 ├── Domain
 ├── Interface
 ├── Requirement
 └── Architecture
      ↓
     ADR
```

An agent should not need to load architecture documentation to answer a simple question about application behavior.

Similarly, it should not need to load every capability to modify one feature.

---

# 3. Directory Structure

Use the following structure:

```text
docs/
│
├── MAP.md
├── APPLICATION.md
├── IMPLEMENTATION_MAP.md
│
├── capabilities/
│   ├── authentication.md
│   ├── customers.md
│   ├── orders.md
│   └── reporting.md
│
├── workflows/
│   ├── user-login.md
│   ├── create-order.md
│   └── generate-report.md
│
├── domain/
│   ├── model.md
│   ├── terminology.md
│   ├── customer.md
│   └── order.md
│
├── requirements/
│   ├── global-nfrs.md
│   ├── performance.md
│   ├── reliability.md
│   └── security.md
│
├── architecture/
│   ├── overview.md
│   ├── persistence.md
│   ├── messaging.md
│   ├── authentication.md
│   └── integrations.md
│
├── interfaces/
│   ├── README.md
│   ├── api/
│   ├── events/
│   └── external-systems/
│
├── operations/
│   ├── deployment.md
│   ├── observability.md
│   ├── recovery.md
│   └── runbooks/
│
├── decisions/
│   ├── ADR-001-example.md
│   └── ADR-002-example.md
│
└── changes/
    └── ...
```

Not every application will require every directory or document. Create documents when the application contains information significant enough to justify them.

---

# 4. MAP.md

## Purpose

`MAP.md` is the primary entry point for an LLM.

It is **not application documentation itself**. It is a routing mechanism that tells an agent where authoritative information resides.

Keep it small.

It should allow an agent to identify relevant documentation without opening every file.

## Required Contents

The map should contain:

* application-level documentation
* major capabilities
* major workflows
* important architectural areas
* major interfaces
* cross-cutting requirements
* where to find implementation and verification references when coding
* instructions about when each should be loaded

## Example

```markdown
# Documentation Map

This documentation describes the current state of the application.

Use this file to identify relevant documentation before loading
additional files. Do not load unrelated documentation.

## Application Overview

For overall purpose, users, boundaries, and system context:

- APPLICATION.md

## Authentication

For authentication behavior and rules:

- capabilities/authentication.md

For login behavior:

- workflows/user-login.md

For authentication implementation:

- architecture/authentication.md

## Orders

For order-management behavior:

- capabilities/orders.md

For the Order domain object:

- domain/order.md

For order creation:

- workflows/create-order.md

## Reporting

For reporting capabilities:

- capabilities/reporting.md

For report-generation workflow:

- workflows/generate-report.md

## Cross-Cutting Requirements

Performance:
- requirements/performance.md

Security:
- requirements/security.md

Reliability:
- requirements/reliability.md

## Architecture

Load architecture documents when investigating implementation,
making technical changes, or evaluating architectural consequences.

Do not load architecture documentation merely to understand
application behavior.

## Architectural Decisions

Load ADRs when:

- determining why an architectural approach exists
- reconsidering an existing architectural decision
- making a significant new architectural decision
```

---

# 5. APPLICATION.md

## Purpose

Provide the smallest useful description of the application as a whole.

An agent unfamiliar with the repository should be able to read this document and understand what the system is before navigating into individual capabilities.

This document should remain high-level.

## Structure

```markdown
# Application

## Purpose

What the application exists to accomplish.

## Users

Major user or actor types.

## Scope

Major responsibilities of the application.

## Out of Scope

Important things the application intentionally does not do.

## Major Capabilities

Short descriptions with links to capability documents.

## System Context

External systems and actors with which the application interacts.

## Key Terminology

Only terminology necessary to understand the overview.

Link to domain/terminology.md for the complete glossary.
```

---

# 6. Capability Documents

Location:

```text
docs/capabilities/
```

## Purpose

Capability documents are the **primary functional specification of the application**.

They describe what the application currently does from a product/business perspective.

They should generally avoid implementation details.

A capability represents a stable area of application responsibility.

Examples:

* Authentication
* Order Management
* Customer Management
* Search
* Billing
* Reporting

## Structure

```markdown
# <Capability>

## Purpose

What this capability provides and why it exists.

## Actors

Users or systems that interact with the capability.

## Functional Behavior

The behavior exposed by the capability.

## Business Rules

Rules governing that behavior.

## State and Lifecycle

Relevant states and allowed transitions.

Omit if the capability has no meaningful lifecycle.

## Capability-Specific Nonfunctional Requirements

Requirements that apply specifically to this capability.

Examples:

- maximum supported volume
- latency requirements
- consistency requirements
- availability requirements
- concurrency requirements

Do not describe the implementation used to achieve these requirements.

## Related Workflows

Links to detailed workflows.

## Related Domain Objects

Links to domain documentation.

## Related Interfaces

Links to APIs, events, or integrations.

## Related Architecture

Links to implementation documentation.

## Known Constraints

Current constraints that materially affect application behavior.
```

---

# 7. Workflow Documents

Location:

```text
docs/workflows/
```

## Purpose

Describe important end-to-end interactions or processes.

A workflow cuts across capabilities or contains enough branching, state transition, or failure behavior that describing it inside a capability document would make that document unnecessarily complicated.

Do not create separate workflow documents for trivial CRUD operations unless their behavior is significant.

Examples:

* User Login
* Checkout
* Account Registration
* Order Cancellation
* Password Recovery
* Generate Report

## Structure

```markdown
# <Workflow>

## Purpose

What the workflow accomplishes.

## Actors

Who or what initiates and participates in it.

## Trigger

What begins the workflow.

## Preconditions

Conditions that must already be true.

## Inputs

Important inputs.

## Normal Flow

Numbered description of successful behavior.

## Alternate Flows

Supported deviations from the normal flow.

## Failure Behavior

Expected behavior when operations fail.

## Completion / Postconditions

What is guaranteed when the workflow completes successfully.

## Nonfunctional Requirements

Workflow-specific constraints.

## Related Documentation

Links to relevant capabilities, domain objects, interfaces,
requirements, and architecture.
```

---

# 8. Domain Documentation

Location:

```text
docs/domain/
```

## Purpose

Define the application's conceptual model independently of storage or implementation.

These documents establish a common vocabulary for humans and agents.

They should describe **business concepts**, not database tables or programming-language classes.

---

## domain/model.md

Provides a high-level map of the important domain concepts and their relationships.

Example:

```text
Customer
   │
   ├── owns → Account
   │
   └── places → Order
                  │
                  └── contains → OrderItem
```

---

## domain/terminology.md

Defines terms with application-specific meanings.

Example:

```markdown
### Active Customer

A customer whose account is enabled and permitted to initiate
new transactions.

### Submitted Order

An order that has completed validation and has been accepted
for processing.
```

---

## Entity Documents

Create individual documents for sufficiently important domain concepts.

Example:

```markdown
# Order

## Definition

## Attributes

Conceptually important attributes, not necessarily every database field.

## Relationships

## States

## State Transitions

## Invariants

Rules that must always remain true.

## Related Capabilities

## Related Workflows
```

---

# 9. Nonfunctional Requirements

Location:

```text
docs/requirements/
```

## Purpose

Document constraints on **how well the application must behave**, rather than what functionality it provides.

Examples include:

* performance
* scalability
* availability
* reliability
* durability
* security
* privacy
* consistency
* recovery objectives
* concurrency

NFRs exist at two levels.

### Application-Wide NFRs

Requirements applying broadly across the system belong under `requirements/`.

Example:

```markdown
# Performance Requirements

## Interactive Requests

Interactive API operations should complete within the defined
service latency target under normal operating conditions.

## Background Processing

Background processing must not materially degrade interactive
request performance.

## Capacity

The system must support the documented production workload
without manual scaling intervention.
```

### Capability-Specific NFRs

If an NFR applies only to one capability or workflow, document it directly in that capability or workflow.

Do not move every NFR into a global document.

For example:

```markdown
## Capability-Specific Nonfunctional Requirements

- Search must return the first result page within 500 ms at p95.
- Search must support at least 100 concurrent requests.
```

The corresponding architecture document explains **how** those requirements are achieved.

---

# 10. Architecture Documents

Location:

```text
docs/architecture/
```

## Purpose

Describe **how the application is currently implemented**.

Architecture documentation should not become the authoritative source for functional behavior.

Architecture documents explain:

* components
* services
* processes
* storage
* messaging
* concurrency
* caching
* communication patterns
* integration patterns
* important technical boundaries
* significant failure behavior

Keep exact source paths, implementation symbols, test-file references, and
other volatile implementation locations in `IMPLEMENTATION_MAP.md`, keyed by
stable statement IDs. Link to the relevant map entry instead of maintaining a
`Source Evidence` or `Verification Anchors` list in architecture documents.

---

## architecture/overview.md

Describe the major technical components and their relationships.

Example:

```text
Web Application
      │
      ▼
API Service
   │      │
   ▼      ▼
Database  Message Broker
              │
              ▼
          Worker Service
```

The document should explain the responsibility of each component without attempting to document every implementation detail.

---

## Topic-Specific Architecture Documents

Create documents for architectural areas significant enough to understand independently.

Examples:

```text
architecture/
├── persistence.md
├── messaging.md
├── authentication.md
├── caching.md
├── background-processing.md
└── integrations.md
```

Recommended structure:

```markdown
# <Architecture Area>

## Purpose

## Components

## Processing Model

## Data Flow

## Guarantees

Examples:
- ordering
- delivery semantics
- transaction boundaries
- consistency

## Failure Modes

## Scaling Characteristics

## Constraints

## Used By

Links to capabilities and workflows.

## Related Requirements

## Related ADRs
```

---

# 11. Interface Documentation

Location:

```text
docs/interfaces/
```

## Purpose

Describe contracts at application boundaries.

Separate interfaces by type when useful:

```text
interfaces/
├── api/
├── events/
└── external-systems/
```

API documentation should preferably be generated from an authoritative specification such as OpenAPI when one exists.

Interface documentation should cover:

* contract
* semantics
* authentication
* errors
* compatibility/versioning
* relevant guarantees

Do not duplicate capability behavior merely because it is exposed through an API.

---

# 12. Operations Documentation

Location:

```text
docs/operations/
```

## Purpose

Describe how the running application is deployed, observed, maintained, and recovered.

Typical documents:

```text
deployment.md
observability.md
recovery.md
runbooks/
```

This documentation answers questions such as:

* How is the application deployed?
* What environments exist?
* How is health measured?
* What metrics and alerts matter?
* How is a failed deployment recovered?
* How is data restored?
* How should common production incidents be handled?

Operational documentation should not be mixed into capability documentation unless operational behavior is directly visible to application users.

---

# 13. Architecture Decision Records

Location:

```text
docs/decisions/
```

## Purpose

ADRs record **why significant technical decisions were made**.

Architecture documentation describes the current implementation.

ADRs explain the reasoning that produced important parts of that implementation.

An ADR is particularly useful when an implementation might otherwise look unnecessarily complicated to a future developer or agent.

## Structure

```markdown
# ADR-XXX: <Decision>

## Status

Accepted | Superseded | Deprecated

## Context

What problem or constraints required a decision.

## Decision

What was chosen.

## Alternatives Considered

Important alternatives and why they were not selected.

## Consequences

Positive and negative consequences.

## Related Documentation

Links to architecture, requirements, capabilities, or other ADRs.
```

Do not use ADRs as general architecture documentation.

---

# 14. Change Documentation

Location:

```text
docs/changes/
```

or outside the current-state documentation tree entirely.

## Purpose

PRDs, user stories, implementation plans, tickets, and similar artifacts describe **changes to the application**.

They are not authoritative current-state documentation.

Examples include:

* PRDs
* feature specifications
* user stories
* implementation plans
* migration plans

Agents should not load change history by default when trying to determine current application behavior.

Once a change is implemented, update the appropriate current-state documents.

For example:

```text
PRD
 ↓
Implementation
 ↓
Update:
  capability
  workflow
  domain
  interfaces
  architecture
  NFRs
as applicable
```

The PRD can then remain as historical context.

---

# 15. Document Metadata

Every document other than `MAP.md` should begin with lightweight metadata.

Use YAML front matter.

Example:

```yaml
---
type: capability
scope: orders
summary: Current-state behavior and business rules for order management.
load_when:
  - understanding order behavior
  - modifying order functionality
related:
  - domain/order.md
  - workflows/create-order.md
  - interfaces/api/orders.md
  - architecture/order-processing.md
---
```

## Required Fields

### `type`

One of:

```text
application
capability
workflow
domain
requirement
architecture
interface
operations
adr
change
```

### `scope`

Short identifier describing the subject area.

### `summary`

One or two sentences describing what authoritative information the document contains.

This is particularly important because an agent may use the summary to decide whether the full document should be loaded.

### `load_when`

Examples of tasks for which the document is relevant.

### `related`

Direct links to closely related documents.

Do not attempt to list every remotely related document.

---

# 16. Context-Loading Rules for Agents

Add the following rules to the repository's agent instructions.

```markdown
## Application Documentation

Application documentation is located under `/docs`.

Before investigating implementation details, read `/docs/MAP.md`.

Use MAP.md to identify the minimum documentation necessary for
the task.

Do not recursively load the entire `/docs` directory.

Treat capability, workflow, domain, requirement, interface, and
architecture documents as descriptions of the application's
current state.

Treat documents under `/docs/changes` as historical/change
artifacts unless explicitly marked otherwise.

When determining application behavior:

1. Read the relevant capability documentation.
2. Load relevant workflow/domain documents as needed.
3. Load interface documentation when working at a system boundary.
4. Load architecture documentation when implementation details
   are necessary.
5. Load ADRs when the reason for an architectural decision matters.

Do not infer a requirement solely from its current implementation.

If implementation and current-state documentation disagree,
identify the discrepancy rather than silently assuming either
is correct.

When changing application behavior, update the affected
current-state documentation as part of the change.
```

---

# 17. Example Navigation

Suppose an agent receives:

> Change what happens when a user attempts to log in after their account has been disabled.

The agent initially loads:

```text
docs/MAP.md
```

The map routes it to:

```text
capabilities/authentication.md
workflows/user-login.md
domain/customer.md
```

If those documents establish the required behavior, the agent does not need the rest of the documentation.

When it begins determining how to implement the change, it may additionally load:

```text
architecture
```
