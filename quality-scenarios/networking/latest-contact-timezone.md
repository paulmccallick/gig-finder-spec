---
id: latest-contact-timezone
capability: networking
feature: contact-recency
title: Derive the latest contact across a local-date boundary
classification: correctness
summary: Absolute ordering and declared timezone produce one consistent latest-contact projection.
---

# Derive the latest contact across a local-date boundary

## Scenario

| Field | Concrete value |
|---|---|
| Source | A candidate completing an Interaction for a known Person. |
| Stimulus | Records a newer absolute start instant whose declared timezone places it on a different local calendar date. |
| Environment | The Person already has an older completed Interaction. |
| Affected capability or behavior | Person latest-contact date, method, and summary projection. |
| Response | Select the newer absolute instant and project its date in the declared IANA timezone. |
| Response measure | Every Person read surface returns the same projected values, while the Person record receives no direct-field or revision update. |
