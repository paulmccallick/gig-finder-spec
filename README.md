---
type: application
scope: gig-finder
summary: Starting points and validation instructions for GigFinder documentation.
load_when:
  - finding the documentation or checking an edit
---

# GigFinder Documentation

Read [what GigFinder does](APPLICATION.md), or use the [documentation map](MAP.md) to find a specific capability, workflow, interface, or implementation.

The documentation lives at this repository root. [Authoring instructions](AGENTS.md) apply the [documentation format](llm-facing-application-documentation.md) here, without a nested documentation directory. Describe behavior from code; verify any older code-repository documentation before reusing it. Implementation evidence uses revision-pinned GitHub links so it works without a sibling code checkout; [evidence and currency](APPLICATION.md#evidence-and-currency) records the audit baseline.

Run `bun validate-docs.ts` to check metadata, required sections, links, and heading anchors. The checks also require every Related documents entry to be a clickable Markdown link and every current-state document to be reachable from the map. The [validator](validate-docs.ts) excludes the format guide and agent instructions from application-document metadata rules. The [imported ADRs](decisions/README.md) retain their recorded format and wording; their status, core sections, links, and reachability are checked without requiring new metadata or prose.

## Related documents

- [Documentation Map](MAP.md)
- [GigFinder](APPLICATION.md)
