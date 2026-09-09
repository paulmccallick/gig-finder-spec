---
type: workflow
scope: documents-profile
summary: Resolve ownership, save source content, read revisions, and replace editable content safely.
load_when:
  - tracing a document save or revision conflict
  - understanding upload-to-managed-document boundaries
related:
  - capabilities/documents-profile.md
  - domain/documents-profile.md
  - interfaces/api/documents-profile.md
  - architecture/documents-profile.md
---
# Maintain and Reuse Documents

## Purpose
Preserve supplied content with intended owners and safely evolve editable documents.

## Actors
Job seeker, agent or CLI, and document service.

## Trigger
A user asks to save supplied text or an uploaded attachment, read supporting context, or revise a document.

## Preconditions
Gig and Person owners already exist; candidate context uses the singleton Profile. A staged attachment must still be available when saving it.

## Inputs
Owner links, type, optional descriptive metadata, content or staged reference; for updates, managed ID, expected version, replacement content, and change summary.

## Normal Flow
1. Resolve intended owners. The agent can search gigs and people by names and use returned durable identities. Its document instructions call for clarification when ownership or intent is ambiguous.
2. For creation, use supplied inline content or the converted staged attachment. Saving an attachment copies its Markdown and provenance into an immutable uploaded source document.
3. Validate ownership and content; create metadata, links, first version, and change together.
4. Discover by owner or candidate catalog. Read by exact managed ID and optionally select a historical version.
5. For an editable document, read its current version, supply full replacement content with that expected version, and append a new version on successful change.
6. Present the friendly name and whether creation or a changed update occurred. Version-specific browser links continue showing the selected version after later edits.

## Alternate Flows
Identical content at the expected version completes unchanged. Historical reads report both selected and current versions so the agent can retain historical fidelity or reread current content. Candidate document changes also refresh a derived file copy; managed content remains authoritative.

Upload conversion accepts PDF, DOCX, and Markdown, yielding Markdown and provenance for staging. Conversation attachment, discarding, expiry, and staged-save retry behavior belong to the [conversational-agent lifecycle](conversational-agent-turn.md).

## Failure Behavior
Invalid content/ownership is rejected. Missing owners/documents or unavailable versions cannot be read or updated. Stale expected versions fail without appending a version; reread before preparing another update. Uploaded sources reject updates. Database transaction failure leaves no partial document/version/change.

A postcommit candidate file-copy failure leaves the database change committed and the copy pending retry. Opening the local application synchronizes candidate files; a failure during startup synchronization propagates to the caller.

## Completion / Postconditions
Creation yields a stable ID and version 1. A changed update yields a new current version and retains earlier content. Reads identify the selected revision.

## Nonfunctional Requirements
Concurrency and retention constraints are defined in the [capability](../capabilities/documents-profile.md#capability-specific-nonfunctional-requirements).

## Related Documentation
- [Domain concepts](../domain/documents-profile.md)
- [Interface details](../interfaces/api/documents-profile.md)
- [Implementation and evidence](../architecture/documents-profile.md)
