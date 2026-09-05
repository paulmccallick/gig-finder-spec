---
id: interrupted-agent-turn
capability: conversational-agent
feature: conversations
title: Preserve durable tool effects without saving an interrupted turn
classification: recoverability
summary: Interruption retains completed product changes while excluding the incomplete conversation turn.
---

# Preserve durable tool effects without saving an interrupted turn

## Scenario

| Field | Concrete value |
|---|---|
| Source | A candidate stopping a response or a stream/provider failure. |
| Stimulus | The turn ends aborted or with an error after at least one confirmed tool mutation completed. |
| Environment | An active agent conversation with independently committed tool changes. |
| Affected capability or behavior | Conversation persistence and post-tool recovery. |
| Response | Keep completed product changes, do not save the incomplete user/assistant turn, and warn that work may be partial. |
| Response measure | The completed mutation remains readable with its audit change, while conversation message count and last-active time do not advance for the interrupted turn. |
