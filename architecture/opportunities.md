---
type: architecture
scope: opportunities
summary: Gig state validation, posting identity snapshots, record persistence, and opportunity board data flow.
load_when:
  - modifying Gig persistence, identity resolution, or board behavior
  - investigating opportunity revision and source authority
---
# Opportunity Architecture

## Purpose
Explain how the application saves and presents [tracked opportunities](../capabilities/opportunities.md), and how it checks posting matches before accepting Scout updates.

## Components
| Component | Responsibility |
| --- | --- |
| [GigDomainService](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/gig-domain-service.ts) | Validates Gig state, combines partial updates with saved data, queries records, changes availability, and resolves posting matches. It also converts nested Gig values to and from database fields. |
| [Gig schemas](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/gigs.ts) | Define complete records, accepted update fields, and posting-review result types. |
| [ChangeExecutor](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/changes.ts) | Runs a save inside a database transaction, supports validation without saving, and translates competing-write errors. |
| [DataStore](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/store.ts) | Stores current records, revision history, and fingerprints used to recognize previously recorded operations. |
| [React application](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/App.tsx) | Loads the records, presents the board and dossier, and fetches the selected job-description version. |

## Processing Model
Ordinary creation through `createNew` validates a complete Gig and initializes availability to Unknown. It rejects an exact nonnull external job ID across all companies, or a matching company/title pair after trimming and lowercasing. The agent and CLI use this path. The lower-level `create` helper accepts complete records without these duplicate checks.

Updates merge supplied fields into the current record and validate the result. They write against the revision read by the service. This is **optimistic concurrency**: the database rejects the write if the expected revision no longer matches. Ordinary updates do not accept a caller's expected revision, so they do not detect that the user based a request on an older read. An equal-value ordinary update still writes a revision.

Availability has a separate operation. It changes only availability and its timestamp, preserves application progress, and skips a write if the state is already equal. See [interface contracts](../interfaces/api/opportunities.md).

## Data Flow
The service builds each returned Gig from current fields, managed-document summaries, and interaction references ordered by start time descending. The Gig service performs the conversion between nested values, such as next action, and scalar database fields. Legacy document-presence columns were removed by [migration 0041](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/data/migrations/0041_authoritative_gig_documents.sql); saved document summaries determine what descriptions exist.

The [HTTP route](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/request-handler.ts) returns all current Gigs. The browser loads Gigs, people, and tasks together and waits for all three before showing the dashboard. Agent data-change notifications reload these lists. There is no opportunity polling loop. A refreshed list updates an open dossier or closes it if its Gig is no longer present.

[Board functions](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/client/domain/board.ts) filter and group records in the browser. The dossier selects the first job-description ID in lexical order and requests the current version named in its summary. It ignores an obsolete response when the selected Gig or document version changes.

## Posting Review and Repeated Requests
Posting resolution first restricts candidates to the same company. Company, title, and requisition comparisons trim and lowercase text; URL comparisons trim without lowercasing. A match on requisition, URL, or title is sufficient. Candidates are ordered by requisition match, URL match, title match, open status, and finally Gig ID.

A **review fingerprint** is a SHA-256 digest: a compact value computed from the incoming identity and the ordered matching records. It includes candidate IDs, revisions, match reasons, and selected job-description IDs and versions. Recomputing a different value means the reviewed data has changed. Acceptance then requires a fresh choice rather than silently using a different record. The [posting-review workflow](../workflows/opportunities-posting-resolution.md) owns the user-visible sequence.

A new posting-based Gig gets a stable ID derived from the change ID. A separate **mutation fingerprint** records the submitted posting, source metadata, and reviewed choice. Repeating the same operation can return its earlier result when this fingerprint matches and the saved posting fields still agree. Later edits to stage, outcome, or other candidate-managed fields are allowed; edits to the posting fields reject that replay.

## Guarantees
A normal save and its recorded change use the shared [persistence transaction](persistence.md). Posting acceptance and Scout's subsequent job-description promotion are separate operations; the Gig service does not make them one transaction. A successful Gig update therefore does not by itself guarantee that description content was saved.

Reviewed posting choices must match the current candidate fingerprint and, for an existing Gig, its expected revision. Ordinary record updates have the narrower concurrency protection described above.

## Failure Modes
Stale posting reviews return refreshed candidates. Invalid selections do not change a Gig. A conflicting repeated operation can report `revision_conflict`, as described in the [interface errors](../interfaces/api/opportunities.md#errors-and-compatibility).

A missing description stays visibly missing; a description read failure does not erase the Gig. A failure loading any initial Gig, people, or task list shows the dashboard error screen.

## Scaling Characteristics
Gig queries load complete records, then filter, sort, and paginate in memory. Each assembled record includes document summaries and interaction references. This implementation does not establish a response-time or supported-volume guarantee.

## Constraints
Several job descriptions can belong to one Gig. Both dossier selection and posting-match review use document ID order, not creation time, to select one.

[Scout run completion](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/scout/engine/runs.ts) checks availability after a successfully prepared company result. Within the same trimmed, case-insensitive company, an exact observed URL or external ID marks a Gig available; no match marks it unavailable. Gigs with neither URL nor external ID are skipped. Closed Gigs are eligible, and their stage remains unchanged.

## Used By
- [Opportunities](../capabilities/opportunities.md)
- [Review a posting before adding or updating a Gig](../workflows/opportunities-posting-resolution.md)

## Related Requirements
- [Shared reliability and consistency constraints](../requirements/reliability.md)

## Reading the Posting-Identity Decision

[ADR 0017](../decisions/0017-own-gig-posting-identity-resolution.md) assigns ownership of current posting identity to the Gig domain. The implemented review-candidate search also considers matching current URLs and normalized titles within a company; it does not use historical values. See the [posting-resolution workflow](../workflows/opportunities-posting-resolution.md) for the complete current matching and acceptance behavior.

## Related ADRs

- [ADR 0004: Share one domain input contract across create and update](../decisions/0004-share-domain-input-contracts.md)
- [ADR 0005: Store mutations as revisioned, audited transactions](../decisions/0005-revisioned-audited-change-transactions.md)
- [ADR 0016: Mutate domain-owned tables through the owning domain service](../decisions/0016-own-domain-table-mutations.md)
- [ADR 0017: Own Gig posting identity resolution in the Gig domain](../decisions/0017-own-gig-posting-identity-resolution.md)

## Source and Test Coverage
- [Service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/services.test.ts) cover availability, posting matches, stale choices, preserved fields, document-version changes, and repeated requests.
- [Read-service tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/read-services.test.ts) cover query defaults, ordering, filtering, and pagination.
- [Input tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/core/test/input-contracts.test.ts) cover shared schemas.
- [Board tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/test/client/domain/board.test.ts) cover view membership, filters, ordering, and Pacific dates.
- [Board browser tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/e2e/gig-board.e2e.ts) and [Scout browser tests](https://github.com/paulmccallick/gig-finder/blob/3dca919a98d25a33cf7f0bf0c6738a1c03944584/src/web/e2e/gig-scout.e2e.ts) cover dossier content and posting-review flows.

These links identify verification coverage; this documentation edit does not claim a fresh application test run.

## Related documents

- [Opportunities](../capabilities/opportunities.md)
- [Opportunity Interfaces](../interfaces/api/opportunities.md)
- [Review a Posting Before Adding or Updating a Gig](../workflows/opportunities-posting-resolution.md)
