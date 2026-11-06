---
id: DOC-HANDOFF-2026-11-06-STAGE1
title: Handoff — этап 1 shell / dashboard /docs
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-06'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-DEL-PHARMA-CALL-001
---

# Handoff: этап 1 (F01–F06, B10–B11)

План: [`.cursor/plans/shell_dashboard_milestones_f75ea209.plan.md`](../../../.cursor/plans/shell_dashboard_milestones_f75ea209.plan.md).

## Закрытые ID

F01, F02, F03, F04, F05, F06, B10, B11.

## Не в scope

C09–C11 (ожидают выбор libs); G07–G11.

## Проверки (localhost:3080)

- UI `/`, сайдбар «Дашборд» + «Документация», App Bar Bell→Theme→Snapshot, F06 delta borders = 0.
- Снимок A: `lower-cards` = 3 (без decisions).
- Снимок C: `lower-cards` = 4 (exceptions→decisions→attention→trend).
- StaticIndicator toast отсутствует (`hasToast: false`).
- `/docs/` 200; `/portal/` → `/docs/`; `/portal/docs/<slug>` → `/docs/<slug>`.

## Следующий шаг

Человек выбирает пару libs → этап 2 (C09–C11).
