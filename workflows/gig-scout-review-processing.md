---
type: workflow
scope: gig-scout-review-processing
summary: Evaluate discovered positions against relevance criteria and candidate background, then review, pursue, defer, or reprocess them.
load_when:
  - changing screening or promotion
  - recovering descriptions or reprocessing selected positions
---
# Evaluate Positions, Review Results, and Pursue Opportunities

## Purpose

Help the job seeker decide which discovered positions deserve pursuit. Scout obtains each official description, checks the search's relevance criteria, and scores the candidate's fit. The user receives the description, official link, and evaluation explanation, then chooses whether to track the opportunity, dismiss it, or return later.

## Actors

Scout retrieves descriptions from official sources and asks the screening model for evaluations. The job seeker reviews positions and makes decisions. An operator can rerun processing for selected positions when descriptions or evaluations need refreshing.

## Trigger

A [company search](gig-scout-discovery.md) accepts a position, an operator requests reprocessing, or the user acts on a position ready for review.

## Preconditions

Scout needs a saved observation of the position and the source settings needed to obtain its description. Screening requires configured relevance criteria, candidate profile, and model. A user decision requires a completed description and evaluations that are still current when the decision is submitted.

## Inputs

The official posting supplies the title, company, location, URL, and description. Relevance criteria describe which kinds of roles belong in the search. The separate candidate profile describes the person's background and goals; a scoring rubric tells the model how to assess fit. The user supplies a decision and optional note, plus a return date/time when deferring.

The review interface also submits identifiers for the exact description and evaluations shown to the user. These let Scout reject decisions based on results that have since changed.

## Normal Flow

1. Scout checks the saved observation and obtains or reuses the official description. It validates that retrieved content belongs to the posting and retains its source and retrieval history. This step does not attach an existing Gig automatically.
2. The model checks the description against relevance criteria. A rejection whose confidence meets the configured threshold marks the position irrelevant. A pass or an uncertain rejection continues to candidate scoring.
3. The model compares the description with the saved candidate profile and scoring rubric. Scout records an integer score from 1 to 10 and a short explanation, then makes the position available for review. Score alone does not reject or pursue a position.
4. The user opens the position, reads the description and evaluation, follows the official link if needed, and chooses **Pursue**, **Irrelevant**, or **Defer**.
5. For pursuit, Scout checks possible existing Gigs. If it finds candidates, the user explicitly chooses a new Gig or one of those existing Gigs. Scout checks that the proposed matches have not changed since they were shown; see [posting resolution](opportunities-posting-resolution.md).
6. Scout saves the pursuit intent, creates or updates the chosen Gig, and saves its official job description as a managed document. Only after those steps succeed does it mark the position promoted and remove it from the ordinary Scout review workspace.

## Alternate Flows

**Defer** postpones a position until the requested review time; due positions return when the workspace list is requested. **Irrelevant** removes it from current list views. Backend actions can restore agent-marked irrelevance, reverse a user decision, or append a note. Reversal does not remove an already linked Gig.

Changing relevance settings saves a new criteria version and restarts evaluation for all unlinked positions that have descriptions when screening is configured. This includes positions previously deferred or marked irrelevant by the user.

An operator can instead request explicit position reprocessing, called backfill in the API:

1. Select 1–1,000 exact positions and give a reason. Preview checks that every position has an observation, a current active source with the same source key, and the description retrieval settings and identifiers it needs.
2. Start the request only if every selected position is eligible. Scout saves the selected observations, source configurations, candidate profile, and model for that execution. Repeating the same selection, reason, observations, and configurations reuses the existing execution.
3. Rerun the processing pipeline while preserving prior user decisions such as deferred, irrelevant, or promoted. Agent-marked irrelevance can remain irrelevant or return to review. For promoted positions, refresh the linked Gig's managed description without creating another Gig.
4. Report each item's outcome, description changes, processing failures, and linked-document updates. A newer overlapping request replaces unfinished work for the same positions.

A legacy backfill API selects positions from a previous full run in batches and resumes from a saved checkpoint. Its report separates selection progress from downstream processing. It should not be assumed to have the explicit-selection path's user-decision preservation guarantees.

## Failure Behavior

Changed position revisions or evaluation identifiers reject a decision so the user can review again. Changed possible-Gig matches require a refreshed choice. Invalid match selections are rejected.

Pursuit can fail after the Gig or description has already been saved. Scout retains its recorded intent, and the web interface offers retry so processing can finish using the existing results.

Description or model failures remain processing failures; they are not evidence that a job is irrelevant. During explicit backfill, a description request returning HTTP 404 or 410 is reported as unavailable. Other exhausted failures are reported as failed. All failed/unavailable items make the backfill failed; mixed failures or superseded work make it partial.

## Completion / Postconditions

A review-ready position has a recorded official description and completed evaluations. Successful pursuit links the position to a tracked Gig and its saved description; it does not submit an application. Explicit reprocessing reports outcomes for its selected positions while retaining their saved inputs and prior user decisions.

## Nonfunctional Requirements

No independent completion-time target is established. [Scout architecture](../architecture/gig-scout.md) explains retries and recovery after partial writes.

## Related Documentation

- [Gig Scout behavior and rules](../capabilities/gig-scout.md)
- [Search configured companies](gig-scout-discovery.md)
- [Position and decision states](../domain/gig-scout.md)
- [Review and reprocessing API contracts](../interfaces/gig-scout.md)
- [Processing and promotion implementation](../architecture/gig-scout.md)
- [Resolve a posting into a Gig](opportunities-posting-resolution.md)
- [Managed documents and candidate context](../capabilities/documents-profile.md)

## Related documents

- [Gig Scout](../capabilities/gig-scout.md)
- [Scout Companies, Positions, and Evaluations](../domain/gig-scout.md)
- [Gig Scout Interfaces](../interfaces/gig-scout.md)
- [Gig Scout Architecture](../architecture/gig-scout.md)
