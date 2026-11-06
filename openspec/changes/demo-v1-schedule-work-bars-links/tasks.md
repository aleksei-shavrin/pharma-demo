# Tasks: demo-v1-schedule-work-bars-links

## Phase 0 — Documentation

- [x] DOC-UX-005 (works, interval, statuses, links)
- [x] ADR-0004 addendum G07–G11
- [x] OpenSpec change propose artifacts
- [x] Демо-контракт согласован (2026-11-06)
- [x] Короткий запрос аналитику (fixtures only)

## Gate — Curated subset

- [x] Подвыборка зафиксирована (C: WK-01…05 + 4 links; A: пусто) — [fixtures report](../../../docs/07-delivery/reports/2026-11-06-g07-g11-schedule-work-fixtures.md)
- [x] Даты сверены с asOf C `2027-03-01` (сдвиг с апреля, длительности сохранены)
- [x] SF помечена как demo attachment, не технологическая зависимость

## Phase 1 — Parallel implementation

### Track A — API + fixtures

- [x] `ScheduleWorkItemDto` + `ScheduleLinkDto` + `ScheduleDto.links`
- [x] Validation: ends exist; endDate ≥ startDate; ref prefix `work:`
- [x] Curated fixtures (short/long, four link types, authored statuses)
- [x] Snapshot without works/links regression
- [x] API / contract tests

### Track B — FE adapter + table

- [x] Extend selection key / presentation for `work`
- [x] Inclusive→exclusive date map; same-day duration ≥ 1
- [x] `task_class` + theme tokens; RU status in table/tooltip
- [x] `show_links` + type map; drag/create off
- [x] Unit tests presentation / adapter map
- [x] Timeline mode mounts DHTMLX (`ScheduleTimeline`) for arrows

### Integrator (single owner)

- [x] Browser: SS/SF/FF/FS attachment edges
- [x] Short + long bars; one-day bar
- [x] Light/dark status colors + text
- [x] Snapshot without works/links — MS/EQ markers intact
- [x] Tick G07–G11 in call work-plan; integrator report
- [ ] Archive OpenSpec per workflow (после human apply living specs)

## Out of this change

- [ ] **G12** «Календарный план» — отдельный этап (§16). Владелец UX-доков: docs-engineering; владелец UI-подписей: FE shell.
