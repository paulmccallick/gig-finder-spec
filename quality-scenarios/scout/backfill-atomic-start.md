---
id: scout-backfill-atomic-start
capability: gig-scout
feature: position-reprocessing
title: Reject a mixed-invalid explicit backfill
classification: safety
summary: One unresolved requested position prevents any partial reprocessing run from starting.
---

# Reject a mixed-invalid explicit backfill

## Scenario

| Field | Concrete value |
|---|---|
| Source | An operator requesting explicit reprocessing of exact position IDs. |
| Stimulus | At least one requested position lacks an observation, active configuration, usable authoritative detail plan, or description identity input. |
| Environment | Other requested positions are otherwise valid during preview/start. |
| Affected capability or behavior | Position-backfill validation and durable run creation. |
| Response | Reject the entire start and identify every rejected position with its stable reason. |
| Response measure | Zero backfill run, item, processing, or queue rows are created for the rejected request. |
