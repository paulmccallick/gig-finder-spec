---
type: capability
scope: opportunities
summary: Track applications through outcome, compare recorded fit, and keep the next action visible.
load_when:
  - understanding Gig lifecycle and opportunity views
  - changing opportunity capture, updates, or posting identity
---
# Opportunities

## Purpose
Help a job seeker track roles from discovery through applications, interviews, and a final outcome. The opportunity board brings together progress, fit assessments, and next actions so the candidate can compare roles and decide what needs attention.

## Actors
The candidate reviews opportunities and asks the [conversational agent](conversational-agent.md) to record changes. [Gig Scout](gig-scout.md) supplies discovered postings and observations about whether roles are still available. A command-line interface also supports record maintenance.

## Functional Behavior
Each tracked role is a **Gig**. It records the company and title, application progress, current status, most recent activity, fit assessment, and an optional next action with a due date. It can also hold a posting link, compensation, location, working arrangement, and other role details.

The board helps the candidate review these records by stage, search for a role, filter by recorded fit, and find overdue next actions. Selecting a card opens the **Gig dossier**, a detail panel with the role's information and saved job description. “Apply / view posting” opens the saved posting URL. If no URL or description has been saved, the panel says so.

The board itself is read-only. The candidate can create and update roles through the agent or command-line interface. The agent's creation instructions require explicit confirmation and a duplicate check. Ordinary creation rejects an existing exact external job ID or a company/title pair that differs only in capitalization or surrounding spaces.

Scout can add a new opportunity or refresh a tracked one. When a posting resembles an existing Gig, the candidate chooses whether it is the same opportunity or a separate role; the application does not silently combine them. See [posting review](../workflows/opportunities-posting-resolution.md).

[People](networking.md), [tasks](tasks.md), [interactions](../domain/interactions.md), and [documents](documents-profile.md) can be associated with a Gig. Each remains a separate record with its own behavior.

## Business Rules
- Company, title, status summary, last-activity date, stage, outcome, and fit rating are required.
- Every stage except Closed has outcome Pending. Closing requires another outcome and clearing the next action.
- A next action requires a description; its due date is optional. Last activity, due date, and posted date must be valid calendar dates.
- Compensation is optional and expressed in USD per hour or year. Bounds can be unknown, but known values must be nonnegative and the minimum cannot exceed the maximum.
- Posting availability is independent of application progress. A role becoming unavailable does not close the Gig, change its fit, or remove its next action.
- New Gigs start with unknown availability. Scout observations can mark them available or unavailable. The recorded availability date changes only when availability changes.
- Updates retain fields that were not supplied. Changing part of the next action, fit assessment, or pay range preserves the rest; removing the entire next action or pay range must be explicit. A supplied tag list replaces the old list.

## State and Lifecycle
The [Gig model](../domain/opportunities-gig.md) defines stages, outcomes, fit ratings, and availability. Stages need not be followed in order. A closed Gig can reopen if its outcome returns to Pending.

| Board view | What the candidate sees |
| --- | --- |
| Active | Roles that are not closed and whose postings are available or unknown, grouped by application stage. |
| Unavailable | Roles that are not closed but whose postings are unavailable, with the most recent availability changes first. Their application stages remain visible. |
| Archive | All closed roles, grouped into Rejected, Not Pursuing, Role Pulled, No Response, or Other. |

All views support search across company, title, status, and next-action text, plus fit filtering. Active and Unavailable also offer stage and overdue filters. An action is overdue when its due date is before today in Pacific time and its Gig is not closed.

Within ordinary board groups, overdue actions appear first, followed by earliest due date, most recent activity, and company name. Unavailable uses availability-change time first, with missing or invalid times last and ordinary ordering to break ties.

Opening Archive clears the stage and overdue filters but preserves search and fit. View counts ignore filters. “Applications” counts roles currently at Applied, including unavailable postings; it is not a count of every application ever submitted. “Actions overdue” also includes unavailable roles that are not closed.

## Capability-Specific Nonfunctional Requirements
Saved changes retain an audit history and must satisfy the record rules. If an existing opportunity changes after a posting match was reviewed, the application requires a fresh review before accepting that choice. No numeric performance or capacity target is established.

## Related Workflows
- [Review a posting before adding or updating a Gig](../workflows/opportunities-posting-resolution.md)

## Related Domain Objects
- [Gig: attributes, relationships, and states](../domain/opportunities-gig.md)

## Related Interfaces
- [Opportunity reads and updates](../interfaces/api/opportunities.md)

## Related Architecture
- [Opportunity implementation](../architecture/opportunities.md)

## Known Constraints
Opening the posting link does not submit an application or change the recorded stage. Fit filters compare saved assessments; the board does not calculate fit.

The agent's default opportunity list includes only Applied, Recruiter Contact, Screening, and Technical Interview, regardless of availability. It therefore differs from the board's Active view.

A Gig can have several job descriptions. The dossier displays the one selected by document ID order, which is not necessarily the newest description. See the [document selection contract](../interfaces/api/opportunities.md#http-and-browser).

## Related documents

- [Gig](../domain/opportunities-gig.md)
- [Review a Posting Before Adding or Updating a Gig](../workflows/opportunities-posting-resolution.md)
- [Opportunity Interfaces](../interfaces/api/opportunities.md)
- [Opportunity Architecture](../architecture/opportunities.md)
