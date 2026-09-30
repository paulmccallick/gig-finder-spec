---
type: capability
scope: opportunities
summary: Opportunity pipeline, independent availability, creation and posting resolution, and board behavior.
load_when:
  - understanding Gig lifecycle and opportunity views
  - changing opportunity capture, updates, or posting identity
related:
  - domain/opportunities-gig.md
  - workflows/opportunities-posting-resolution.md
  - interfaces/api/opportunities.md
  - architecture/opportunities.md
---
# Opportunities

## Purpose
Maintain the candidate's opportunity pipeline, current assessments and next actions, with links to the actual posting and managed supporting documents.

## Actors
The candidate viewing the board, conversational agent acting through tools, CLI user, and [Gig Scout](gig-scout.md) supplying official posting observations and accepted opportunities.

## Functional Behavior
Users can discover, create, read, and update Gigs. Each carries company/title, posting identity and URL, pipeline stage/outcome, status narrative, last-activity date, optional next action, fit assessment, compensation, tags, and optional role details. Related people, tasks, interactions, and documents retain their own identities.

Creation through the conversational tool is instructed to follow explicit user confirmation and duplicate resolution. Ordinary creation rejects an existing exact external job ID or a case-insensitive company/title pair. Scout posting acceptance uses a separate reviewed candidate-resolution process: matches suggest reuse but never silently merge. See [posting resolution](../workflows/opportunities-posting-resolution.md).

The opportunity board is read-only; changes occur through agent tools, CLI, and Scout operations. Clicking a card opens its dossier. Apply / view posting uses the Gig's captured source URL; missing URLs display an explicit unavailable message. The description panel reads the selected managed job-description version, supports expand/collapse, and links to its version-specific document viewer. No legacy file fallback supplies missing content.

## Business Rules
- A Gig requires company, title, status summary, valid last-activity date, stage, outcome, and fit rating.
- Nonclosed stages require outcome `pending`. Closed stage requires a nonpending outcome and no next action.
- A next action needs nonblank description; its due date may be null. Last activity, due date, and posted date use valid calendar dates.
- Compensation is optional, USD, hourly or annual, with nonnegative nullable bounds. If both bounds exist, minimum cannot exceed maximum.
- Availability is independent of pipeline stage/outcome. Ordinary creation initializes it to `unknown`; ordinary input cannot assign availability or its timestamp. Dedicated observation updates set available/unavailable and change the timestamp only when the state changes.
- Updating availability does not close a Gig, change fit, or remove its next action. A repeated equal availability value creates no change.
- Partial updates preserve omitted fields and merge nested next-action, fit, and pay fields. Clearing the full next action or pay range is explicit. Tags are replaced as an array.

## State and Lifecycle
The [Gig domain](../domain/opportunities-gig.md) lists supported stages, outcomes, fit ratings, and availability states. There is no enforced sequential stage progression: any resulting combination satisfying the lifecycle rules can be saved, including reopening with pending outcome.

| Board view | Membership and presentation |
| --- | --- |
| Active | Nonclosed Gigs with available or unknown availability, grouped by pipeline stage. |
| Unavailable | Nonclosed unavailable Gigs in one list, newest valid availability timestamp first; cards retain pipeline stage and show unavailable-since date. |
| Archive | All closed Gigs regardless of availability, grouped into rejected, not pursuing, role pulled, no response, or Other. |

All views support case-insensitive company/title/status/next-action search and fit filters. Active/Unavailable additionally support stage and overdue filters. Overdue means a nonclosed Gig's next-action due date is before today in America/Los_Angeles. Ordinary board ordering prioritizes overdue, then due date, most recent activity, then company. Missing/invalid unavailable timestamps follow valid ones, with ordinary ordering as fallback.

Entering Archive clears stage/overdue filters while preserving search/fit. Counts reflect the unfiltered view. Applications counts Gigs currently at applied, including unavailable ones; Actions overdue includes unavailable nonclosed Gigs.

## Capability-Specific Nonfunctional Requirements
Mutations retain audited revisions and enforce valid final state. Reviewed posting choices are invalidated when the candidate snapshot changes. No numeric response-time or capacity objective was established by inspected contracts.

## Related Workflows
- [Resolve an incoming posting](../workflows/opportunities-posting-resolution.md)

## Related Domain Objects
- [Gig](../domain/opportunities-gig.md)

## Related Interfaces
- [Opportunity interfaces](../interfaces/api/opportunities.md)

## Related Architecture
- [Opportunity implementation](../architecture/opportunities.md)

## Known Constraints
The agent's default unfiltered discovery is narrower than the board's Active view: it selects applied, recruiter contact, screening, and technical interview stages and does not filter availability. Neither the board nor the source link submits an application or changes stage automatically. Multiple job descriptions are allowed; the dossier chooses the lexically first managed ID, not the newest-created document.
