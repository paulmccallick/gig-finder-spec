---
type: domain
scope: application
summary: The records used to organize a job search and how they relate.
load_when:
  - understanding how job-search information fits together
---

# Domain Model

The candidate discovers roles, chooses which ones to pursue, talks with people, and completes work along the way. GigFinder keeps separate records for those things so each can be found and updated without rewriting the others.

| Record | What it represents and how it connects |
|---|---|
| [Gig / opportunity](opportunities-gig.md) | A role the candidate is tracking. People, tasks, interactions, and documents can be associated with it. |
| [Person](networking.md) | A professional contact. A person can be involved in several roles and interactions, and have related tasks and documents. |
| [Gig-person relationship](networking.md) | The person's role in a particular opportunity, such as recruiter or hiring manager. It is separate from how well the candidate knows that person. |
| [Task](tasks-task.md) | Work to do for a role, a person, or the general search. A task has its own status and due date; completing it does not automatically change a Gig's next action. |
| [Interaction](interactions.md) | An email, call, meeting, interview, or other exchange with one or more contacts, optionally linked to a Gig. It records what happened or is planned. |
| [Managed document](documents-profile.md) | Saved text attached to a role, person, or the candidate. Earlier versions remain readable after an editable document changes. |
| [Candidate profile](documents-profile.md) | Structured information about the candidate, including experience and preferences. It is separate from saved candidate documents. |
| [Scout company and source](gig-scout.md) | A company to search and instructions for retrieving its postings. |
| [Scout position](gig-scout.md) | A posting found during a search, with its description, evaluations, and review state. It can later be connected to a new or existing Gig. |
| [Scout run](gig-scout.md) | One search across the selected companies. Finding postings and evaluating them are separate stages, so evaluations can continue after a search run ends. |
| [Conversation](conversational-agent-conversation.md) | Messages exchanged between the candidate and assistant, including tool activity and document references. |
| [Change](../architecture/persistence.md) | A saved record of a supported update, used to explain who changed data and, where supported, undo that change. |

A person can appear in an interaction without having a separate role in its associated Gig. The person's last-contact details are calculated from their completed interactions; see [recording and correcting contact history](../workflows/interactions-contact-history.md).

The [application overview](../APPLICATION.md) describes the capabilities that operate on these records. The [glossary](terminology.md) defines terms such as revision and promotion. Database and file details belong in [persistence](../architecture/persistence.md).

## Related documents

- [GigFinder](../APPLICATION.md)
- [Glossary](terminology.md)
- [Persistence](../architecture/persistence.md)
