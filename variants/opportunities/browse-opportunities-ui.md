---
id: browse-opportunities-ui
capability: opportunities
workflow: ../../workflows/opportunities/browse-opportunities.md
surface: ui
summary: Read-only board divides active, unavailable, and archived Gigs with client-side controls.
aliases: [Opportunity board, Gig drawer]
requires: [../../workflows/opportunities/browse-opportunities.md]
---

# Browse and inspect opportunities via UI

## Exposure

The Opportunities workspace is the default dashboard view.

## Inputs and validation

Client controls: mode, free-text search, stage (not archive), fit, overdue-only (not archive), and Clear. They do not submit durable input.

## Interaction sequence

Switch mode/filter, select a card, inspect modal drawer, optionally open posting or exact current job description. Escape, close button, or scrim closes and restores focus.

## Outputs or presentation

Active/archive are grouped boards; unavailable is a sorted list. Metrics are computed over the loaded collection. Empty filters and hidden-lane counts are distinguished.

## Confirmation and authorization

None; read-only.

## Surface-specific failures

Initial API failure replaces the dashboard. Description-load failure stays localized in the drawer.

## Refresh and consistency

Initial load and agent mutation callbacks reload Gigs, People, and Tasks. No background polling occurs.

## Known limitations

No editing, availability action, or manual refresh control.

## Shared workflow

[Canonical behavior](../../workflows/opportunities/browse-opportunities.md)
