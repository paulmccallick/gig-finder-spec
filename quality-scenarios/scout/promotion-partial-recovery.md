---
id: scout-promotion-partial-recovery
capability: gig-scout
feature: review-promotion
title: Reconcile a Gig committed before document failure
classification: recoverability
summary: Promotion retry resumes an exact persisted intent without duplicating already committed effects.
---

# Reconcile a Gig committed before document failure

## Scenario

| Field | Concrete value |
|---|---|
| Source | The promotion coordinator retrying a failed accepted pursue intent. |
| Stimulus | The deterministic Gig create/update committed, but authoritative job-description creation/version or final position completion failed. |
| Environment | Promotion is failed on a processing position and retains exact evidence, resolution, target, and change identities. |
| Affected capability or behavior | Cross-record promotion recovery and idempotency. |
| Response | Verify/reuse the committed Gig, repair or verify exactly one selected job description, then complete/link the promotion only after both match intent. |
| Response measure | Retry creates no second Gig change and at most one deterministic document version; position becomes promoted only with the exact linked Gig, reviewed document content, and—when retry creates a version—exact reviewed provenance. |
