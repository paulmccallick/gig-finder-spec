---
id: scout-low-confidence-relevance
capability: gig-scout
feature: position-processing
title: Preserve low-confidence relevance uncertainty
classification: correctness
summary: A below-threshold exclusion result remains evidence but cannot suppress candidate scoring or review.
---

# Preserve low-confidence relevance uncertainty

## Scenario

| Field | Concrete value |
|---|---|
| Source | The relevance screening model. |
| Stimulus | Returns a fails-relevance decision with confidence below the bound criteria threshold. |
| Environment | Normal position processing with a valid description and current criteria identity. |
| Affected capability or behavior | Relevance exclusion gate and candidate-match stage scheduling. |
| Response | Persist the relevance evaluation but do not project agent-owned irrelevant; schedule candidate-match scoring from that exact evaluation. |
| Response measure | Exactly one matching downstream score work item exists and the position is not made irrelevant solely by the below-threshold decision. |
