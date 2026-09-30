---
type: domain
scope: application
summary: Definitions of GigFinder terms used in behavior and implementation documents.
load_when:
  - looking up an unfamiliar application term
---

# Glossary

| Term | Meaning |
|---|---|
| [Gig / opportunity](opportunities-gig.md) | A role the candidate has chosen to track. |
| [Pipeline stage](opportunities-gig.md) | Where a role stands in the candidate's process, such as identified, applied, or interviewing. The outcome records how pursuit ended. |
| [Availability](opportunities-gig.md) | Whether the employer's posting is known to be available, unavailable, or not yet checked. It does not say whether the candidate wants the role. |
| [Person](networking.md) | A professional contact, such as a recruiter, colleague, or hiring manager. |
| [Latest contact](../workflows/interactions-contact-history.md) | The date, channel, and summary taken from the most recent completed interaction with a person. |
| [Task](tasks-task.md) | Work to do, with a priority, status, and optional due date. |
| [Interaction](interactions.md) | A recorded communication or event involving contacts. It can describe a plan or a completed exchange. |
| [Managed document](documents-profile.md) | Text or Markdown saved by the application with an ID and version history. |
| [Staged document](conversational-agent-conversation.md) | An uploaded document held temporarily for the assistant to read or save. Uploading alone does not make it a managed document. |
| [Candidate profile](documents-profile.md) | Structured information about the candidate used for advice and candidate-fit scoring. |
| [Scout source](gig-scout.md) | The configured location and retrieval instructions for a company's postings. |
| [Scout position](gig-scout.md) | A posting found by Scout; the candidate may or may not pursue it. |
| [Discovery](../workflows/gig-scout-discovery.md) | Searching configured companies and collecting matching postings. |
| [Processing](../workflows/gig-scout-review-processing.md) | Fetching a position's description and evaluating its relevance and candidate fit. |
| [Relevance](gig-scout.md) | Whether a posting meets the configured job criteria. Candidate matching separately assesses how well the candidate fits it. |
| [Promotion](../workflows/gig-scout-review-processing.md) | Adding a pursued Scout position to a new Gig or connecting it to an existing Gig, together with its job description. |
| [Revision](../architecture/persistence.md) | A record's update number. Some operations compare it with an earlier read to reject an edit based on outdated information. |
| [Change](../architecture/persistence.md) | A recorded application operation that may update several related records together. Only supported changes can be undone. |

See the [domain model](model.md) for relationships between these concepts and the [application overview](../APPLICATION.md) for their purpose in the job search.

## Related documents

- [Domain Model](model.md)
- [GigFinder](../APPLICATION.md)
