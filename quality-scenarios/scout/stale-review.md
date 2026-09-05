---
id: scout-stale-review
capability: gig-scout
feature: review-promotion
title: Reject a decision against stale evidence
classification: safety
summary: A reviewer cannot act on superseded state or screening evidence.
---

# Reject a decision against stale evidence

## Scenario

| Field | Concrete value |
|---|---|
| Source | A reviewer submitting pursue, irrelevant, or defer from an open drawer. |
| Stimulus | The position revision, description, relevance evaluation, or candidate-match evaluation changed after the drawer loaded. |
| Environment | The position still exists but submitted reviewed values are no longer all current. |
| Affected capability or behavior | Review decision concurrency and promotion authorization. |
| Response | Reject with conflict, return current state for rereview, and create no decision or promotion intent. |
| Response measure | Decision/promotion counts and position revision are unchanged by the stale submission. |
