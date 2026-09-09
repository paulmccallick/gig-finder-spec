---
type: domain
scope: gig-scout
summary: Scout concepts and the independent lifecycle of discovery, processing, and user decisions.
load_when:
  - interpreting Scout states or provenance
  - changing position identity or lifecycle
related:
  - capabilities/gig-scout.md
  - workflows/gig-scout-review-processing.md
---
# Scout Domain

## Definition and Relationships

| Concept | Meaning and relationships |
| --- | --- |
| Scout company | Stable catalog identity and display name, active flag, and current source configuration. Distinct from a tracked Gig's company text. |
| Configuration version | Immutable collection of source settings used for a company scan; later imports can establish a new current version. |
| Search profile | Run-owned title terms, optional title variants, and location intents used for discovery filtering. Distinct from the candidate profile used in scoring. |
| Run | Full discovery, legacy source-run backfill, or explicit position backfill. Contains execution scope and saved inputs. |
| Source outcome | Result of reading one official source, including validation evidence, counts, and diagnostics. |
| Position | Durable posting identity within a company/source, based on external ID when present, otherwise canonical URL. Can be observed in many runs. |
| Observation | Posting title, URL, location, time, source, and evidence as seen during a particular run. Historical observations remain separate from the latest position display. |
| Description | Official posting content converted to Markdown, with hashes, source URL, retrieval time, and conversion provenance. |
| Relevance evaluation | Versioned-criteria result, reason, confidence, evidence, ambiguities, and model identity. |
| Candidate-match evaluation | Profile/rubric-specific score and explanation linked to a relevance evaluation. |
| Decision | Agent, user, or system action with origin, actor, review evidence, and state revision; optional note and defer time. |
| Promotion | Reviewed intent to create/update a Gig and its managed description. Has its own pending/failed/completed status and durable Gig/document links. |

## States and Transitions

Full discovery runs begin `queued`, become `running` as results are committed, and finish `completed`, `partial`, or `failed`. A zero-company run completes immediately. Individual companies remain `queued` until `succeeded`, `partial`, or `failed`; company status has no separate running value.

Source outcomes are `succeeded_with_results`, `succeeded_empty_verified`, `suspicious_empty`, `partial`, or `failed`. Verified emptiness is evidence of success; suspicious emptiness is not.

| Position state | Meaning / transitions |
| --- | --- |
| `processing` | Initial discovery and active pursuit state. Screening can lead to review or irrelevance; successful pursuit leads to promoted. A failed stage may leave the position processing. |
| `needs_user_review` | Completed candidate evaluation awaits pursue, irrelevant, or defer decision. |
| `irrelevant` | Agent confidence-based or user decision. Direct restore supports agent origin only; backend reversal can reverse user decisions. Hidden from current list filters. |
| `deferred` | User postponement; a due time returns it to review on list access. |
| `promoted` | Durable link to a Gig; excluded from ordinary workspace list/detail. Reversing a user decision does not unlink an existing Gig. |
| `rejected` | Retained state vocabulary and excluded from current workspace; no current review action writes this state. |

Processing stages are `reconcile_gig`, `acquire_description`, `screen_relevance`, and `score_candidate_match`. Each has status `pending`, `completed`, `failed`, or `superseded`. Processing failure is not a relevance decision. Superseded work represents an input replaced by newer work.

## Invariants and Revision Rules

Position identity is source-scoped; equal external IDs across different companies or source keys are not the same position. Observations preserve historical run evidence. Review decisions compare the current revision and exact reviewed evaluation IDs. Successful promotion requires the Gig and managed-document results to be coordinated before the position is marked promoted.

Explicit position backfill keeps its selected observation, configuration, candidate profile, and screening model bindings. New overlapping backfill work supersedes unfinished work for the same position. User-owned deferred/irrelevant/promoted workflow is preserved during explicit backfill, while machine evaluation evidence can change.

## Related Capabilities and Workflows

- [Gig Scout](../capabilities/gig-scout.md)
- [Processing and review](../workflows/gig-scout-review-processing.md)
