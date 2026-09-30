---
type: domain
scope: application
summary: Resolve application-specific vocabulary.
load_when:
  - Resolve application-specific vocabulary.
related:
  - domain/model.md
  - APPLICATION.md
---

# Terminology

| Term | Meaning |
|---|---|
| Gig / opportunity | Role tracked in the candidate's pipeline. |
| Pipeline stage | Progress in pursuing a Gig; separate from outcome and availability. |
| Availability | Posting known available, unavailable, or unknown; separate from a pursuit decision. |
| Person | Professional contact, not an application login account. |
| Latest contact | Facts derived from completed interactions rather than editable contact fields. |
| Task | Work item with its own status and optional related record. |
| Interaction | Recorded communication/event; does not send or schedule externally. |
| Managed document | Application-owned versioned text/Markdown identified independently of a file path. |
| Staged document | Temporary extracted upload content available before persistence by a document tool. |
| Candidate profile | Structured candidate input; managed candidate documents provide additional context. |
| Scout source | Configured employer-posting retrieval definition. |
| Position | Scout-discovered posting, distinct from a tracked Gig. |
| Discovery | Retrieving postings and availability/description evidence from sources. |
| Processing | Applying description/evaluation work to discovered positions. |
| Relevance | Whether a position meets configured job criteria; distinct from candidate matching. |
| Promotion | Associating an accepted position with a new or existing Gig under resolution rules. |
| Revision | Entity mutation version used to detect stale writes. |
| Change | Audited domain operation, possibly affecting multiple records; reversal has defined bounds. |

Detailed rules: [capabilities](../APPLICATION.md#major-capabilities).
