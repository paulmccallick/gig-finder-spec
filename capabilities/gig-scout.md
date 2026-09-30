---
type: capability
scope: gig-scout
summary: Find candidate-relevant positions across active configured companies, evaluate descriptions, and let the user choose opportunities to track.
load_when:
  - understanding Gig Scout behavior
  - changing discovery or position review rules
---
# Gig Scout

## Purpose

Gig Scout helps a job seeker find positions relevant to their background and goals across the companies configured in the application. A full search covers every configured company marked active. It gathers official postings, narrows them by title and location, evaluates the remaining descriptions, and presents positions for the user to review and pursue.

The result is a review list with job descriptions, official links, and candidate-match scores. Choosing **Pursue** turns a position into a tracked opportunity, called a Gig, or updates an existing Gig chosen by the user.

## Actors

- The job seeker starts searches, reviews results, adjusts relevance criteria, and decides which positions to pursue.
- An operator configures companies and their official career sources, maintains the candidate profile, and can rerun processing for selected positions.
- Company career sites supply postings. A screening model evaluates descriptions and scores candidate fit.

## Functional Behavior

The user supplies title and location preferences for a search. The application also uses configured relevance criteria and a separate candidate profile describing the candidate's background and goals. These inputs serve different purposes:

| Input | What Scout uses it for |
| --- | --- |
| Company catalog | Select every company marked active and read its active official source. |
| Search profile | Filter listing titles and locations before evaluating full descriptions. |
| Relevance criteria | Judge whether a description belongs in the intended search. |
| Candidate profile and scoring rubric | Score the candidate's fit for positions that continue past relevance screening. The rubric defines how to assess fit. |

Scout records each search as a run. Run History shows which companies were searched, accepted postings, and source failures or incomplete results. Position processing continues separately: Scout obtains the official description, checks relevance, and assigns a candidate-match score from 1 to 10 with an explanation. The candidate profile does not generate the search's default title and location filters.

The Positions workspace normally shows positions awaiting review. The user can read the description and official link, compare scores, filter or sort results, and choose **Pursue**, **Irrelevant**, or **Defer**. Pursuit saves the official description with the tracked Gig. If possible existing Gigs are found, the user chooses whether to create a new Gig or update one of them; a matching posting identifier does not silently make that choice.

Operators can request reprocessing of exact positions to refresh descriptions and evaluations. The [processing workflow](../workflows/gig-scout-review-processing.md) describes this maintenance path and its effect on prior user decisions.

## Business Rules

- A full run searches all active configured companies. Inactive companies remain configured but are excluded. Each company configuration must have exactly one active official source.
- Starting another full run while one is queued or running returns that existing run and retains its settings.
- Omitted or empty title/location lists use built-in defaults, rather than an unrestricted search. Defaults cover director, vice-president, and specified engineering/technology head titles, with Seattle, Bellevue, Redmond, Remote, and Washington locations.
- A model rejection removes a position from review only when its confidence meets the configured threshold. Passing results and uncertain rejections continue to candidate scoring. A low candidate score alone never rejects a position; a high score never pursues it automatically.
- A review decision must still match the description and evaluations the user reviewed. If that evidence or the position changes, the user must review it again.
- Deferring requires a review date/time. Due positions return to review when the position list is requested.
- Only a completely successful company search can update tracked Gigs' posting availability. Missing postings in partial, suspiciously empty, or failed searches do not mark Gigs unavailable.
- An availability update does not close a Gig or change its pipeline stage or outcome. A non-closed Gig marked unavailable appears in the board's chronological **Unavailable** view with its existing stage, related records, filters, and recorded availability time. Trustworthy later evidence returns that same Gig to Active; closing it with a non-pending outcome puts it in Archive instead.

## State and Lifecycle

Discovery completion and review readiness are separate: a finished run can still have positions being processed. Positions normally move from processing to review, then to irrelevant, deferred, or promoted. Promoted means linked to a tracked Gig and its saved description; those positions leave the ordinary Scout workspace. See [states and relationships](../domain/gig-scout.md).

## Capability-Specific Nonfunctional Requirements

No separate Scout completion-time or capacity target is established in the inspected source. Current processing limits and recovery mechanisms are described in [Scout architecture](../architecture/gig-scout.md).

## Related Workflows

- [Search configured companies for relevant positions](../workflows/gig-scout-discovery.md)
- [Evaluate positions, review results, and pursue opportunities](../workflows/gig-scout-review-processing.md)
- [Choose between a new and existing Gig](../workflows/opportunities-posting-resolution.md)

## Related Domain Objects

- [Companies, search inputs, positions, evaluations, and decisions](../domain/gig-scout.md)
- [Candidate context and managed documents](../domain/documents-profile.md)

## Related Interfaces

- [Web workspace, HTTP endpoints, and source configuration](../interfaces/gig-scout.md)

## Related Architecture

- [Source readers, background processing, and saved results](../architecture/gig-scout.md)

## Known Constraints

Scout searches configured official sources; it does not discover arbitrary employers or search the whole web. Coverage depends on source access and configuration, and a successful discovery run does not mean every result is ready for review. Pursuit records an opportunity; it does not submit a job application.

The current position list cannot show irrelevant, rejected, or promoted states. Restoring agent-marked irrelevance, reversing decisions, and adding independent notes require backend endpoints; promotion retry has a web control.

Configured JSON description fields can declare their format and encoding. Scout normalizes those fields to readable Markdown before storing or screening them, and decodes entity-encoded HTML only when the source configuration explicitly says to do so.

A company import that changes only its display name is treated as unchanged. Omitting a company from an import does not remove it. Updating relevance criteria restarts evaluation for all unlinked positions with descriptions when screening is configured, including positions the user deferred or marked irrelevant. Explicit position reprocessing preserves those user decisions instead.

## Related documents

- [Search Configured Companies for Relevant Positions](../workflows/gig-scout-discovery.md)
- [Evaluate Positions, Review Results, and Pursue Opportunities](../workflows/gig-scout-review-processing.md)
- [Scout Companies, Positions, and Evaluations](../domain/gig-scout.md)
- [Gig Scout Interfaces](../interfaces/gig-scout.md)
- [Gig Scout Architecture](../architecture/gig-scout.md)
