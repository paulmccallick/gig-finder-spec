---
id: scout-run-configuration-binding
capability: gig-scout
feature: discovery-runs
title: Preserve a run's source configuration
classification: correctness
summary: Later source edits cannot change work already bound to a started run.
---

# Preserve a run's source configuration

## Scenario

| Field | Concrete value |
|---|---|
| Source | An operator updating one company's active official-source configuration. |
| Stimulus | Saves a new configuration version after a full run has snapshotted that company but before its company job executes. |
| Environment | The full run is queued or running and the company has a prior immutable configuration binding. |
| Affected capability or behavior | Discovery-run company/source execution. |
| Response | Execute that run with its snapshotted configuration ID and company name; make the newer version eligible only for later runs/reprocessing. |
| Response measure | Every source attempt in the existing run references the original configuration; zero attempt settings are taken from the later version. |
