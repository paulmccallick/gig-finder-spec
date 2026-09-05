---
id: scout-source-policy-bounds
capability: gig-scout
feature: discovery-runs
title: Bound an unending or oversized source scan
classification: performance
summary: Source traversal stops at implemented request, page, record, response-size, and duration limits.
---

# Bound an unending or oversized source scan

## Scenario

| Field | Concrete value |
|---|---|
| Source | The active official source during a full company scan. |
| Stimulus | The next request, page, accepted record, response byte, or elapsed duration would exceed its configured source-policy maximum. |
| Environment | A normal company scan with any earlier validated positions retained. |
| Affected capability or behavior | Bounded external-source acquisition and partial-result preservation. |
| Response | Stop further source requests, record bounded failure/diagnostics, and preserve earlier validated positions as partial when any exist. |
| Response measure | Requests/pages/accepted records and bytes never exceed configured maxima; defaults are 2,500 requests, 2,000 pages, 10,000 records, 6 MB listing/1 MB detail, 30 minutes per source, and 15 seconds per request. |
