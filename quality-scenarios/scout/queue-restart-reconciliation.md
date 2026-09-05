---
id: scout-discovery-queue-restart
capability: gig-scout
feature: discovery-runs
title: Recover missing company queue work after restart
classification: recoverability
summary: Durable nonterminal company work is recreated without duplicating domain evidence.
---

# Recover missing company queue work after restart

## Scenario

| Field | Concrete value |
|---|---|
| Source | A process restart with queue state missing or unknown. |
| Stimulus | Startup reconciliation finds a durable nonterminal run-company/outbox item without a live known job. |
| Environment | The database retains the accepted full run and deterministic company job identity. |
| Affected capability or behavior | Discovery company dispatch and restart recovery. |
| Response | Recreate the deterministic durable queue job and continue processing or project exhausted failure. |
| Response measure | The item is considered within the first bounded 1,000-item reconciliation sweep, newly added queue durability is checked within five seconds, and no second run-company row is created. |
