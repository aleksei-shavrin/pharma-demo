---
id: DOC-DEL-C06
title: 'C06: месячные линии vis-timeline'
type: delivery
status: draft
version: 0.1.1
created: '2026-11-06'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-UX-004
---

# C06 — скрытие мелкой сетки vis не перенесено

Снимок C, `http://127.0.0.1:3080`, вариант 2. Вариант 1 снят как контроль и не менялся.

На ширине 1287px вертикали месяцев имеют класс `vis-grid vis-minor` и имена месяцев (`vis-february` … `vis-september`). Класса `vis-major` нет. На ширине 480px границы января, апреля и июля тоже месячные: одна `vis-major`, две `vis-minor`. Отдельной более частой сетки нет.

Временное скрытие `.vis-grid.vis-minor` оставляет подписи месяцев и линию «Дата снимка 01.03.2027», но убирает сами границы месяцев. На обычной ширине исчезают все восемь границ. На узкой — апрель и июль. Это хуже чтения шкалы. Правило в код не вносилось, временный стиль со страницы снят.

Кадры: `/tmp/pharma-demo-artifacts/c06/`.

| Кадр | Файл |
| --- | --- |
| Контроль, вариант 1, 1287px, без программы | `control-v1-wide-noprogram.png` |
| До, vis, 1287px, без программы и со строительством | `before-vis-wide-noprogram.png`, `before-vis-wide-program.png` |
| До, vis, 480px, без программы и со строительством | `before-vis-narrow-noprogram.png`, `before-vis-narrow-program.png` |
| После временного скрытия, те же четыре сочетания | `after-vis-wide-noprogram.png`, `after-vis-wide-program.png`, `after-vis-narrow-noprogram.png`, `after-vis-narrow-program.png` |

## Closeout 2026-11-07

**Решение:** сохранить полезные месячные линии `.vis-grid.vis-minor` (и major на узкой ширине). Произвольный hide не вносить; текущий `color-mix` contrast оставить. Элемент «помеха» кроме оси / месяца / asOf не назван — удалять нечего. Чекбокс C06 в [плане работ](../pharma-demo-call-work-plan.md) закрыт этим решением. Макет ОСУП и новые фичи сюда не входят.
