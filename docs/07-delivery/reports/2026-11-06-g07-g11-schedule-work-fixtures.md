---
id: DOC-DEL-G07-FIX
title: 'G07–G11: curated schedule works fixtures (Snapshot C)'
type: delivery
status: draft
version: 0.1.0
created: '2026-11-06'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-UX-005
  - DOC-ADR-0004
---
# G07–G11 — curated works / links (демоданные)

Контракт: [DOC-UX-005](../../05-ux-ui/demo-v1-schedule-workspace.md), [ADR-0004](../../06-architecture/decisions/0004-d12-dhtmlx-gantt-community.md), OpenSpec demo-v1-schedule-work-bars-links (`openspec/changes/archive/2026-11-07-demo-v1-schedule-work-bars-links/proposal.md`).

## Сверка с снимком C

| Факт | Значение |
|------|----------|
| Snapshot C `scenarioAsOfDate` | **2027-03-01** ([snapshot-states](../../../apps/api/src/data/fixtures/snapshot-states.ts)) |
| Исходное предложение дат | апрель 2027 (после asOf) |
| Решение | **сдвиг кластера на ~44 дня назад**, длительности и топология связей сохранены; статусы согласованы с asOf |

**Согласованность статусов с asOf C:**

- `Completed` — окончание **до** 2027-03-01
- `Delayed` — интервал **пересекает** asOf (работа в ходе, отстаёт)
- `OnSchedule` — пересекает/заканчивается с Delayed-соседом по FF, ещё в окне снимка
- `Waiting` — **после** asOf (ещё не начата), однодневная полоса

## Снимок C — работы

| id | name | startDate | endDate (incl.) | status | длительность |
|----|------|-----------|-----------------|--------|--------------|
| WK-01 | Подготовка зоны монтажа | 2027-02-20 | 2027-02-24 | Completed | 5 дн. |
| WK-02 | Разметка зон чистых помещений | 2027-02-20 | 2027-02-22 | Completed | 3 дн. |
| WK-03 | Монтаж панелей чистых помещений | 2027-02-27 | 2027-03-10 | Delayed | 12 дн. (длинная) |
| WK-04 | Герметизация стыков | 2027-03-06 | 2027-03-10 | OnSchedule | 5 дн. |
| WK-05 | Приёмка участка | 2027-03-13 | 2027-03-13 | Waiting | **1 дн.** (однодневная полоса) |

Presentation / link id: `work:WK-01` … `work:WK-05`.

## Снимок C — связи

| id | type | sourceRef | targetRef | Примечание |
|----|------|-----------|-----------|------------|
| LNK-SS-01 | SS | work:WK-01 | work:WK-02 | одно начало |
| LNK-FS-01 | FS | work:WK-01 | work:WK-03 | окончание → начало |
| LNK-FF-01 | FF | work:WK-03 | work:WK-04 | одно окончание |
| LNK-SF-01 | SF | work:WK-04 | work:WK-05 | **Демонстрация точек крепления стрелки SF** (начало источника → конец цели). **Не** выдавать за утверждённую технологическую зависимость. |

## Снимок A — регрессия

На **Snapshot A** массив `works` / `links` **пуст** (или отсутствует): только прежние маркеры EQ/MS и baseline overlay.

## Вне объёма

G12 («Календарный план») — отдельно.
