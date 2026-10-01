# Application Documentation

Current-state application documentation is at this repository root. Read `MAP.md` first and load the minimum relevant documents; do not recursively load the corpus.

1. Read the relevant capability for behavior and rules.
2. Load workflow/domain documents for lifecycle and concepts.
3. Load interface documents when working at a boundary.
4. Load architecture when implementation is relevant.
5. Load verified decision provenance when rationale matters.

Use `llm-facing-application-documentation.md` as the documentation format,
interpreting its `docs/` directory as this repository root. Do not create a
nested `docs/` directory. The application checkout is the locally registered
`app` repository. Resolve evidence with `./gf-ref show app::<path>` or validate
it with `./gf-ref check app::<path>`; do not assume a sibling layout or
substitute a website. If `app` is not registered, report that prerequisite.
Existing application documentation may provide leads, but verify it against
implementation and tests.

The specification describes intended application behavior; implementation sources describe what currently runs. If they disagree, surface the discrepancy explicitly and resolve it as a deliberate specification or implementation change. Do not automatically edit the specification to match code or treat code as a new requirement. Keep volatile source, symbol, and test references in `IMPLEMENTATION_MAP.md`, not architecture prose. Do not invent NFR targets, architectural rationale, or surface support. Do not load historical PRDs/plans by default.

When behavior changes, update relevant current-state documents. Keep metadata and relative links valid; preserve unrelated user changes. New documents other than `MAP.md` require YAML `type`, `scope`, `summary`, `load_when`, and `related` fields.
