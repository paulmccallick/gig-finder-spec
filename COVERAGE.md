# Canonical specification coverage report

## Corpus and evidence boundary

This standalone local repository characterizes current GigFinder behavior. Evidence was limited to application source, schemas/migrations, source configuration, and tests. PRDs, product documentation, plans, ADRs, architecture documents, issues, pull requests, and network sources were not consulted. Internal HTTP/service boundaries are evidence for behavior, not public access points.

## Canonical structure and functional coverage

The corpus uses `README → capability → feature → optional detail`. It contains 7 capability routers, 19 mandatory functional feature specs, 19 actor workflows, 4 justified Operational Models, 15 concrete Quality Scenarios, 10 meaningful access-point variants, 6 shared foundations, and 27 strict agent-tool operation contracts.

| Capability | Functional features characterized |
|---|---|
| Opportunities | Complete Gig records and pipeline invariants; externally observed posting availability |
| Networking | People/defaults/status lanes; typed Gig–Person relationships; derived contact recency |
| Tasks | Task classification, relationship binding, completion/reopen/cancel lifecycle |
| Interactions | Interaction/participant lifecycle, supersession, correction, deletion, and derived contact effects |
| Documents and profile | Managed ownership/versioning/provenance; metadata-only candidate-Profile context discovery |
| Conversational agent | Conversation streaming/persistence/budgeting; upload staging; exact global model selection; audited reversal |
| Gig Scout | Company/source configuration; relevance configuration; discovery run/company work; position processing; review/promotion; legacy/explicit reprocessing |

All functional features are present even when behavior has no UI. The company/source configuration and reprocessing features explicitly describe their private configuration/operational boundaries rather than inventing public access.

## Operational and quality coverage

Operational Models exist only for Scout features that meet the structural entry criteria:

- Discovery runs: full-run and independently queued company work, source trust, aggregation, redelivery/reconciliation, durable evidence, and configured/hard bounds.
- Position processing: deterministic staged work identities, complete state vocabularies, dependency binding, failure projection, later-event revival, queue recovery, and observability.
- Position reprocessing: immutable explicit-item bindings, atomic start, exact aggregation including all-superseded, replay fingerprints, and concurrency.
- Review and promotion: evidence/revision binding, candidate ordering/fingerprint, separately committed Gig/document/position effects, failed and completed retry semantics, and restore/reverse/note behavior.

The 15 Quality Scenarios comprise 10 Scout constraints and 5 cross-capability constraints. They cover redelivery, restart reconciliation, run binding, source bounds, trusted versus suspicious empty results, confidence thresholds, queue restart, atomic backfill start, stale review, promotion recovery, interrupted conversation persistence, reversal conflicts, staging capacity, stale document updates, and latest-contact timezone ordering. Every scenario uses one classification and the six concrete SEI fields with an objectively testable response measure; ISO 25010 appears only in authoring rules as a checklist prohibition.

## Scout depth

Scout specifies both asynchronous work levels: a full discovery run dispatches durable per-company work whose sources run sequentially, while independent deterministic position work advances observation through Gig reconciliation, description acquisition, relevance screening, and candidate match. Full-run completion does not wait for position processing. All run, company, source, validation, outbox, position, work, description, relevance, promotion, and backfill status vocabularies are enumerated with exact aggregation/transition rules.

Configuration binding covers immutable company/source versions, source-order-sensitive import fingerprints, exact run snapshots, default search terms/title variants/locations, complete candidate-profile and screening identities, semantic position-work identities, and order-normalized explicit-backfill fingerprints. Trust rules distinguish verified results, verified empty, suspicious empty, partial, and failed observations; only a fully trusted company result can mutate availability, using exact stored URL/requisition comparisons. Bounds, retries, attempt counts, backoff, reconciliation sweeps, extracted-description limits, promotion-document limits, and durable diagnostic/evidence records are explicit.

Review/promotion specifies current evidence and revision guards, deterministic candidate ordering and fingerprints, explicit duplicate resolution, posting-owned field preservation, Gig-before-document partial commits, exact document selection, identical-content provenance-preserving no-op, deterministic failed retry, the currently unexposed completed refresh path, and exact restore/reverse/note limitations. It records the implemented relevance-save defect that moves every unlinked described position—including user decisions and legacy `rejected`—back to processing.

## Evidence gaps and bounded uncertainty

