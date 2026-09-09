---
type: workflow
scope: gig-scout-discovery
summary: Company import and full-run discovery, including result classification and tracked posting availability.
load_when:
  - importing career sources
  - investigating incomplete Scout runs
related:
  - capabilities/gig-scout.md
  - domain/gig-scout.md
  - architecture/gig-scout.md
  - interfaces/gig-scout.md
---
# Import Companies and Discover Positions

## Purpose

Import official company sources and discover positions with traceable observations.

## Actors

Operator, user, Scout workers, and source servers.

## Trigger

An operator imports sources or a user starts a full discovery run through run history or the API.

## Preconditions

Template-based sources require a resolvable template and valid variables/overrides.

## Inputs

Import supplies company IDs, names, active flags, and source configurations. Full-run settings optionally specify batch size, concurrency, and search profile.

## Normal Flow

1. Validate the entire import before writing. A company must have exactly one active source. Create new companies, retain identical configurations, and version changed configurations in one import transaction.
2. On start, reuse an existing active full run or snapshot all active companies and their current configurations into a new run. Save the resolved search profile and candidate-profile snapshot when screening is configured.
3. Dispatch one job per company. Read each active source using its configured extraction and pagination rules.
4. Normalize positions and apply title/location filtering. Preserve source attempts, counters, diagnostics, and accepted observations.
5. Establish durable position identities and enqueue downstream position processing independently of company discovery completion.
6. For a successful company result, compare observed positions with tracked Gigs for that company and update posting availability. Complete the company result and roll up run status.
7. Display run history, company/source details, and paginated observations. Position processing can continue after the run reaches its terminal discovery status.

## Alternate Flows

An empty catalog creates an immediately completed run. Partial source results can retain positions but yield a partial company/run. Verified empty success can mark known postings unavailable; suspicious emptiness cannot. An unchanged import does not create another version, and a name-only change is unchanged because the comparison excludes the name.

Default full-run terms target director/VP/head roles and locations Seattle, Bellevue, Redmond, Remote, and Washington. Title matching uses normalized token sequences and enabled term variants. Locations use structured labels/work arrangements; an aggregate label such as “3 locations” with no usable detail is allowed through rather than conclusively rejected.

## Failure Behavior

Invalid imports return rejection counts with no partial import writes. Source results distinguish failure, partial coverage, and suspicious empty results. Exhausted worker retries record infrastructure failure. A partial company or failed company does not reconcile Gig availability. Run status is partial when some companies succeed and some fail, or any company is partial; all failures yield failed.

## Completion / Postconditions

A terminal full run records the result of each selected company and the observations actually accepted. It does not promise complete coverage for partial/failed sources or completed downstream screening.

## Nonfunctional Requirements

No separate workflow latency or throughput target is established. [Architecture](../architecture/gig-scout.md) documents current bounds.

## Related Documentation

[Capability](../capabilities/gig-scout.md) · [Domain](../domain/gig-scout.md) · [Interfaces](../interfaces/gig-scout.md) · [Processing workflow](gig-scout-review-processing.md)
