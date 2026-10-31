---
id: DOC-UX-007
title: "Demo v1 tables, charts, and UI components"
type: product
status: draft
version: "0.1.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-001
  - DOC-UX-004
  - DOC-UX-005
  - REQ-NFR-001
---

# Demo v1 tables, charts, and UI components

> **certainty:** hypothesis
>
> Intent стека для будущей реализации. Пакеты **не** устанавливаются в этой docs-волне. D12 lib choice **open**.

## 1. Component stack (intent)

| Layer | Choice | Use |
|-------|--------|-----|
| UI kit | shadcn/ui | Shell, buttons, tabs, dialog, theme |
| Tables | TanStack Table | Все реестры + Schedule table |
| Charts | Recharts | KPI distributions, A/B/C forecast points |
| Gantt | Deferred (SVAR OS кандидат №1 / custom timeline) | Read-only Schedule secondary view |

## 2. Tables

Плотность enterprise: pagination (например 25–50), sort, filter по подтверждённым статусам. Колонки только из Domain/REQ/mock полей.

## 3. Charts (Recharts)

Допустимые примеры (нужен data source):

- Bar: baseline vs forecast Production Start
- Step/line: forecast across Snapshots A/B/C
- Distribution: counts by Equipment.status / Issue.status / Risk.rag (**только** allowlisted значения)

Недопустимо: burn-down, earned value, org heatmaps без данных; графики без опоры на реестр.

## 4. Gantt

См. [schedule-workspace](./demo-v1-schedule-workspace.md). Viz ≠ scheduling engine. Baseline dual markers — custom при OS без PRO.

## 5. Density guidelines

- Meaningful widgets only (каждый отвечает на вопрос).
- Нет обязательных 4 KPI на каждой entity card.
- Light/Dark: theme tokens; charts читаемы в обеих темах.
