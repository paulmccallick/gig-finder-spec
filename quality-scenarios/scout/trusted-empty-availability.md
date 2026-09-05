---
id: scout-trusted-empty-availability
capability: gig-scout
feature: discovery-runs
title: Reject suspicious empty evidence
classification: trust
summary: An unrecognized empty source cannot turn absence into tracked-Gig unavailability.
---

# Reject suspicious empty evidence

## Scenario

| Field | Concrete value |
|---|---|
| Source | The active official source for a configured company. |
| Stimulus | Returns no accepted positions without a recognized listing surface and explicit empty-state evidence. |
| Environment | A full run includes previously available Gigs with exact comparable source URL or requisition identities for that company. |
| Affected capability or behavior | Source trust classification and posting-availability reconciliation. |
| Response | Classify the source as suspicious empty, make the company fail, and preserve all prior Gig availability. |
| Response measure | Exactly zero Gig availability values, timestamps, revisions, or audit changes are created by the suspicious-empty company result. |
