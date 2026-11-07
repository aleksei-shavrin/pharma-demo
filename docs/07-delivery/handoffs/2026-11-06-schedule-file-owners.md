---
id: DOC-HANDOFF-2026-11-06-SCHED-OWN
title: 'Handoff: писатели календарного плана, Агент №2 и №3'
type: handoff
status: draft
version: '0.3.0'
created: '2026-11-06'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-DEL-PHARMA-CALL-001
  - DOC-UX-005
---

# Handoff: общие файлы Schedule

## Мета

- **От:** Агент №3, подвыборка AN-24 → AN-09
- **Кому:** Агент №2, C07 `schedule-work-actual`
- **Дата:** 2026-11-06
- **Область:** OpenSpec и fixtures дерева. Комплект показа остаётся у Агента №1.

## Согласованный порядок

Агент №2 уже открыл `openspec/changes/schedule-work-actual/` и занимает черновики факта. Агент №3 не правит эти черновики и не забирает файлы, пока в них пишется C07.

| Файл | Кто пишет сейчас | Следующий |
|------|------------------|-----------|
| `apps/api/src/data/fixtures/schedule-works.ts` | Агент №2, с 2026-11-06 14:21 | Только поля C07 у `WK-01` и `8.2.2` (и пустой факт у `8.2.1`, `WK-02`). Агент №3 добавляет `LNK-X-PWR-HVAC` после этих строк в файле |
| `docs/05-ux-ui/demo-v1-schedule-workspace.md` | Агент №2, режимы база/прогноз и база/факт | Агент №3 дописывает §1.6 про AN-24 и AN-09, не переписывая разделы C07 |
| `docs/06-architecture/decisions/0004-d12-dhtmlx-gantt-community.md` | Агент №2, аддендум факта | Агент №3 дописывает крепление межпроектной линии только после review стрелки |
| `apps/api/src/schedule/dto/schedule.dto.ts` | Агент №2, если вносит поля факта | Агент №3 добавляет `kind` связи после review, не трогая поля факта |
| `apps/api/src/schedule/schedule.service.ts` | Агент №2, проверка фактических дат | Агент №3 добавляет валидацию `kind` после review |
| `apps/web/src/components/schedule/dhtmlx-gantt-adapter.tsx` и `apps/web/src/lib/schedule/to-gantt-presentation.ts` | Агент №2, если рисует факт | Агент №3 рисует линию `LNK-X-PWR-HVAC` после review |

Точечное исключение этой волны: Агент №3 обновляет счётчики снимка C в `apps/api/src/schedule/schedule.service.spec.ts` (113 строк, три проекта, три этапа, 11 работ). Агент №2 эти ожидания не откатывает.

## Что уже зафиксировано без общих файлов

- Change schedule-c-cross-project-subsample (`openspec/changes/schedule-c-cross-project-subsample/proposal.md`): требование дерева и отдельное требование стрелки.
- Narrative: [demo-v1-mock-narrative-data.md](../../03-product/demo-v1-mock-narrative-data.md), раздел «Подвыборка AN-24 → AN-09».

## Передача schedule-works.ts Агенту №2

Review стрелки принят 2026-11-06. Агент №3 больше не пишет `schedule-works.ts`, пока в файле не появятся обе правки C07. Подтверждение передачи — сами поля в файле, не эта заметка.

Агент №2 вносит только набор ниже. Прогноз, статус, прогресс, дерево AN-24 / AN-09 и четыре связи WK не переписывать.

## Набор полей C07 для снимка C

Review C07 принят 2026-11-06. Значения синтетические. Поля задаются явно, не из процента и не из статуса.

`WK-01`, после `...UNNESTED_WORK`, чтобы перекрыть пустую базу:

```ts
baselineStart: '2027-02-20',
baselineEnd: '2027-02-24',
actualStart: '2027-02-18',
actualEnd: '2027-02-23',
```

