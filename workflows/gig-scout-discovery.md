---
type: workflow
scope: gig-scout-discovery
summary: Search every active configured company, filter official postings, and report accepted positions and source coverage.
load_when:
  - importing career sources
  - investigating incomplete Scout runs
---
# Search Configured Companies for Relevant Positions

## Purpose

Find potential jobs for the candidate across every active company in the configured catalog, without requiring the user to visit each career site. This workflow produces recorded postings and a report of search coverage. The [evaluation and review workflow](gig-scout-review-processing.md) then determines which positions reach the user's review list.

## Actors

The job seeker starts and inspects the search. An operator configures the company catalog and career sources. Scout reads those sources and records the results.

## Trigger

The user starts a full search from Scout's Run History or through the run API. Company import is a setup step that can also be performed separately.

## Preconditions

Companies must be configured with an active flag and exactly one active official career source each. A source must describe how Scout can read its listings; sources based on reusable templates must name an available template version and valid settings. Candidate evaluation additionally needs the configured candidate profile and screening model.

## Inputs

The operator supplies company identifiers, display names, active flags, and official source settings. The user supplies title terms and preferred locations, or accepts the defaults. API callers may also supply execution batch size and concurrency.

The search profile contains listing filters. It is separate from the candidate profile used later to score fit. Empty or omitted title/location lists resolve to built-in defaults: Director, Senior Director, Sr. Director, Senior Vice President, SVP, Vice President, VP Engineering, Head of Engineering, and Head of Technology; locations Seattle, Bellevue, Redmond, Remote, and Washington. Default variants also recognize VP for Vice President and SVP for Senior Vice President.

## Normal Flow

1. The operator imports company configurations. Scout validates the complete import before saving it, creates new companies, and keeps a new configuration version when source or active settings change.
2. The user starts a full run. Scout selects every configured company currently marked active and saves the selected companies, their source settings, and the resolved search filters for that run. It also saves the candidate profile for later scoring when screening is configured.
3. Scout reads each selected company's active official source, following the source's page and extraction rules.
4. Scout checks listing titles and locations against the search profile. It records accepted postings and counts of rejected or unreadable listings, together with evidence about source coverage. Title matching ignores case and normalizes punctuation and spacing; title variants apply only to terms present in the search.
5. Each accepted posting becomes an observation of a position: a record of what that source reported during this run. A position seen before retains its identity and gains another observation. Scout schedules description retrieval and screening for downstream processing.
6. After a completely successful company search, Scout compares observed postings with tracked Gigs for the same company. Matching posting URLs or external job identifiers determine which tracked postings are available and which are missing.
7. Run History shows company results, source diagnostics, and accepted observations. The user can inspect failures and coverage while positions continue through [evaluation and review](gig-scout-review-processing.md).

## Alternate Flows

If a full run is already queued or running, starting another returns it without replacing its settings. If there are no active companies, the new run completes immediately with no company work.

Some sources can return usable postings despite incomplete coverage. Those postings are retained, but the result is partial. An empty source is successful only when its validation supports that conclusion; suspicious emptiness does not establish that jobs disappeared.

Location filtering uses individual location labels and remote/hybrid/on-site information when available. A listing saying only “3 locations,” without usable individual locations, can pass the location filter because that aggregate label does not establish a mismatch.

Identical imports do not add versions. A name-only company change is treated as unchanged. Companies omitted from an import remain in the catalog.

## Failure Behavior

An invalid import makes no partial changes. Source failures and incomplete results remain visible in run details. Exhausted background-worker retries record a failure rather than silently dropping a company.

Failed, partial, or suspiciously empty company results do not change tracked Gig availability. A run is partial if any company is partial or if successful and failed companies are mixed; all failed companies produce a failed run.

## Completion / Postconditions

A finished run records the outcome of each selected active company and the postings actually accepted. It does not guarantee full coverage of failed or partial sources, and it does not guarantee completed screening. The user gets both potential positions and enough coverage information to distinguish a quiet job market from an unsuccessful search.

## Nonfunctional Requirements

No separate search duration or throughput target is established. Current bounds are documented in [Scout architecture](../architecture/gig-scout.md).

## Related Documentation

- [Gig Scout behavior and rules](../capabilities/gig-scout.md)
- [Evaluate, review, and pursue positions](gig-scout-review-processing.md)
- [Company, run, and position concepts](../domain/gig-scout.md)
- [Run API and company source contract](../interfaces/gig-scout.md)
- [Discovery implementation](../architecture/gig-scout.md)

## Related documents

- [Gig Scout](../capabilities/gig-scout.md)
- [Scout Companies, Positions, and Evaluations](../domain/gig-scout.md)
- [Gig Scout Architecture](../architecture/gig-scout.md)
- [Gig Scout Interfaces](../interfaces/gig-scout.md)
