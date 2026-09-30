---
type: domain
scope: gig-scout
summary: Companies, search inputs, positions, observations, evaluations, and the states that connect discovery to tracked opportunities.
load_when:
  - interpreting Scout states or provenance
  - changing position identity or lifecycle
---
# Scout Companies, Positions, and Evaluations

## Definition

Scout organizes a candidate's job search around configured companies and the official positions those companies publish. A position is a posting that Scout has discovered; a Gig is an opportunity the user has chosen to track. Discovering a position does not automatically create a Gig.

## Attributes

| Concept | Meaning |
| --- | --- |
| Scout company | A catalog entry with a stable identifier, display name, active flag, and official source settings. Only active companies participate in a full search. |
| Configuration version | The source settings saved for a company at a particular version. A later import can establish new current settings without rewriting past searches. |
| Search profile | Title terms, permitted title variants, and locations used to filter listings. Built-in defaults apply when full-run terms or locations are empty or omitted. |
| Candidate profile | The candidate's configured background and goals, saved with a run for fit scoring. It is separate from search filters and relevance criteria. |
| Run | One full company search or one execution of position reprocessing. It records the selected scope, saved inputs, progress, and outcomes. |
| Source outcome | Whether reading an official source succeeded, was incomplete, or failed, with counts and diagnostic evidence. |
| Position | A stable posting identity within a company and source, using its external job identifier when available and otherwise its canonical posting URL. |
| Observation | What a source reported about a position in a particular run: title, location, URL, time, and source evidence. |
| Description | The official posting text saved for evaluation, with its retrieval and conversion history. |
| Relevance evaluation | A criteria-based pass/fail judgment with confidence, reason, evidence, and ambiguities. |
| Candidate-match evaluation | A score from 1 to 10 and explanation produced from the description, candidate profile, and scoring rubric. |
| Decision | An agent, user, or system action with its author, reviewed evidence, revision, optional note, and optional return time. |
| Promotion | Pursuit that creates or updates a tracked Gig and saves its job description; its progress is tracked separately until completed. |

## Relationships

A company has configuration versions and exactly one active source in its current configuration. A full run selects every active company and records source outcomes. A position can have observations in many runs; a later observation does not erase what an earlier search saw.

Descriptions and evaluations belong to positions and retain the inputs used to produce them. A review decision refers to the exact description and evaluations the user saw. A promoted position links to its accepted Gig and managed description. The [candidate and document model](documents-profile.md) explains how configured candidate context differs from saved documents.

## States

| Area | States and meaning |
| --- | --- |
| Full run | `queued`, `running`, then `completed`, `partial`, or `failed`. |
| Company within a run | `queued`, then `succeeded`, `partial`, or `failed`; there is no separate company running state. |
| Source result | `succeeded_with_results`, `succeeded_empty_verified`, `suspicious_empty`, `partial`, or `failed`. An empty result is successful only when validation supports it. |
| Position | `processing`, `needs_user_review`, `irrelevant`, `deferred`, `promoted`, or the retained `rejected` state. |
| Processing step | `pending`, `completed`, `failed`, or `superseded`. Superseded means newer work replaced the step's inputs. |
| Promotion | `pending`, `failed`, or `completed`, independently of source discovery. |

## State Transitions

A new position normally starts processing. A sufficiently confident relevance rejection moves it to irrelevant. Other relevance results continue to scoring, whose completion makes the position ready for user review. A failed processing step can leave the position in processing; failure is not a relevance decision.

From review, the user can dismiss a position as irrelevant, defer it, or pursue it. A due deferred position returns to review when the list is requested. Pursuit processes the Gig and description changes, then marks the position promoted after they succeed. Promoted positions leave ordinary Scout list and detail views.

Agent-marked irrelevance has a direct backend restore action. User decisions have a separate backend reversal action, which does not unlink an existing Gig. The current review actions do not write `rejected`, and ordinary list filters do not expose irrelevant, rejected, or promoted positions.

A full run finishes once company discovery finishes, even if position evaluation is still underway. A run with no active companies completes immediately.

## Invariants

Position identity is scoped to a company and source: equal external identifiers from different companies or source keys do not identify the same position. Historical observations remain attributable to their original runs.

Review decisions must match the current position revision and exact evaluated description. A score alone cannot dismiss or promote a position. Promotion completes only after the Gig and managed description have both been coordinated.

Explicit position reprocessing retains its chosen observation, source settings, candidate profile, and model. New overlapping requests supersede unfinished work for the same positions. This path preserves user decisions while refreshing evaluation evidence. Changing relevance criteria follows a different rule: it restarts processing for unlinked described positions, including user-deferred and user-irrelevant positions.

## Related Capabilities

- [Gig Scout](../capabilities/gig-scout.md)
- [Tracked opportunities](../capabilities/opportunities.md)
- [Documents and candidate context](../capabilities/documents-profile.md)

## Related Workflows

- [Search configured companies](../workflows/gig-scout-discovery.md)
- [Evaluate, review, and pursue positions](../workflows/gig-scout-review-processing.md)

## Related documents

- [Gig Scout](../capabilities/gig-scout.md)
- [Evaluate Positions, Review Results, and Pursue Opportunities](../workflows/gig-scout-review-processing.md)