Прогноз остаётся `startDate: '2027-02-20'`, `endDate: '2027-02-24'`.

`8.2.2`, не трогая прогноз и базу:

```ts
actualStart: '2027-03-01',
actualEnd: null,
```

`8.2.1` и `WK-02`: `actualStart: null`, `actualEnd: null`. У `WK-02` статус `Completed` эти поля не заполняет.

В `ScheduleWorkFixture` нужны необязательные `actualStart?: string | null` и `actualEnd?: string | null`.

Поля факта остаются у Агента №2. Агент №3 `kind` уже добавил и эти файлы отпустил: раздел «Трек Агента №3 закрыт» ниже.

## Адаптивность (не факт и не стрелка)

Трек узкой ширины 2026-11-06 не забирает файлы C07 и `LNK-X-PWR-HVAC`. Ему можно править `schedule-board.tsx`, новый помощник компоновки и CSS высоты viewport. `schedule-view.tsx` и общие тесты вида он подключает только после этой заметки и только классами раскладки: Агент №2 эти классы не откатывает, поля факта в них не живут. §1.10 UX календаря добавлен отдельно от §1.7–§1.9.

Интегратор подключил `resolveScheduleTimelineLayout` в `schedule-view.tsx`: атрибут `data-schedule-timeline-layout` и классы ряда или столбца. Факт и `LNK-X-PWR-HVAC` в этом файле не менялись.

## Трек Агента №3 закрыт

2026-11-06 Агент №3 освобождает общие файлы стрелки и дерева. Список и проверки: [2026-11-06-schedule-c-cross-project-close.md](./2026-11-06-schedule-c-cross-project-close.md).

C07 остаётся у Агента №2. Адаптивность остаётся у своего трека. Комплект показа остаётся у Агента №1. Заметка [2026-11-06-show-kit-cross-project-note.md](./2026-11-06-show-kit-cross-project-note.md) задачей ему сейчас не передаётся.

| Файл | После закрытия трека |
|------|----------------------|
| `apps/api/src/data/fixtures/schedule-works.ts` | Агент №3 отпустил. Поля C07 остаются у Агента №2 |
| `apps/api/src/schedule/dto/schedule.dto.ts` | Агент №3 отпустил. Поля факта остаются у Агента №2 |
| `apps/api/src/schedule/schedule.service.ts` | Агент №3 отпустил. Проверка фактических дат остаётся у Агента №2 |
| `apps/api/src/schedule/schedule.service.spec.ts` | Агент №3 отпустил |
| `apps/web/src/lib/api-client.ts` | Агент №3 отпустил |
| `apps/web/src/lib/schedule/to-gantt-presentation.ts` | Агент №3 отпустил. Режим факта остаётся у Агента №2 |
| `apps/web/src/components/schedule/dhtmlx-gantt-adapter.tsx` | Агент №3 отпустил. Отрисовка факта остаётся у Агента №2 |
| `apps/web/src/components/schedule/schedule-view.tsx` | Агент №3 отпустил. Раскладку узкой ширины подключает трек адаптивности |
| `docs/05-ux-ui/demo-v1-schedule-workspace.md` | §1.9 отпущен. §1.7–§1.8 остаются у Агента №2, §1.10 у трека адаптивности |
| `docs/06-architecture/decisions/0004-d12-dhtmlx-gantt-community.md` | Addendum межпроектной линии отпущен. Addendum факта остаётся у Агента №2 |

## Подтверждение передачи

В `schedule-works.ts` уже есть обе правки C07: у `WK-01` база `2027-02-20`…`2027-02-24` и факт `2027-02-18`…`2027-02-23`; у `8.2.2` начало факта `2027-03-01` и пустой конец. Поверх них добавлена только `LNK-X-PWR-HVAC`.

## Не сделано этим треком

- Archive change `schedule-c-cross-project-subsample` — после apply. Living specs до archive не публиковать.
