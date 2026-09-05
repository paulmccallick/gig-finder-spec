---
id: staging-capacity-bound
capability: conversational-agent
feature: upload-staging
title: Bound temporary upload memory
classification: performance
summary: Staging rejects a new converted document before configured process capacity is exceeded.
---

# Bound temporary upload memory

## Scenario

| Field | Concrete value |
|---|---|
| Source | Candidates staging supported documents in one running process. |
| Stimulus | A valid converted upload would exceed the configured document-count or aggregate-character capacity. |
| Environment | Existing unexpired staged documents already consume the remaining configured capacity. |
| Affected capability or behavior | Temporary upload staging and capacity isolation. |
| Response | Reject the new staged entry with a visible capacity failure and retain existing entries. |
| Response measure | Stored staged-document count and aggregate characters never exceed the configured limits; defaults are 20 entries and 500,000 characters. |
