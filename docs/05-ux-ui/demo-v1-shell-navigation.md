---
id: DOC-UX-002
title: "Demo v1 Application Shell and navigation"
type: product
status: draft
version: "0.1.0"
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
> UX proposal (D1, D2, D9 и связанные). Не human-approved layout. Не предписывает OpenSpec UI SHALL.

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

| Region | Role |
|--------|------|
| Left Sidebar | Primary IA (5 пунктов) |
| Top Application Bar | Breadcrumbs; Snapshot A/B/C; Light/Dark; контекст PRJ-01 |
| Page Surface | Elevated plate (фон, радиус, тень) — контент страницы |
| Main content | KPI / tables / charts / detail |

Стек компонентов (intent, не install на этом этапе): **shadcn/ui**, **TanStack Table**, **Recharts**. FE narrative data — только через HTTP API (REQ-NFR-001), когда появится apps.

## 2. Sidebar (D9)

| Order | Item | Route (illustrative) |
|-------|------|----------------------|
| 1 | Dashboard | `/` или `/dashboard` |
| 2 | Schedule | `/schedule` |
| 3 | Equipment | `/equipment` |
| 4 | Issues & Risks | `/exceptions` (или `/issues-risks`) |
| 5 | Milestones | `/milestones` |

## 3. Snapshot A/B/C control

> **certainty:** hypothesis
>
> Глобальный переключатель в App Bar — **UX proposal**. Механизм backend/API — deferred implementation (OpenSpec: reproducibility without mandating switch UI).

Смена snapshot обновляет все виджеты согласованно с DOC-PROD-012 / будущим расширением популяции (без смены id).

## 4. Light / Dark theme

Переключатель в Application Bar; scope = весь shell + Page Surface + charts/tables. Intent: theme tokens (например next-themes + shadcn) — **не** ADR в этой волне.

## 5. Breadcrumbs

См. паттерны возврата в [entity-detail](./demo-v1-entity-detail.md) и [screens-and-flows](./demo-v1-screens-and-flows.md). MVP: возврат к разделу без восстановления фильтров допустим (`assumption`).
