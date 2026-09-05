---
id: scout-company-redelivery
capability: gig-scout
feature: discovery-runs
title: Reconcile company-job redelivery
classification: recoverability
summary: Redelivering prepared or completed company work cannot duplicate historical evidence or downstream work.
---

# Reconcile company-job redelivery

## Scenario

| Field | Concrete value |
|---|---|
| Source | The durable company-work queue. |
| Stimulus | Delivers the same deterministic company job after result preparation or terminal completion. |
| Environment | Attempts, observations, position work, and possibly availability changes already exist for that job. |
| Affected capability or behavior | Company result persistence and terminal run aggregation. |
| Response | Reuse stable identities, verify existing effects, and preserve the same terminal company/run projection. |
| Response measure | Counts of source attempts, observations, positions, processing outbox rows, and audited availability effects do not increase from redelivery. |
