---
id: reversal-later-edit-conflict
capability: conversational-agent
feature: change-reversal
title: Protect later edits from reversal
classification: safety
summary: Reversal cannot overwrite a later revision of any affected record.
---

# Protect later edits from reversal

## Scenario

| Field | Concrete value |
|---|---|
| Source | A candidate confirming reversal of an exact earlier change. |
| Stimulus | Requests reversal after at least one affected record received a later committed edit. |
| Environment | The original change is present and otherwise reversible, but recorded/current revisions no longer match. |
| Affected capability or behavior | Audited multi-record change reversal. |
| Response | Reject the reversal as a revision conflict without restoring any recorded prior state. |
| Response measure | Every affected record and audit-change count remain unchanged by the failed reversal. |
