# Application Documentation

Current-state application documentation is at this repository root. Read [MAP.md](MAP.md) first and load the minimum relevant documents; do not recursively load the corpus.

1. Read the relevant capability for behavior and rules.
2. Load workflow/domain documents for lifecycle and concepts.
3. Load interface documents when working at a boundary.
4. Load architecture when implementation is relevant.
5. Load verified decision provenance when rationale matters.

Use [LLM-facing application documentation](llm-facing-application-documentation.md) as the documentation format, interpreting its `docs/` directory as this repository root. Do not create a nested `docs/` directory. Existing documentation inside the sibling `gig-finder` code repository may provide leads, but verify it against implementation and tests.

Code is the baseline source of truth for documenting current behavior. Surface discrepancies explicitly rather than silently treating either prose or code as a new requirement. Do not invent NFR targets, architectural rationale, or surface support. Keep code evidence in supporting interface/architecture documents. Do not load historical PRDs/plans by default.

When behavior changes, update relevant current-state documents. Keep metadata and relative links valid; preserve unrelated user changes. New application documents other than [MAP.md](MAP.md) require YAML `type`, `scope`, `summary`, and `load_when` fields. Related documents belong in a rendered `## Related documents` section containing Markdown links, not YAML paths. This overrides the reference format’s `related` metadata field, as requested by the user.

## Readability and Links

Start each capability and workflow with the job seeker's purpose and the result they get. Use concrete language such as recording a call, finding relevant positions, or seeing what is due. Explain technical terms before using them; keep storage and execution mechanics in architecture/interface documents. Describe current limits precisely without turning every paragraph into a disclaimer.

Link every supporting document from the document that introduces it. Use a visible `## Related documents` section with document-relative Markdown links. Do not put related paths in YAML; metadata and bare filenames are not clickable navigation. Link implementation evidence to a published code revision on GitHub, not a sibling-checkout path, and update the [audit baseline](APPLICATION.md#evidence-and-currency) when rechecking claims. Every current-state document must be reachable from [MAP.md](MAP.md). Run the [validator](validate-docs.ts) after changing documents.

## Preserved Architectural Decisions

The [decision index](decisions/README.md) contains the ADRs moved from the code repository. At the user's direction, preserve their original wording, dates, statuses, and sections; only formatting and link markup may change. Do not add alternatives, rationale, or current-code commentary to their bodies. These imported records retain their original metadata style instead of retrofitted YAML and Related documents sections. The index and owning architecture pages provide clickable navigation and current-code qualifications. New ADRs should use the guidance's full structure.

Load ADRs when the reason for a technical choice matters; use architecture documents for current implementation and capability documents for behavior. Each relevant architecture document should link directly to the decisions that explain it.
