# Design: timeline-echarts-decisions-register

## ECharts-only portfolio timeline (2026-11-08)

- Data: `resolveExecutiveTimelineExperimentModel` / `executiveMilestoneIds` (189).
- FE chrome: phase-context + volume (`all`|`overview`) + program filter.
- ECharts layout: program **names** as y categories; markLine as-of; PS legend + endpoints; lane-aware labels + `labelLayout` hideOverlap.
- Custom strip / vis-timeline / renderer toggle **removed**; `vis-timeline` / `vis-data` deps removed when unused.

## Decisions register

- Mirror equipment/milestones register pattern.
- Item fields: id, projectId, milestoneId, type, ownerPersonId, ownerFullNameRu, dueDate, note.
- FE table only; links to `/people/:id` and milestone detail when ids present; no Decision detail route; no invented status column; no write APIs.
