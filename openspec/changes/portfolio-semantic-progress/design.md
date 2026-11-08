## Context

Schedule table fill uses `resolveScheduleWarning` (shift/lag from baseline≠forecast, Delayed, sourceWeeks) then `resolveScheduleFillTone`. Portfolio status pill (Green/Yellow/Red) is independent — screenshot AG1: yellow status + red bar.

## Decisions

1. Nest computes `progressFillTone` for analyst `project_group` from the same schedule items as `ScheduleService.getSchedule`, using ported warning+fill pure functions + descendant fold (shift before lag).
2. Program tone: fold warnings across all descendant leaves of member project_groups (same fold rules), not mean of tones / not status RAG.
3. Bar `%` = schedule `project_group.progressPct` (null if absent / no leaves). Counts column = existing leafCompleted/leafTotal (works+КТ Completed). Program counts = sum of project leaves; program `%` = round(sum/sum) when total>0 else null.
4. FE renders shared SemanticProgressBar; does not parse `progressLabel` for color.

## Risks

- FE `schedule-warning.ts` and Nest port must stay aligned — unit tests mirror cases.
- Injecting ScheduleService into PortfolioService couples modules already co-located in ProjectsModule.
