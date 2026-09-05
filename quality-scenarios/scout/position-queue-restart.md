---
id: scout-position-queue-restart
capability: gig-scout
feature: position-processing
title: Recover missing position processing after restart
classification: recoverability
summary: Durable pending semantic work is redispatched by its existing identity.
---

# Recover missing position processing after restart

## Scenario

| Field | Concrete value |
|---|---|
| Source | A process restart with missing or unknown position queue jobs. |
| Stimulus | Reconciliation finds pending durable processing/outbox state. |
| Environment | Description, relevance, or candidate-match work has a stable semantic processing identity. |
| Affected capability or behavior | Position-processing dispatch, attempts, and evidence idempotency. |
| Response | Recreate the deterministic job, resume the earliest applicable stage, and reuse already completed exact evidence. |
| Response measure | At most the first 1,000 ordered items are considered per sweep; no duplicate processing/evaluation row is created for the same semantic input identity. |
