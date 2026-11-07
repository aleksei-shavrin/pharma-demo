---
id: DOC-HANDOFF-2026-11-06-ONE-CAL
title: 'Handoff: один календарь в трёх режимах'
type: handoff
status: draft
version: '0.2.0'
created: '2026-11-06'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-UX-005
---

# Handoff: один календарь в трёх режимах

Дата обновления: 2026-11-07. Репозиторий: pharma-demo.

## Владение

Писатель исходного трека (агент №1) освободил файлы. Геометрия и стабилизация выбора полосы **закрыты** в Git:

- `7765e32` — единый шаг 32 / шапки 40, ИСР, компактные полосы, панель
- `c811882` — typecheck scroll binding / css lock
- `801b626` — выравнивание после выбора полосы; tooltip без ложного «0%»
- `419fa12` — скрипт показа под «Разделение»

Свободны: `schedule-view*`, `dhtmlx-gantt-adapter*`, `to-gantt-presentation*`, связанные lib-тесты. `page-surface` и tokens — отдельный трек recovery (см. handoff surface).

## Что сделано (исходный трек)

«Разделение» показывает ту же таблицу, что «Таблица», и тот же DHTMLX, что «Временная шкала». Переключатель только показывает и скрывает части. Режим по умолчанию — «Разделение».

## Follow-up геометрии — закрыт

Ранее в «Разделении» таблица была 48px, диаграмма 72px. Это устранено `7765e32` + `801b626`. Отчёты: [calendar-unified-geometry](../reports/2026-11-06-calendar-unified-geometry.md), [calendar-stabilization-walk](../reports/2026-11-06-calendar-stabilization-walk.md). E02 этим handoff не закрывается.
