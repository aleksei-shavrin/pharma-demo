---
id: DOC-UX-002
title: "Demo v1 Application Shell and navigation"
type: product
status: draft
version: "0.2.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-001
  - DOC-UX-003
  - REQ-NFR-001
  - DOC-PROD-003
---

# Demo v1 Application Shell and navigation

> **certainty:** hypothesis
>
> Shell / nav: D1, D2, D7, D9 и связанные — `approved UX decision` для Demo v1. Не предписывает OpenSpec UI SHALL. FE narrative data — только через HTTP API (REQ-NFR-001), когда появится apps.

## 1. Application Shell regions

```text
┌─ AppShell ─────────────────────────────────────────────┐
│ ┌ Sidebar ┐ ┌─ Top Application Bar ──────────────────┐ │
│ │ Brand   │ │ Breadcrumbs │ Snapshot A/B/C │ Theme │ │
│ │ Nav×5   │ ├─ Page Surface ─────────────────────────┤ │
│ │         │ │  Page header + Main content            │ │
│ └─────────┘ └────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

| Region | Role | Decision Status |
|--------|------|-----------------|
| Left Sidebar | Primary IA (5 пунктов) | `approved UX decision` (D2, D9) |
| Top Application Bar | Breadcrumbs; Snapshot A/B/C; Light/Dark; контекст PRJ-01 | `approved UX decision` |
| Page Surface | Elevated plate (фон, радиус, тень) — контент страницы | `approved UX decision` |
| Main content | KPI / tables / charts / detail | — |

Стек: **shadcn/ui**, **TanStack Table**, **Recharts** — `approved UX decision` (intent; пакеты не устанавливаются в этой docs-волне). Gantt lib — `deferred decision` (D12).

## 2. Sidebar (D9)

| Order | Item | Route (illustrative) |
|-------|------|----------------------|
| 1 | Dashboard | `/` или `/dashboard` |
| 2 | Schedule | `/schedule` |
| 3 | Equipment | `/equipment` |
| 4 | Issues & Risks | `/exceptions` (или `/issues-risks`) |
| 5 | Milestones | `/milestones` |

Dashboard — стартовая страница (D1). Один shell для Director и PM (D7).

## 3. Snapshot A/B/C control

> **certainty:** hypothesis
>
> Глобальный переключатель в App Bar — `approved UX decision` (UI). Механизм backend/API — deferred implementation (OpenSpec: reproducibility without mandating switch mechanism).

Смена snapshot обновляет все виджеты согласованно с DOC-PROD-012 / будущим расширением популяции (без смены id).

## 4. Light / Dark theme

Переключатель в Application Bar; scope = весь shell + Page Surface + charts/tables. Intent: theme tokens (например next-themes + shadcn) — **не** ADR в этой волне. `approved UX decision`.

## 5. Breadcrumbs

См. паттерны возврата в [entity-detail](./demo-v1-entity-detail.md) и [screens-and-flows](./demo-v1-screens-and-flows.md). MVP: возврат к разделу без восстановления фильтров допустим (`assumption`).
