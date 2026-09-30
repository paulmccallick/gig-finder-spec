---
type: application
scope: gig-finder
summary: Entry point to the source-verified application documentation.
load_when:
  - locating current GigFinder documentation
related:
  - MAP.md
  - APPLICATION.md
---

# GigFinder Application Documentation

Start with [MAP.md](MAP.md), then load only the documents relevant to the task. [APPLICATION.md](APPLICATION.md) describes purpose, users, scope, and capabilities.

The application documentation lives at this repository root. It follows [LLM-Facing Application Documentation Structure](llm-facing-application-documentation.md), with the repository root serving as the guide's documentation root. Code is authoritative; documentation from the code repository is used only after verification against implementation.

Run `bun validate-docs.ts` from this repository to check metadata, required sections, local links, and heading anchors.
