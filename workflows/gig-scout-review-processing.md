---
type: workflow
scope: gig-scout-review-processing
summary: Description acquisition, screening, user decisions, promotion recovery, and explicit position reprocessing.
load_when:
  - changing screening or promotion
  - recovering descriptions or reprocessing selected positions
related:
  - capabilities/gig-scout.md
  - domain/gig-scout.md
  - interfaces/gig-scout.md
  - architecture/gig-scout.md
---
# Process, Review, and Reprocess Scout Positions

## Purpose

Turn discovered positions into evaluated evidence for review and possible promotion, with controlled reprocessing.

## Actors

Operator, Scout workers, official sources, screening model, and reviewing user.

## Trigger

Discovery or an operator backfill creates position work; the user submits a decision after review.

## Preconditions

Processing needs a persisted position observation and source configuration. Screening needs candidate-profile/model configuration and relevance criteria.

## Inputs

Bound observation and configuration; user decisions supply current state revision plus description, relevance-evaluation, and candidate-match-evaluation IDs.

## Normal Flow

1. Validate the bound observation and schedule description acquisition. Despite its `reconcile_gig` stage name, this step does not automatically attach a matching Gig.
2. Acquire or reuse official description content according to the source's description strategy and validate posting identity. Persist converted Markdown and source/conversion provenance.
3. Screen relevance against the bound criteria. A confident failure becomes agent irrelevance. Passing or insufficient-confidence failure proceeds to candidate match.
4. Score against the candidate profile and rubric. Store the integer score and short explanation, then expose the position for user review.
5. The user reads the description, score, official link, and observation context, and submits pursue, irrelevant, or defer with current evidence IDs.
6. For pursuit, resolve possible existing Gigs. If candidates exist, request explicit create-new/use-existing selection with the reviewed candidate fingerprint and, for use-existing, the Gig revision.
7. Save promotion intent, create/update the selected Gig through the Gig service, and create/update its managed Markdown job description through the document service. Mark the position promoted only after coordination succeeds.

## Alternate Flows

Defer accepts a review timestamp and optional note; due positions resurface when the workspace is listed. Mark-irrelevant removes the position from the available list views. Backend actions support restoring agent irrelevance, reversing a user decision, and adding independent notes. Reversal preserves an already linked Gig.

Relevance settings append a criteria version and requeue all unlinked described positions when screening is configured. This path sets them to processing, including user-owned workflow states.

Explicit position reprocessing works differently:

1. Preview 1–1,000 distinct exact position IDs with a nonempty reason of at most 500 characters. Resolve each latest observation and current active source with the same source key.
2. Reject missing positions, missing observations/configurations, missing detail-acquisition plans, or missing required external identity inputs. Start rejects the entire selection if any item is ineligible.
3. Atomically capture selected bindings and screening snapshot. Repeating the same IDs, reason, observations, and configurations reuses the existing execution.
4. Re-run the complete pipeline. Preserve user-owned workflow; agent irrelevance may remain irrelevant or return to review. For already promoted positions, refresh the durably linked managed description without creating a second Gig.
5. Report stage counts, description corrected/unchanged outcomes, per-position outcomes, failures, and managed-document projection outcomes. New overlapping requests supersede prior unfinished work.

Legacy backfill selects observations from a full source run in bounded batches and resumes using a saved position checkpoint. It uses current source configuration bindings where available. Its status describes selection and downstream progress separately.

## Failure Behavior

Stale revision/evaluation IDs reject the decision for renewed review. Changed candidate fingerprints/revisions return stale resolution; invalid selections return invalid resolution. A failed promotion retains durable intent and supports retry. Document coordination is not one atomic transaction with Gig acceptance, so retry reconciles the previously accepted Gig and document change identities.

Failed acquisition or model processing records a failed stage after retry exhaustion, without treating it as irrelevance. Explicit-backfill acquisition HTTP 404/410 yields an unavailable item; other failures yield failed. All failed/unavailable items yield a failed backfill; any failed or superseded item among other outcomes yields partial.

## Completion / Postconditions

Review-ready positions have recorded description and evaluation evidence. Successful promotion links one Scout position to its accepted Gig and coordinated description. Successful reprocessing reports each selected position's outcome while preserving its specified immutable inputs and user-owned workflow.

## Nonfunctional Requirements

No independent processing completion-time target was established. Retry and replay mechanisms are documented as implementation in [Scout architecture](../architecture/gig-scout.md).

## Related Documentation

[Capability](../capabilities/gig-scout.md) · [States](../domain/gig-scout.md) · [HTTP contracts](../interfaces/gig-scout.md)
