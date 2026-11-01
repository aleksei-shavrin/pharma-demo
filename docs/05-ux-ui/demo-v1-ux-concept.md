---
id: DOC-UX-001
title: "Demo v1 UX concept"
type: product
status: draft
version: "0.2.2"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-README-001
  - DOC-PROD-011
  - DOC-BA-012
  - DOC-BA-010
  - DOC-UX-009
  - DOC-UX-010
---

# Demo v1 UX concept

> **certainty:** hypothesis
>
> Документ фиксирует **принятые UX-решения для Demo v1** (D1–D11 = `approved UX decision`; D12 = `deferred decision`) плюс открытые BA-OQ/HIP и mock `hypothesis`. Frontmatter `status: draft` — жизненный цикл документа, **не** статус UX-решений. Domain Model, BR, REQ и living OpenSpec Must остаются источниками требований; AI не ставит `status: approved` на UX docs.

## 1. Executive summary

Pharma Project Control **Demo v1** — компактное enterprise-приложение для директора (primary) и PM (secondary). Главный narrative: Snapshots **A → B → C** и Decision **PrioritizeRecovery** без ложного «улучшения» прогноза (BR-006).

**IA (approved UX decision):** Application Shell с пятью разделами Sidebar; Director Impact на **Dashboard**; **Schedule** — визуализация control points (Milestone + Equipment delivery), не Activity/CPM.

## 2. Audience

| Роль | Фокус | Источник needs |
|------|-------|----------------|
| Director (SH-001) | PS baseline/forecast, драйвер delay, Decision | DOC-BA-012 N-DIR-* |
| Project Manager (SH-002) | Реестры, links, подготовка exception view | DOC-BA-012 N-PM-* |

Один shell / одна IA для обеих ролей (D7, `approved UX decision`).

## 3. Goals

1. За 30–60 с на Snapshot B понять угрозу production start и драйвер EQ.
2. На Snapshot C увидеть PrioritizeRecovery и **что не изменилось** (forecast, Risk/MS Red).
3. Дать PM рабочие реестры и Schedule Table без выдуманного WBS.

## 4. Decision register D1–D12

| ID | Решение | Decision Status | Где зафиксировано |
|----|---------|-----------------|-------------------|
| D1 | Dashboard — стартовая страница | `approved UX decision` | [shell](./demo-v1-shell-navigation.md), [screens](./demo-v1-screens-and-flows.md), [dashboard](./demo-v1-dashboard.md) |
| D2 | Многостраничная структура с Left Sidebar | `approved UX decision` | [shell](./demo-v1-shell-navigation.md) |
| D3 | IA ориентирована прежде всего на Project Director | `approved UX decision` | [dashboard](./demo-v1-dashboard.md) |
| D4 | Entity Detail: Full Page + Tabs + breadcrumbs | `approved UX decision` | [entity-detail](./demo-v1-entity-detail.md) |
| D5 | Явно показывать влияние задержки EQ delivery на Production Start | `approved UX decision` | [dashboard](./demo-v1-dashboard.md) |
| D6 | PrioritizeRecovery — отдельная управленческая Decision; не изображать execution recovery | `approved UX decision` | [dashboard](./demo-v1-dashboard.md), [screens](./demo-v1-screens-and-flows.md) |
| D7 | Director и PM — один интерфейс и одна навигация | `approved UX decision` | [shell](./demo-v1-shell-navigation.md), [screens](./demo-v1-screens-and-flows.md) |
| D8 | Композиция Dashboard утверждена; Issues/Risks Register — единый + `Тип` (**BA-OQ-006 closed**) | `approved UX decision` + Demo v1 decision | [dashboard](./demo-v1-dashboard.md) |
| D9 | Sidebar: Dashboard, Schedule, Equipment, Issues & Risks, Milestones | `approved UX decision` | [shell](./demo-v1-shell-navigation.md) |
| D10 | TanStack Table primary; Gantt read-only secondary | `approved UX decision` | [schedule](./demo-v1-schedule-workspace.md), [data-viz](./demo-v1-data-viz-and-components.md) |
| D11 | Schedule = Milestone + Equipment Delivery only; без Activity/WBS/CPM/deps/engine | `approved UX decision` | [schedule](./demo-v1-schedule-workspace.md) |
| D12 | Выбор Gantt-библиотеки отложен; SVAR React Gantt — кандидат | `deferred decision` | [schedule](./demo-v1-schedule-workspace.md), [data-viz](./demo-v1-data-viz-and-components.md) |

Traceability: [demo-v1-ux-traceability.md](./demo-v1-ux-traceability.md).

## 5. Approved shell / stack (сводка)

| Тема | Решение | Decision Status |
|------|---------|-----------------|
| Layout | Left Sidebar + Top Application Bar + breadcrumbs + Page Surface (фон, отделение от shell) | `approved UX decision` |
| Theme | Light/Dark toggle в Application Bar | `approved UX decision` |
| Snapshot | Глобальный A/B/C в основном UI | `approved UX decision` (UI control); backend mechanism — deferred impl |
| UI kit | shadcn/ui | `approved UX decision` |
| Tables | TanStack Table | `approved UX decision` |
| Charts | Recharts | `approved UX decision` |
| Entity Detail tabs | Overview · Links · Impact | `approved UX decision` |
| Links vs Impact | Links = только прямые Domain links; derived/causal — Impact | `approved UX decision` |
| KPI tiles | Только при обоснованных данных; если группа метрик есть — ≥4; не изобретать метрики | `approved UX decision` |
| Density | Содержательная плотность, не декоративное заполнение | `approved UX decision` |

## 6. Hard constraints (источники требований)

| Constraint | Источник |
|------------|----------|
| Нет независимой Activity entity | DOC-BA-015; PROC-001; OpenSpec |
| Нет CPM / auto-reforecast / recovery execution | BR-006; BA-A-003; living specs |
| Issue ≠ Risk | BA-OQ-003 closed; Domain; REQ-RISK-001 |
| Нет UI layout prescription в OpenSpec | management-exception-report; REQ-IMPCT-001 |
| FE данные только через HTTP API (позже) | REQ-NFR-001; demo-v1-architecture-constraints |
| Must C-01…C-05; C-06/C-07 out | BA-OQ-001; DOC-PROD-011 |
| AcceptDateSlip не Must journey | REQ-IMPCT-002; BA-OQ-004/005 open |

## 7. Open questions (не закрывать)

- ~~**BA-OQ-006**~~ — UI layout Issue и Risk на реестре (**closed**, DOC-BA-010)
- **BA-OQ-004 / BA-OQ-005** — AcceptDateSlip post-state
- **BA-OQ-002 / HIP-003/004/007 / HIP-005** — messaging / framing / enterprise-fact
- **Closed** / **Amber** в ambient mock — без отдельного решения не использовать
- **D12** — финальный выбор Gantt library (`deferred decision` / tech evaluation)
- Phase grouping; глубина persistence фильтров списка при Back (`assumption` / `open_question`)
- Mock volume scale — `hypothesis` (DOC-PROD-012 не менять этим пакетом)

## 8. Связанные UX / Visual Direction docs

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
| [visual-direction](./demo-v1-visual-direction.md) | VD-A `approved Visual Direction baseline` |
| [design-tokens](./demo-v1-design-tokens.md) | Token roles/principles under VD-A; HEX → UI Design |
| [screen-compositions](./demo-v1-screen-compositions.md) | Screen layouts under VD-A baseline |
| [visual-references](./demo-v1-visual-references.md) | Reference honesty log |