- Strict agent inputs are application-enforced Zod schemas. The application does not apply an equivalent output validator, so result contracts are source-observed characterizations assembled from return construction, domain types, and tests; they do not claim a separate runtime output-validation gate.
- JSON Schema cannot encode every runtime refinement. Workflows retain the authoritative cross-field, calendar, URL, uniqueness, clear/set, ownership, and identity rules. The 50,000-character managed-document runtime limit uses JavaScript UTF-16 string length, while standard JSON Schema `maxLength` counts Unicode code points.
- No genuine public API or external multi-user authorization/role model is evidenced. Current supported state is local/single-user; private configuration/service operations are not relabeled as public APIs.
- Local evidence defines source adapters, defaults, and bounds but cannot establish which real-company credentials or external pages are currently available. Network validation was unavailable and was unnecessary for this source-only corpus.

## Recorded current limitations and defects

- Opportunities, Networking, and Tasks dashboards are read-only; People in `paused`/`do_not_contact` are omitted from the Networking dashboard; no Interaction dashboard exists.
- General agent Gig update cannot establish a null `nextAction` or `payRange` through leaf operations because whole-object paths are clear-only. Gig/Person creation and same-value core updates advance history; general Gig and Person creates are not reversible.
- Gig–Person relationships have create/read only. Gigs, People, Tasks, and managed documents have no supported delete. Managed-document metadata/ownership cannot be edited or relinked.
- Uploaded-source documents are immutable. Staged uploads are process-local, expire, do not survive restart, and use bearer-like references without conversation/session ownership. Consumed-reference replay returns the original result before rechecking later business fields.
- Candidate-Profile document bodies are not automatically assembled into agent context; only an untrusted metadata catalog is injected, and exact content is fetched through `get_document` when relevant.
- Conversation selection uses a character-based estimate and recent complete turns. Identifier redaction recognizes known patterns rather than arbitrary sensitive data.
- Scout source execution and review use polling. Relevance configuration currently resets every eligible unlinked described position to processing, including user-owned states. Processing may retain a pre-failure projection while durable work is failed until a later observation/configuration/backfill revives it.
- Scout promotion can commit a Gig before document/final-state failure. The lexicographically first job description is authoritative; differing uploaded content can make retry fail indefinitely. The service supports completed-promotion refresh, but current UI cannot open promoted positions and exposes retry only for failed promotion.
- Host-default locale case folding and locale comparison affect duplicate/candidate identity and ordering; exact canonical-URL spelling is not normalized.

## Link, format, and context validation

`bun scripts/validate-corpus.ts` validates front matter, required and prohibited artifact structure, capability/feature ownership, reverse routing, relative Markdown targets, JSON parsing and local pointers, strict operation inputs, contract ownership/count, scenario concreteness, Operational Model element/section agreement, and per-artifact budgets. Latest result: 121 files excluding generated validation reports, 84 corpus Markdown files excluding templates, 216 internal links, 27 operation contracts, and zero failures. The generated record is `validation/corpus-validation.json`.

`bun scripts/measure-context.ts` measured every root-to-feature route plus every routed workflow, model, scenario, variant, and strict operation contract one at a time, including transitive `requires`. It uses JavaScript UTF-16 string code units divided by four and rounded up, matching GigFinder's conservative conversation heuristic rather than provider tokenization. Latest result: 95 routes, all at or below the 10,000 typical-route budget; maximum 9,219 estimated tokens. The complete route/file breakdown is `validation/context-budgets.json`.

## Fresh-reader tests

Two initial source-blind readers independently audited Scout and the cross-capability corpus. Their failures drove corrections to company/source schema/defaults, run/profile binding, query-side resurfacing, relevance overwrite behavior, processing revival, document no-op provenance, availability identity, backfill aggregation/fingerprints, review maintenance/retry, reversal eligibility, Profile context assembly, model IDs, record vocabularies/defaults, dashboard mappings, search output, and Interaction provenance exposure.

Final source-blind re-reads are recorded in the completion commit/report. Readers were forbidden from consulting application source, product/architecture material, plans, ADRs, PRDs, or the network and made no edits.

## Repository isolation

This is an independent Git repository on `main`, with its own `.git` directory and no remote. Corpus authoring changed no application source, tests, schemas, migrations, documentation, branches, issues, pull requests, or other user-owned files.
