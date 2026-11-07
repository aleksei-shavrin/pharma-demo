# Design: schedule work bars + links

## Context

AS-IS: [schedule.dto.ts](../../../apps/api/src/schedule/dto/schedule.dto.ts) — только EQ/MS; links отсутствуют. Adapter: zero-duration milestones, `show_links: false`, `links: []` ([ADR-0004](../../../docs/06-architecture/decisions/0004-d12-dhtmlx-gantt-community.md) I7). Living constraint «Schedule items are only equipment and milestones» — [demo-v1-architecture-constraints](../../specs/demo-v1-architecture-constraints/spec.md).

## Goals / Non-Goals

**Goals:**

- Контракт work + typed links; curated fixtures; read-only bars и стрелки; RU-статус в таблице; одна полоса на работу.

**Non-Goals:**

- Dual-bar baseline+fact; CPM / working calendar; Domain Activity; links к MS/EQ; drag create; полный каталог 272 работ; замена шкалы дашборда; **G12** rename.

## Decisions (демо-контракт согласован 2026-11-06)

1. **Kind `work`** — Schedule view-model row, не Domain Activity.
2. **Ось полосы:** прогноз → `startDate`, `endDate` в календарных днях.
3. **Inclusive end:** end входит в интервал; DHTMLX exclusive end = day after endDate.
4. **Same-day bar:** `startDate === endDate` ⇒ видимая полоса 1 календарного дня (`duration ≥ 1`), не milestone.
5. **Status enum:** `Waiting` | `OnSchedule` | `Delayed` | `Completed` (+ RU Ожидание / По графику / Отстаёт / Выполнено). Без `InProgress` / `OnTrack`.
6. **Statuses authored:** значение в fixture снимка; FE/API не вычисляют от `scenarioAsOfDate`.
7. **Link refs:** `sourceRef` / `targetRef` = `work:<id>` (исходный ID аналитика, если уникален и стабилен).
8. **Link endpoints:** только work↔work.
9. **Link types:** FS / SS / FF / SF → `gantt.config.links`.
10. **Параллелизация после подвыборки:** Track A API+fixtures ‖ Track B FE adapter+table; один интегратор на e2e.

## Risks / Trade-offs

- [Коллизии голых ID] → обязательный prefix `work:`.
- [Неверное крепление стрелок Community] → браузерная проверка интегратором по каждому типу.
- [Путаница с Domain Activity] → UX/ADR/OpenSpec: view-model only.
- [Тип связи отсутствует в исходнике] → demo-authored пример по согласованию с аналитиком.

## Migration Plan

1. ~~Contract sign-off~~ (2026-11-06).
2. Analyst curated subset ([запрос](../../../docs/07-delivery/reports/2026-11-06-g07-g11-analyst-questions.md)).
3. Apply OpenSpec deltas to living specs after review / with implementation.
4. Track A ‖ Track B; integrator checklist.
5. Archive change; tick G07–G11 in call work-plan.

## Frozen fixtures (2026-11-06)

Синтетическая подвыборка зафиксирована: [2026-11-06-g07-g11-schedule-work-fixtures.md](../../../docs/07-delivery/reports/2026-11-06-g07-g11-schedule-work-fixtures.md).

- Snapshot **C**: WK-01…WK-05 + SS/FS/FF/SF (`LNK-SF-01` = demo attachment only).
- Snapshot **A**: без works/links.
- Даты сдвинуты относительно исходного апреля к asOf C `2027-03-01` (длительности сохранены).
