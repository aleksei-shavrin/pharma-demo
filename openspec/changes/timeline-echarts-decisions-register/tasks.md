# Tasks

## 1. Docs / OpenSpec

- [x] proposal / design / tasks / delta specs (draft)
- [x] Sync UX dashboard §7 — ECharts only, no toggle
- [x] Handoff + report for ECharts-only wave

## 2. ECharts densify → sole renderer

- [x] Shared universe chrome (phase + filters)
- [x] ECharts program-category series + permanent PS/phase/as-of labels
- [x] Host ECharts-only; remove strip/vis/toggle/variant state
- [x] Remove `vis-timeline` / `vis-data` when unused; sync lock
- [x] Adapt dashboard tests off strip DOM

## 3. Decisions register

- [x] API DTO + service + controller + specs
- [x] FE api-client + `/decisions` page + NAV/crumb
- [x] Dashboard cross-link
- [x] Empty A / rows F coverage
- [ ] Decisions page edits — out of scope this wave

## 4. Verify

- [x] Scoped unit tests (host/echarts/dashboard) — 56 pass
- [x] FE typecheck / eslint own paths — 0
- [x] Playwright evidence `/tmp/pharma-timeline-only-echarts/`
