# GigFinder canonical-specification authoring rules

This repository is the product-behavior authority for implementation agents. It characterizes current GigFinder behavior from application source, schemas/migrations, and tests. It does not prescribe desired behavior.

## Evidence boundary

Use only application source, schemas/migrations, and tests. Never consult or cite PRDs, product documentation, plans, ADRs, architecture documents, issue prose, or pull-request prose. When evidence conflicts, externally observable implemented behavior wins. Record an implemented defect as current behavior; do not silently normalize it.

Supported access points are UI, strict agent tools, supported CLI commands, and future genuinely public APIs. Internal HTTP routes, domain-service calls, operational scripts, and test helpers are evidence, not access points. Database inspection may establish durable state. Characterization tests must enter through a supported access point.

Evidence pointers are optional and non-normative. Use only coarse source areas or suite paths, never individual tests, fixtures, line numbers, requirement IDs, or code-layer narratives. Normative sections must stand without source paths.

## Canonical hierarchy and routing

Route a reader through:

`README → capability → feature → workflow when needed → explicit dependencies → meaningful access-point variant or strict tool contract`

- A **capability** is a user-recognizable product area. Its functional routing table routes only to features; a separate shared-foundations section may link reusable cross-feature rules as supplemental navigation.
- A **feature** is the mandatory functional specification unit. Create one when behavior has its own configuration, lifecycle, durable state, validation contract, or downstream effect, even if it has no UI.
- A **workflow** is optional. Use it only for a meaningful actor-initiated sequence across feature behavior or state transitions. Do not make a workflow merely to repeat a feature.
- A **foundation** defines one rule reused across features.
- An **access-point variant** contains only meaningful differences from the shared feature/workflow.
- A strict **agent-tool schema** characterizes one supported strict tool operation. Load only the operation being invoked.
- An **Operational Model** and **Quality Scenario** are optional and governed by the entry rules below.

A cross-capability workflow belongs to the capability where the actor initiates it. Link dependencies rather than copying their rules. Use local front-matter lists and relative links; there is no global manifest.

## Required feature content

Every feature spec states:

- its boundary and user-recognizable outcome;
- supported access points, including “none” when behavior is configuration/internal processing only;
- configuration/defaults that materially affect behavior;
- durable and transient state plus lifecycle;
- validation, invariants, prohibited effects, and ownership;
- outputs and downstream effects;
- failure, retry, recovery, and current limitations;
- links to only the needed workflows, foundations, variants, contracts, Operational Models, and Quality Scenarios.

Use decision/state tables only when they clarify several branches. Keep implementation references out of normative content.

## Operational Model entry and structure

Create an Operational Model only when a feature has at least one of these structures:

- durable asynchronous work;
- multiple coordinated work levels;
- independent status models;
- derived completion or aggregation;
- retry, replay, redelivery, or reconciliation semantics;
- meaningful concurrency or ordering constraints.

Do not create one for a synchronous CRUD lifecycle merely because it has states or validation.

Front matter declares a nonempty subset of these `elements`; each declaration requires exactly the matching section. Delete undeclared sections.

| Element | Required section | Additional requirement |
|---|---|---|
| `work-levels` | `Work levels and coordination` | Identify each independently durable level and ownership boundary. |
| `configuration-binding` | `Configuration binding` | State snapshot/reference timing and later-edit behavior. |
| `status-models` | `State models` | Include at least one complete state table with entry and exit/transition meaning. |
| `derived-completion` | `Completion and aggregation` | Define terminal inputs and exact aggregation. |
| `retry-replay-reconciliation` | `Retry, replay, and reconciliation` | Distinguish safe replay, retry, redelivery, and partial-state repair. |
| `concurrency-ordering` | `Concurrency and ordering` | State bounds and ordering guarantees/non-guarantees. |
| `external-trust` | `External-source trust` | Define trust, validation, and empty/ambiguous result rules. |
| `durable-evidence` | `Durable evidence and observability` | Name durable evidence and actor-visible diagnostics. |
| `bounds` | `Bounds and limits` | State implemented configurable and hard bounds. |

Every Operational Model also contains `Purpose and boundary` and `Governing invariants`. No other level-two sections are allowed. Operational-model prose must remain product-operational, not a code tour.

## Quality Scenario entry and structure

A Quality Scenario is allowed only when all six SEI fields are concrete, the response is implemented, the measure is objectively testable, and the scenario materially constrains correctness, safety, recovery, performance, or trust. Classify it as exactly one of `correctness`, `safety`, `recoverability`, `performance`, or `trust`.

Required fields are `Source`, `Stimulus`, `Environment`, `Affected capability or behavior`, `Response`, and `Response measure`. Use one two-column table in a `Scenario` section. Reject aspirations, desired targets, generic prose, empty/“N/A” fields, implementation references, file paths, test names, and code identifiers. The response measure must state an observable pass/fail condition or numeric/configured bound. ISO 25010 is an authoring checklist only; never generate ISO-category headings.

## Budgets

- Root router: at most 1,000 estimated tokens.
- Capability router: at most 1,500.
- Feature: normally 2,000–3,500; hard maximum 5,000.
- Workflow or Operational Model: hard maximum 5,000.
- Quality Scenario: at most 1,500.
- Typical routed bundle: at most 10,000.

The repository validator uses the application's conservative character-count heuristic: JavaScript string length divided by four and rounded up. This is not provider tokenization.

## Completion checks

Before committing:

1. Validate front matter, required/excluded sections, local links and JSON pointers.
2. Confirm every capability routes to features and every workflow/variant/model/scenario names an existing owning feature.
3. Confirm every feature has a functional spec and every optional artifact is linked from it.
4. Measure every root-to-feature and root-to-feature-to-detail route.
5. Ask a fresh reader to reconstruct behavior, prohibited effects, states, failure/recovery, and derivable tests from routed bundles; treat ambiguity as a specification defect.
6. Commit only this standalone repository and restore recursive read-only permissions.
