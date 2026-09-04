# Canonical specification coverage report

## Corpus and evidence boundary

This is the complete current-behavior corpus in this standalone local repository. Evidence was limited to application source under `src/`, SQL/schema/migrations, source configuration, and tests. Existing README/product/architecture/ADR/plan/PRD prose was not consulted or cited. Internal HTTP routes were treated only as implementation evidence for supported UI behavior, never as public access points.

## Capability and workflow coverage

| Capability | Covered workflows |
|---|---|
| Opportunities | Browse/filter/detail; create; update; CLI touch; availability and Scout ownership boundary |
| Networking | Browse/detail; create/update Person; typed Person-to-Gig relationship creation |
| Tasks | Browse/prioritize; create/update/complete/reopen/cancel |
| Interactions | Browse/filter/detail; create/update/supersede/soft-delete; derived Person contact fields |
| Documents and profile | Owner discovery; exact/current version reads; UI view/download; inline/staged creation; editable version update; Profile context |
| Conversational agent | New/resumed conversations; streaming/persistence/budgeting; strict tools; upload staging; global model choice; eligible change reversal |
| Gig Scout | Versioned relevance criteria; full scan/history/results; position review/defer/irrelevant/pursue; posting identity resolution; promotion retry/reconciliation |

The corpus contains 7 capability routers, 19 workflow specifications, 6 shared foundations, 10 meaningful access-point variants, and 27 strict agent-tool operation contract files. The contract catalog is optional discovery; routed bundles load only the operation needed.

## Evidence gaps and bounded uncertainty

- Application source declares exact strict Zod input schemas for agent tools but not corresponding strict output schemas. Each contract therefore preserves the exact generated input and source-observed result status family; nested result record payloads are governed by workflow/entity prose rather than an invented strict output contract.
- JSON Schema generation cannot preserve every Zod refinement. Workflows explicitly state cross-field, calendar, URL, clear/set, ownership, and identity rules that still run at execution. In particular, standard JSON Schema counts Unicode code points while the application's 50,000-character document limit uses JavaScript UTF-16 code units; runtime validation is authoritative. The hand-characterized `create_document` contract adds evidenced source-pairing, ownership, result-metadata, and provenance constraints.
- There is no genuine public API in current evidence. UI-owned internal routes are intentionally absent as public access points.
- Current code is local/single-user and supplies trusted actors at supported entry points; it contains no externally meaningful multi-user role/permission model to specify.
- The supported CLI boundary is `bin/gig-finder`. Operational scripts and private Scout company import/backfill routes were not promoted into end-user CLI/public workflows.
- Source configuration can change deployment limits and source coverage. The spec records source-defined defaults and observable configured behavior, not the set of real companies or credentials.

## Recorded current limitations and defects

- Dashboard Opportunities, Networking, and Tasks are read-only; People paused/do-not-contact are excluded from the Networking board; there is no Interaction board.
- The dashboard/Scout choose the first Gig job description lexicographically by document ID when several exist.
- General agent Gig update cannot establish a null `nextAction` or `payRange` through leaf operations, while whole-object paths are clear-only; agent creation or CLI whole-object update is required.
- Core-record same-value updates still advance revision/history; only managed-document identical-content update has explicit no-op behavior.
- Gig-Person Relationships have create/read only; no supported update/delete. The CLI accepts `gig-people add` but omits it from printed usage.
- There are no supported deletes for Gigs, People, Tasks, or managed documents.
- Uploaded-source managed documents are immutable. Staged uploads are process-local, one-at-a-time in the UI, expire (15-minute default), and do not survive restart.
- Staged-document references are random process-global bearer-like values with no conversation/session/tenant ownership check. Any request that obtains an exact unexpired reference can resolve it. A consumed-reference replay validates the strict tool input but returns the original result before rechecking otherwise schema-valid ownership/business fields.
- Conversation selection uses a character-based token estimate and recent complete turns; identifier sanitization covers known patterns, not arbitrary sensitive-data detection.
- Gig Scout uses polling, offers only four active review views, and keeps restore/reverse/separate-note service operations outside current UI support.
- Scout promotion spans separate Gig/document/Scout-state mutations. A Gig can commit before document/state completion fails; durable retry reconciles the same intent.

## Link, format, and context validation

`bun scripts/validate-corpus.ts` checks all Markdown link targets, JSON parsing, local JSON-Schema pointer resolution, strict characterization-envelope/input markers, operation count, and file-class budgets. Latest result (excluding its own generated report): 75 files, 45 Markdown files, 167 internal links, 27 operation contracts, and no failures. Results are recorded in `validation/corpus-validation.json`.

`bun scripts/measure-context.ts` records every root → capability → workflow → required dependency → variant route in `validation/context-budgets.json`. Measurement uses characters/4 rounded up, matching GigFinder's own conversation-budget heuristic (not provider tokenization). Latest measured results:

- Root router: 414 estimated tokens (limit 1,000).
- Largest capability router: 442 (limit 1,500).
- Workflow range: 435–2,129 (hard limit 5,000).
- 29 routed workflow/variant bundles measured; all are at or below 10,000 estimated tokens. The maximum is 9,441.

## Fresh-reader tests

Three fresh lower-cost reader runs were restricted to routed bundles and prohibited from opening application source or sibling specs:

1. Opportunity create/update agent route: correctly reconstructed confirmation, duplicate resolution, strict complete creation, set/clear updates, preservation, validation, audit, and derivable tests. Its ambiguity report led to explicit final-object validation, parent-null nested behavior, same-value update, URL acceptance, error mapping, and non-null agent change-result rules.
2. Scout review/promotion route: correctly reconstructed review states, exact reviewed evidence, resolution, field preservation, document versioning, and retry. Its ambiguity report led to explicit state eligibility/transitions, timestamp behavior, posting normalization/fingerprint inputs, posting-owned fields, provenance, multi-document selection, and multi-transaction failure recovery.
3. Agent upload/document-create route: correctly reconstructed temporary staging, conversion, consent, ownership, immutable uploaded sources, and replay safety. Its ambiguity reports led to surface-scoped confirmation, exact converter/staging limits and expiry/capacity, read-versus-consume behavior, provenance details, inline editability, note ownership, validation order, relative-file-path semantics, and machine-checkable creation input/result constraints. Its security and Unicode findings were verified as current implementation limitations and recorded rather than silently normalized.

Final opportunity, upload/document, and Scout re-reads reported no unresolved material spec defect. The Scout re-read specifically verified lexicographic job-description selection, uploaded-document immutability failure, deterministic retry identity, Gig-before-document partial commits, processing failure state, and retry reconciliation.

## Repository isolation

This repository has its own `.git` directory and no remote. No application source, tests, existing documentation, issues, branches, pull requests, or user-owned files were changed by this work.
