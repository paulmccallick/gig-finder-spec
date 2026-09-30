---
type: capability
scope: tasks
summary: Task creation, editing, completion, related records, prioritization, and read-only task board behavior.
load_when:
  - understanding task behavior and completion dates
  - changing task defaults, relationships, or board features
---
# Tasks

## Purpose
Help the job seeker keep track of work such as following up with a recruiter, submitting an application, or preparing for an interview. Tasks show what needs attention, when it is due, and what has been completed.

## Actors
The job seeker reviews tasks on the Tasks board and asks the conversational assistant to create or update them. A command-line interface (CLI) also supports task management.

## Functional Behavior
A task describes one action. The job seeker supplies a title and category and chooses whether it belongs to a saved opportunity (a Gig), a saved contact (a Person), or the general job search. Optional notes hold instructions or context. For example, “Prepare leadership examples” can belong to an interview opportunity, while “Update base resume” can belong to the general search.

New tasks start Open with Medium priority. The job seeker can choose another priority, add or remove a due date, revise the title or notes, change the category or related record, and mark work In progress, Completed, or Canceled. Tasks need no deadline; a past due date is also allowed.

The Tasks board initially shows Open and In progress tasks, together called active tasks. Filters narrow the list by status, priority, category, or text in the title, related name, and notes. Clear restores active tasks with all priorities and categories and an empty search. Selecting a task opens its details, including dates and notes. The board provides viewing and filtering; creating, editing, and completing tasks happens through the assistant or CLI.

Summary counts show overdue active tasks, active tasks due today, all active tasks (under “Open tasks”), and completed tasks. These counts cover the full list even when filters hide rows. Overdue tasks appear first, followed by tasks due today, other dated tasks, and tasks without deadlines. Detailed tie-breaking rules are in [Task ordering](../domain/tasks-task.md#ordering).

## Business Rules
- A title must contain text. Supported categories, priorities, and statuses are listed in the [Task definition](../domain/tasks-task.md#states).
- A task belongs to exactly one opportunity, one contact, or the general search. The selected opportunity or contact must already exist. Its display name is filled in automatically.
- Due dates are optional calendar dates in YYYY-MM-DD form. “Today” uses the America/Los_Angeles time zone. Only active tasks with a due date before today are overdue; tasks due today are counted separately.
- Creation, update, and completion dates are assigned by the application from the day of the change. Marking a task Completed records its completion date. Repeating that status or editing other details preserves the date.
- Changing a completed task to any other status clears its completion date. Completing it again records the day of the new completion.
- An edit changes only the supplied details. Reassigning a task requires a complete new relationship; notes and due date can be removed explicitly.

## State and Lifecycle
Tasks start Open. They can move directly between Open, In progress, Completed, and Canceled; there is no required sequence. Reopening work restores it to the active list. Completed and canceled tasks remain available by changing the status filter.

The board, assistant task tools, and CLI have no task deletion command. The application's separate change-reversal operation can undo eligible task changes, including creation; see [task implementation guarantees](../architecture/tasks.md#guarantees-and-failure-modes).

## Capability-Specific Nonfunctional Requirements
Saved task changes have a history, and checks prevent conflicting writes during a save. The precise protection and its limits are described in [task architecture](../architecture/tasks.md#guarantees-and-failure-modes). No task-specific response-time, availability, or capacity target is established by the inspected implementation.

## Related Workflows
Creating or completing a task is covered here; these short operations have no separate workflow document.

## Related Domain Objects
- [Task](../domain/tasks-task.md): fields, categories, lifecycle, and ordering.

## Related Interfaces
- [Task interfaces](../interfaces/api/tasks.md): assistant tools, CLI commands, and browser reads.

## Related Architecture
- [Task implementation](../architecture/tasks.md): date handling, saved changes, and refresh behavior.

## Known Constraints
Completing an application or follow-up task records that the work is done; it does not submit an application, send a message, or update the opportunity's separate next-action field.

A related name is saved when the task is assigned, so renaming the contact or opportunity does not refresh that name automatically. An open detail panel can show older task details after the list refreshes; reopen the task to see the refreshed record. Its guidance mentions CLI updates, although assistant updates are also supported.

## Related documents

- [Task](../domain/tasks-task.md)
- [Task Interfaces](../interfaces/api/tasks.md)
- [Task Architecture](../architecture/tasks.md)
