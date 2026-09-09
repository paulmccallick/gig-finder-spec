# Application Documentation

Current-state application documentation is at this repository root. Read `MAP.md` first and load the minimum relevant documents; do not recursively load the corpus.

1. Read the relevant capability for behavior and rules.
2. Load workflow/domain documents for lifecycle and concepts.
3. Load interface documents when working at a boundary.
4. Load architecture when implementation is relevant.
5. Load verified decision provenance when rationale matters.

Use `llm-facing-application-documentation.md` as the documentation format, interpreting its `docs/` directory as this repository root. Do not create a nested `docs/` directory. Existing documentation inside the sibling `gig-finder` code repository may provide leads, but verify it against implementation and tests.

Code is the baseline source of truth for documenting current behavior. Surface discrepancies explicitly rather than silently treating either prose or code as a new requirement. Do not invent NFR targets, architectural rationale, or surface support. Keep code evidence in supporting interface/architecture documents. Do not load historical PRDs/plans by default.

When behavior changes, update relevant current-state documents. Keep metadata and relative links valid; preserve unrelated user changes. New documents other than `MAP.md` require YAML `type`, `scope`, `summary`, `load_when`, and `related` fields.
