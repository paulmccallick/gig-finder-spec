---
type: architecture
scope: documents-profile
summary: Document authority, transactional versions, profile projections, discovery, conversion, and code evidence.
load_when:
  - modifying document persistence or candidate loading
  - diagnosing revision conflicts or profile file synchronization
related:
  - capabilities/documents-profile.md
  - interfaces/api/documents-profile.md
  - workflows/documents-profile-maintenance.md
---
# Document and Profile Architecture

## Purpose
Explain implementation behind the [document capability](../capabilities/documents-profile.md), without treating runtime defaults as service-level requirements.

## Components
- [ManagedDocumentService](../../gig-finder/src/core/managed-document-service.ts) validates ownership and schemas, computes SHA-256 content hashes, creates IDs, and checks immutability/versions.
- [ApplicationDocumentReader](../../gig-finder/src/core/document-reader.ts) provides owner discovery, version metadata pages, and bounded current/historical reads.
- [SQLite repositories](../../gig-finder/src/data/document-store.ts) persist metadata, links, and full versions. Current reads join the selected version, never external files.
- [DataStore](../../gig-finder/src/data/store.ts) provides the transaction/change boundary and retries pending candidate file materialization after commit.
- [LocalProfileDocumentFiles](../../gig-finder/src/data/profile-document-files.ts) writes derived copies. [Local composition](../../gig-finder/src/data/local-application.ts) synchronizes them at startup.
- [Profile loader](../../gig-finder/src/agent/profile-loader.ts) validates independent JSON. [Web composition](../../gig-finder/src/web/app.ts) loads it at startup for agent and Scout screening, and supplies a callback for live candidate catalog metadata.

## Processing Model and Authority
Creation validates links, verifies gig/person owners inside the change transaction, inserts metadata/links, then version 1. A changed update appends a version and conditionally advances `current_version` using its expected predecessor. The change row and document writes share a SQLite transaction. The equal-content fast path runs only at the expected version and creates no change.

Title, type, ownership, media type, original source description, and upload provenance remain stable through content updates. Optional official-source description/provenance belongs to the newly appended version, not document-level metadata. Upload provenance makes the service reject content updates.

Managed content is authoritative for gig documents. The [authoritative-document migration](../../gig-finder/src/data/migrations/0041_authoritative_gig_documents.sql) removes legacy gig/history document-presence flags. Candidate files are projections, not another managed-content read source.

## Candidate File Projection
Candidate documents receive a basename from title slug and ID suffix, with `.md` extension even for plain-text media type. Writes resolve under one configured directory, reject paths outside its immediate root, write a temporary file, then rename it into place. The materialized version marker advances only if that version remains current.

After commit, pending copies are retried individually. Failure is reported and leaves the marker pending without replaying the mutation. Startup synchronization rewrites every candidate document, including already materialized ones, repairing missing or edited copies. Startup errors propagate; they do not take the postcommit reporting path. Without a configured materializer, database behavior continues without file writes.

[Context resolution](../../gig-finder/src/data/context.ts) chooses structured profile by environment override, configuration, then `profile/candidate-profile.json` with legacy `profile/job-search-profile.json` fallback. Candidate document directory defaults to `profile/documents`. Operational path configuration belongs in operations documentation.

## Discovery and Agent Boundary
There is no document full-text index. [Context search](../../gig-finder/src/core/context-search.ts) resolves gig company/person names through entity queries, normalized matching, deduplication, and bounded results. Candidate catalog generation omits bodies. [Agent instructions](../../gig-finder/src/agent/system-prompt.ts) delimit escaped catalog JSON as untrusted metadata and direct exact-ID reads when relevant. Structured profile data is startup-loaded; catalog metadata is supplied through a live callback.

[LocalDocumentConverter](../../gig-finder/src/web/document-conversion.ts) converts before the [upload handler](../../gig-finder/src/web/document-upload-handler.ts) stages the result. DOCX uses Mammoth/Turndown after archive layout and declared expanded-size checks; PDF uses PDF.js text extraction; Markdown uses strict UTF-8. Conversion emits Markdown and source-byte provenance. Staging/conversation ownership and eventual save remain agent concerns; only explicit save enters ManagedDocumentService.

## Guarantees and Failure Modes
Stale writes fail and prior versions remain unchanged. Transaction rollback prevents partial metadata/version/change writes. Explicit duplicate change IDs prevent repeat committed writes by rejection. Service alias acceptance is broader than content-reader/HTTP acceptance; use returned raw IDs.

Persisted links with zero or multiple targets fail consistency validation. File errors can leave copies stale despite a successful database update. Converted formatting/images do not round-trip through text downloads.

## Evidence and Verification Coverage
- [Persistence tests](../../gig-finder/src/data/test/document-store.test.ts): ownership, multi-owner discovery, historical content/provenance, rollback, stale updates, duplicate changes, file synchronization/retry.
- [CLI tests](../../gig-finder/src/cli/test/documents.test.ts): command contracts.
- [Context search tests](../../gig-finder/src/core/test/context-search.test.ts): name resolution and truncation.
- [Upload tests](../../gig-finder/src/web/test/document-upload-handler.test.ts) and [conversion tests](../../gig-finder/src/web/test/document-conversion.test.ts): staging boundary and rejected inputs.
- [Tool tests](../../gig-finder/src/agent/test/gig-finder-tools.test.ts) and [prompt tests](../../gig-finder/src/agent/test/gig-finder-agent.test.ts): staged save and untrusted catalog escaping.
- [HTTP tests](../../gig-finder/src/web/test/request-handler.test.ts) and [viewer tests](../../gig-finder/src/web/test/client/document-viewer.test.ts): version routes, downloads, invalid IDs.

Test sources were inspected as evidence; this documentation task does not claim a fresh application test run. No rationale is inferred where implementation alone establishes a mechanism.
