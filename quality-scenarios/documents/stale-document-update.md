---
id: stale-document-update
capability: documents-profile
feature: managed-documents
title: Reject a stale document replacement
classification: correctness
summary: A stale writer cannot append a version over a newer current document.
---

# Reject a stale document replacement

## Scenario

| Field | Concrete value |
|---|---|
| Source | A candidate or confirmed agent updating an editable managed document. |
| Stimulus | Submits complete replacement content with an expected version older than the current version. |
| Environment | The document exists, is not an uploaded immutable source, and another successful update already advanced it. |
| Affected capability or behavior | Managed-document version update and immutable history. |
| Response | Reject the replacement as a revision conflict and retain the newer current content/history. |
| Response measure | Current version, content hash, version count, and audit-change count are unchanged by the rejected request. |
