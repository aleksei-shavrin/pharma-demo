---
id: DOC-UX-006
title: Demo v1 — паттерн Entity Detail
type: product
status: draft
version: 0.2.1
created: '2026-10-31'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-UX-001
  - DOC-UX-002
  - DOC-BA-015
---
# Demo v1 Entity Detail pattern

> **certainty:** hypothesis
>
> D4 = `approved UX decision`. Поля вкладок — только из Domain Model / REQ / mock. Без выдуманных history/docs/finance/comments.

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

Tabs Overview · Links · Impact — `approved UX decision`.

**KPI / metric tiles:** только при обоснованных данных. Если группа метрик показана — в ней **≥4** элемента; не изобретать метрики ради заполнения. Если честных ≥4 нет — группу не показывать (часто для Issue: status + links + Decision callout в Impact без KPI-ряда).

**Critical на Milestone:** не доменное поле; выделение MS-PS — presentation-level only.

## 2. Tabs by entity (data-backed)

**Links** = только прямые связи [DOC-BA-015](../02-business-analysis/domain-model-demo-v1.md) (или empty state). **Impact** = derived/presentation (BR-004/BR-006, aggregates); не подменять Links. Не добавлять FK. Сюжет `EQ → ISS → RISK → MS → PS` ≠ список Links.

### Сверка прямых связей (DOC-BA-015)

Кардинальность — как в [domain-model-demo-v1.md](../02-business-analysis/domain-model-demo-v1.md) (число слева = сторона первой сущности в имени связи). Новых связей UX не добавляет.

| Связь (DOC-BA-015) | Кардинальность | UX Links | Примечание |
|--------------------|----------------|----------|------------|
| Project — Phase | 1 — 0..\* | не chip Links detail | ownership / overview context |
| Project — Milestone | 1 — 1..\* | не chip Links detail | ownership / overview context |
| Project — Equipment | 1 — 1..\* | не chip Links detail | ownership (`Equipment.projectId`) |
| Project — Risk | 1 — 0..\* | не chip Links detail | ownership |
| Project — Issue | 1 — 0..\* | не chip Links detail | ownership |
| Project — Decision | 1 — 0..\* | не chip Links detail | ownership (= Decision—Project \* — 1) |
| Equipment — Issue | 1 — 0..\* | да | EQ Links → Issue(s); Issue Links → Equipment |
| Equipment — Risk | 1 — 0..\* | да | EQ Links → Risk(s); Risk Links → Equipment (если `equipmentId` задан) |
| Issue — Risk | 0..1 — 0..1 | да | Demo v1 assumption пары; Risk.`issueId`? |
| Issue — Milestone | \* — 1 | да | Issue Links → Milestone; Milestone Links → Issue(s) |
| Risk — Milestone | \* — 1 | да | Risk Links → Milestone; Milestone Links → Risk(s) |
| Decision — Project | \* — 1 | не chip Links detail | ownership (см. Project — Decision) |
| Decision — Milestone | \* — 0..1 | да (Links) | **Прямая связь** через `Decision.milestoneId?`. Milestone Links → Decision(s) с этим `milestoneId`. Обычно MS-PS |
| Equipment — Milestone | — | **нет** | прямой связи в Domain нет; не показывать в Links |
| Issue — Decision | — | **нет** | нет Domain edge; Mitigating / PrioritizeRecovery → Impact |
| Equipment — Decision | — | **нет** | нет Domain edge |
| Risk — Decision | — | **нет** | нет Domain edge; rag unchanged (BR-006) → Impact |

**Decision — Milestone: Links vs Impact**

- **Links:** только прямая связь `Decision.milestoneId` → Milestone (кардинальность Decision—Milestone \* — 0..1).
- **Impact:** производное влияние записи Decision на forecast/RAG Milestone / PS — **не** Domain edge; по BR-006 PrioritizeRecovery **не** меняет forecast/RAG (honesty). Не выдавать за Links.

| Entity | Overview | Links (direct only) | Impact (derived / presentation) |
|--------|----------|---------------------|----------------------------------|
| Equipment | delivery dates, status, isCritical, projectId | Issue(s) (1—0..\*); Risk(s) (1—0..\*). **Не** Milestone | вклад в PS Δ (BR-004) — **derived/indirect** через Issue/Risk → MS |
| Issue | title, status Open/Mitigating, ownerRole | Equipment; Milestone (\*—1); Risk (0..1—0..1). **Не** Decision | Mitigating после PrioritizeRecovery (запись Decision, не execution); Closed transitions не Must journey |
| Risk | title, rag | Issue (0..1—0..1, если задан); Equipment (via Equipment—Risk, если задан); Milestone (\*—1) | integrity vs BR-002; Red на 02/03; Decision не меняет rag (BR-006) — Impact, не Links |
| Milestone | dates, rag | Issue(s); Risk(s); Decision(s) via `Decision.milestoneId`. Equipment — **только** labeled derived/indirect via Issue/Risk | alignment с PRJ forecast (BR-004); forecast/RAG unchanged on 03 after Decision (BR-006) — **Impact**, не Links |

Empty state, если в snapshot нет прямой связи (например Impact Issue на 01).

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
