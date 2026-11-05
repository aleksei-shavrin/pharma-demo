---
id: DOC-UX-007
title: 'Demo v1 — таблицы, графики и UI-компоненты'
type: product
status: draft
version: 0.2.0
created: '2026-10-31'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-UX-001
  - DOC-UX-004
  - DOC-UX-005
  - REQ-NFR-001
---
# Demo v1 tables, charts, and UI components

> **certainty:** hypothesis
>
> Стек UI для Demo v1: shadcn/ui, TanStack Table, Recharts — `approved UX decision`. D12 Gantt lib — **RESOLVED** (ADR-0004, I7; Community adapter).

## 1. Component stack

| Layer | Choice | Decision Status | Use |
|-------|--------|-----------------|-----|
| UI kit | shadcn/ui | `approved UX decision` | Shell, buttons, tabs, dialog, theme |
| Tables | TanStack Table | `approved UX decision` | Все реестры + Schedule table |
| Charts | Recharts | `approved UX decision` | KPI distributions, A/B/C forecast points |
| Gantt | `dhtmlx-gantt@10.0.3` Community / MIT | **RESOLVED** (ADR-0004, I7) | Read-only Schedule secondary view (D10) |

## 2. Tables

Плотность enterprise: pagination (например 25–50), sort, filter по подтверждённым статусам. Колонки только из Domain/REQ/mock полей.

## 3. Charts (Recharts)

Допустимые примеры (нужен data source):

- Bar: baseline vs forecast Production Start
- Step/line: forecast across Snapshots A/B/C
- Distribution: counts by Equipment.status / Issue.status / Risk.rag (**только** allowlisted значения)

Недопустимо: burn-down, earned value, org heatmaps без данных; графики без опоры на реестр.

## 4. Gantt

См. [schedule-workspace](./demo-v1-schedule-workspace.md). Viz ≠ scheduling engine. Baseline dual markers — custom при OS без PRO. Выбор lib отложен (D12).

## 5. Density guidelines

- Meaningful widgets only (каждый отвечает на вопрос).
- KPI/metric group: либо ≥4 обоснованных tiles, либо группу не показывать; не изобретать метрики (`approved UX decision`).
- Light/Dark: theme tokens; charts читаемы в обеих темах.
