# Proposal: Schedule work bars + typed dependency links (G07–G11)

## Why

Страница «График» сегодня показывает только контрольные точки (milestone / equipment_delivery) точечными маркерами. Для показа демо нужно отобразить **интервальные работы** (короткая и длинная полосы), **семантический цвет по статусу** и **четыре типа стрелок предшествования** (SS / SF / FF / FS) в режиме просмотра — без scheduling engine и без полного WBS.

Норматив call work-plan §15 (G07–G11); UX [DOC-UX-005](../../../docs/05-ux-ui/demo-v1-schedule-workspace.md) v0.3.1-draft; ADR [0004 addendum](../../../docs/06-architecture/decisions/0004-d12-dhtmlx-gantt-community.md).

## What Changes

- Расширение Schedule API/DTO: `kind: 'work'` + `links[]` с типизированными зависимостями.
- Curated fixtures (подвыборка работ и связей), не импорт всех 272 работ.
- FE: таблица (даты + RU-статус) и DHTMLX Community adapter (`type: 'task'`, `task_class`, `show_links`).
- Docs: DOC-UX-005, ADR-0004 addendum; living specs — после apply.
- **Не** в этом change: dual-bar plan+fact (C07–C08), CPM, Domain Activity/WBS entity, стрелки к MS/EQ, drag/edit links, **G12** rename («Календарный план»).

## Status

`propose` — **демо-контракт согласован 2026-11-06**. Реализация API/FE стартует **после** curated подвыборки аналитика: [запрос](../../../docs/07-delivery/reports/2026-11-06-g07-g11-analyst-questions.md).

## Agreed contract (2026-11-06)

- Полоса = **прогнозный** интервал, **календарные** дни, `endDate` **включительна**.
- `startDate === endDate` → видимая полоса **один день**.
- Статус **authored** в снимке: `Waiting` | `OnSchedule` | `Delayed` | `Completed` (+ RU).
- Links только work↔work; `sourceRef`/`targetRef` = `work:<id>` с исходным ID аналитика (если уникален и стабилен).

## Capabilities

### New Capabilities

- `schedule-workspace`: контракт строк Schedule (control points + work), интервалы, статусы, typed links, правила отображения table/gantt.

### Modified Capabilities

- `demo-v1-architecture-constraints`: curated Schedule `work` + display-only links как view-model / API rows; без Domain Activity/CPM. Living requirement `No Activity or WBS entity in enrichment` уже есть: дельта переименовывает его в заголовок ниже и модифицирует этот новый заголовок. Сценарий `Schedule items are only equipment and milestones` остаётся (THEN и AND прежние). Его WHEN сужен до снимка без curated works: безусловный THEN противоречил бы сценарию со строками `work`. Оба сценария этой дельты сохранены.

## Apply order

Этот change создаёт living `schedule-workspace`: в его дельте только ADDED. Пока spec не создан, архив `schedule-hierarchy-baseline-forecast` и `schedule-unified-geometry` отказывает: у них есть MODIFIED, а цели ещё нет. Следующие change только дополняют уже созданный spec. Порядок apply/archive:

1. `demo-v1-schedule-work-bars-links` — создаёт `schedule-workspace`; RENAMED+MODIFIED ограничения архитектуры.
2. `schedule-hierarchy-baseline-forecast` — MODIFIED `Work interval is a single forecast bar`; ADDED иерархия, база и `Expand state is shared by table and chart`.
3. `schedule-work-actual` — только ADDED (факт).
4. `schedule-c-cross-project-subsample` — только ADDED (межпроектная связь).
5. `schedule-unified-geometry` — MODIFIED `Expand state is shared by table and chart` (требование из шага 2); ADDED общая геометрия.

Living specs этим change не публикуются. Apply и archive — отдельное решение человека, не следствие согласия на демо-контракт 2026-11-06. Проверка порядка на изолированной копии: [2026-11-06-schedule-openspec-order](../../../docs/07-delivery/reports/2026-11-06-schedule-openspec-order.md).

## Impact

- Docs: DOC-UX-005, ADR-0004, call work-plan G07–G11 после реализации.
- Apps (после подвыборки, параллельно): `apps/api` DTO/fixtures/validation; `apps/web` presentation/adapter/table.
- Integrator: браузерная проверка краёв стрелок, short/long, light/dark, снимок без works/links.
- G12: отдельно; UX docs — docs-engineering; UI strings — FE shell.
