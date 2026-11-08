# План: ECharts-only шкала + register решений

Accepted 2026-11-08. **2026-11-08 follow-up:** variants 1/2 + toggle removed; sole renderer = Apache ECharts. AI does not promote docs to `approved`/`fact`. Decisions page edits out of scope for the delete wave.

## Timeline (current)

Единственный рендерер карточки «Вехи портфеля»: Apache ECharts (`ExecutiveTimelineEcharts` + shared chrome/filters/189). Custom strip / vis-timeline / `vis-data` removed.

## Decisions register (done earlier)

`GET /v1/projects/:id/decisions`; `/decisions`; NAV + crumb; dashboard link.

## Gates

Dirty tree — touch only own paths. No commit/push. Evidence: `/tmp/pharma-timeline-only-echarts/`.
