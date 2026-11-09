## Why

Источник аналитика (25 проектов Greenfield) должен стать SoT расписания вместо частичного synthetic дерева (133/8 WS). Параллельная user-entity «Направление» оставляет программы пустыми. Списки программ/проектов — не таблицы. Default collapse скрывает Y-scroll.

## What Changes

- Импорт полного MD в repo + parser + golden totals (25 / 145 этап / 272 работа / 147 КТ = 564).
- Schedule tree = 25 `AN-*` project groups; analyst WBS canonical; collision remap; EQ/MS reparent + aliases.
- Сохранить **7 PRG-*** и **25 AN-***; не создавать `PRG-GREENFIELD`.
- Убрать user-facing «Направление»: WS→AN→PRG mapping; `/workstreams` redirect; фильтры PRG/project.
- Program/project details обогащаются данными WS (leaders/costs/counts) без double-count.
- `/programs` и `/projects` — semantic tables.
- Default expand **all** group keys; счётчики «Найдено / Свёрнуто»; правый gutter artifact.
- Anchor 03 = DEMO_ASSUMPTION для source statuses; dates/progress — supplementary backend assumptions.

## Capabilities

### Modified Capabilities

- `schedule-workspace`: полный импорт, expand-all, counters, links coverage.
- `portfolio-program-project`: program details populated; WS absorbed; tables.

## Impact

- `apps/api` fixtures/parser/schedule/portfolio/workstreams redirects
- `apps/web` schedule expand/summary/filters; programs/projects tables; nav
- docs/OpenSpec/narrative/UX/handoff
