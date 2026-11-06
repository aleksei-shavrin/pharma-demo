---
id: DOC-DEL-G07-INT
title: 'G07–G11: отчёт интегратора'
type: delivery
status: draft
version: 0.1.0
created: '2026-11-06'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-DEL-G07-FIX
---
# G07–G11 — проверка интегратора

Fixtures: [2026-11-06-g07-g11-schedule-work-fixtures.md](./2026-11-06-g07-g11-schedule-work-fixtures.md).

## Снимок C (asOf 2027-03-01)

| Проверка | Результат |
|----------|-----------|
| API: 5 works + 4 links | OK (`GET …/schedule?snapshot=C`) |
| Split: статусы RU (Выполнено / Отстаёт / По графику / Ожидание) | OK |
| Split: длинная WK-03 + однодневная WK-05 (полоса) | OK |
| Timeline (DHTMLX): 5 bars, semantic CSS classes | OK |
| Timeline: 4 links | OK |
| Крепления (aria-label DHTMLX) | SS начало→начало; FS конец→начало; FF конец→конец; SF начало→конец |
| SF disclaimer (не технологическая зависимость) | OK |
| Light / dark | полосы на `--status-*` токенах |

## Снимок A

| Проверка | Результат |
|----------|-----------|
| Нет счётчика «Работы», links=[] | OK |
| Split: 95 forecast markers EQ/MS | OK |
| Сброс stale-фильтра «Работы» при уходе с C | исправлено в `ScheduleView` |

## G12

Вне этапа — не выполнялось.
