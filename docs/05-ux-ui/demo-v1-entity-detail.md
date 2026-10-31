---
id: DOC-UX-006
title: "Demo v1 Entity Detail pattern"
type: product
status: draft
version: "0.1.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-001
  - DOC-UX-002
  - DOC-BA-015
---

# Demo v1 Entity Detail pattern

> **certainty:** hypothesis
>
> D4 UX recommendation. Поля вкладок — только из Domain Model / REQ / mock. Без выдуманных history/docs/finance/comments.

## 1. Shared layout

```text
Breadcrumb: Section / EntityId
┌ Page Surface ─────────────────────────────┐
│ Entity header (id, title/name)            │
│ Status row (status | rag | type)          │
│ Metrics (только если данные позволяют)    │
│ Tabs: Overview | Links | Impact           │
└───────────────────────────────────────────┘
```

KPI-ряд ≥4 **не** обязателен на каждой карточке. Issue часто: status + links + Decision callout без фиктивных KPI.

**Critical на Milestone:** не доменное поле; выделение MS-PS — presentation-level only.

## 2. Tabs by entity (data-backed)

**Links** = только прямые связи DOC-BA-015 (или empty state). **Impact** = derived/presentation (BR-004/BR-006, aggregates); не подменять Links. Не добавлять FK. Сюжет `EQ → ISS → RISK → MS → PS` ≠ список Links.

| Entity | Overview | Links (direct only) | Impact (derived / presentation) |
|--------|----------|---------------------|----------------------------------|
| Equipment | delivery dates, status, isCritical, projectId | Issue(s); Risk(s). **Не** Milestone (нет прямой EQ—MS) | вклад в PS Δ (BR-004) — **derived/indirect** через Issue/Risk → MS; не Domain edge |
| Issue | title, status Open/Mitigating, ownerRole | Equipment; Milestone (MS-PS); Risk (0..1) | Mitigating после PrioritizeRecovery; Closed transitions не Must journey |
| Risk | title, rag | Issue? (0..1); Equipment?; Milestone | integrity vs BR-002; Red на B/C |
| Milestone | dates, rag | Issue(s); Risk(s); Decision(s). Equipment — **только** если явно labeled derived/indirect via Issue/Risk | alignment с PRJ forecast (BR-004); unchanged on C after Decision (BR-006) |

Empty state, если в snapshot нет прямой связи (например Impact Issue на A).

## 3. Breadcrumbs and return

| From | To detail | Back |
|------|-----------|------|
| Schedule | EQ / MS | Schedule (фильтры — best-effort) |
| Equipment list | EQ | Equipment list |
| Issues & Risks | ISS / RISK | Issues & Risks |
| Milestones | MS | Milestones |
| Dashboard | any | Dashboard; Snapshot global |
| Detail → related | только прямые Domain links; иначе явный derived/indirect | без новых FK; без narrative-as-edge |

> **certainty:** assumption
>
> MVP: возврат к разделу без восстановления filter/sort/page допустим.
