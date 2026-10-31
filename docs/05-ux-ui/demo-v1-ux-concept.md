---
id: DOC-UX-001
title: "Demo v1 UX concept"
type: product
status: draft
version: "0.1.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-README-001
  - DOC-PROD-011
  - DOC-BA-012
  - DOC-BA-010
  - DOC-UX-009
---

# Demo v1 UX concept

> **certainty:** hypothesis
>
> Документ фиксирует **UX Discovery recommendations / proposal baseline** (D1–D12). Это **не** пакет per-item human APPROVE UX-layout. Frontmatter `status: draft`. Domain Model, BR, REQ и living OpenSpec Must сохраняют статус источников требований; UX-композиция — `UX proposal`, пока human отдельно не утвердит.

## 1. Executive summary

Pharma Project Control **Demo v1** — компактное enterprise-приложение для директора (primary) и PM (secondary). Главный narrative: Snapshots **A → B → C** и Decision **PrioritizeRecovery** без ложного «улучшения» прогноза (BR-006).

**Рекомендуемая IA (proposal):** Application Shell с пятью разделами Sidebar; Director Impact на **Dashboard**; **Schedule** — визуализация control points (Milestone + Equipment delivery), не Activity/CPM.

## 2. Audience

| Роль | Фокус | Источник needs |
|------|-------|----------------|
| Director (SH-001) | PS baseline/forecast, драйвер delay, Decision | DOC-BA-012 N-DIR-* |
| Project Manager (SH-002) | Реестры, links, подготовка exception view | DOC-BA-012 N-PM-* |

Один shell / одна IA для обеих ролей (D7, proposal).

## 3. Goals

1. За 30–60 с на Snapshot B понять угрозу production start и драйвер EQ.
2. На Snapshot C увидеть PrioritizeRecovery и **что не изменилось** (forecast, Risk/MS Red).
3. Дать PM рабочие реестры и Schedule Table без выдуманного WBS.

## 4. Decision register D1–D12

Статус всех строк: **`UX Discovery recommendation` / `proposal baseline`** — без per-item human APPROVE.

| ID | Recommendation |
|----|----------------|
| D1 | Стартовая страница — Dashboard в Application Shell |
| D2 | Sidebar multi-page (см. D9) |
| D3 | Приоритет Director: PS / отклонения / Decision на Dashboard |
| D4 | Entity Detail: Full Page + Tabs; Breadcrumbs / возврат |
| D5 | Явная Δ delivery → PS; подписи delivery ≠ production start |
| D6 | PrioritizeRecovery: панель + honesty BR-006 |
| D7 | Один shell для Director и PM |
| D8 | Композиция Dashboard (KPI, causal, Decision, exceptions preview); **BA-OQ-006 open** для layout Issue/Risk на реестре |
| D9 | Sidebar: Dashboard, Schedule, Equipment, Issues & Risks, Milestones |
| D10 | Schedule: TanStack Table primary; read-only Gantt secondary |
| D11 | Schedule rows = Milestone + Equipment delivery only; без Activity / WBS / CPM / scheduling engine |
| D12 | Gantt: SVAR OS кандидат №1; custom timeline — полноценная альтернатива; **выбор lib отложен** |

Детали: [shell-navigation](./demo-v1-shell-navigation.md), [dashboard](./demo-v1-dashboard.md), [schedule](./demo-v1-schedule-workspace.md), [traceability](./demo-v1-ux-traceability.md).

## 5. Hard constraints (источники требований)

| Constraint | Источник |
|------------|----------|
| Нет независимой Activity entity | DOC-BA-015; PROC-001; OpenSpec |
| Нет CPM / auto-reforecast / recovery execution | BR-006; BA-A-003; living specs |
| Issue ≠ Risk | BA-OQ-003 closed; Domain; REQ-RISK-001 |
| Нет UI layout prescription в OpenSpec | management-exception-report; REQ-IMPCT-001 |
| FE данные только через HTTP API (позже) | REQ-NFR-001; demo-v1-architecture-constraints |
| Must C-01…C-05; C-06/C-07 out | BA-OQ-001; DOC-PROD-011 |
| AcceptDateSlip не Must journey | REQ-IMPCT-002; BA-OQ-004/005 open |

## 6. Open questions (не закрывать этим proposal)

- **BA-OQ-006** — UI layout Issue и Risk
- **BA-OQ-004 / BA-OQ-005** — AcceptDateSlip post-state
- **BA-OQ-002 / HIP-003/004/007 / HIP-005** — messaging / framing / enterprise-fact
- **Closed** / **Amber** в ambient mock — без отдельного решения не использовать
- **D12** — финальный выбор Gantt library (после tech evaluation)
- Phase grouping; глубина persistence фильтров списка при Back

## 7. Связанные UX docs

| Документ | Роль |
|----------|------|
| [shell-navigation](./demo-v1-shell-navigation.md) | Shell, nav, theme, Snapshot |
| [screens-and-flows](./demo-v1-screens-and-flows.md) | Inventory + A→B→C |
| [dashboard](./demo-v1-dashboard.md) | Director home |
| [schedule-workspace](./demo-v1-schedule-workspace.md) | Schedule |
| [entity-detail](./demo-v1-entity-detail.md) | Detail pattern |
| [data-viz-and-components](./demo-v1-data-viz-and-components.md) | Tables/charts stack |
| [mock-ux-requirements](./demo-v1-mock-ux-requirements.md) | Volume hypothesis + integrity |
| [ux-traceability](./demo-v1-ux-traceability.md) | Trace matrix |
