---
id: DOC-UX-005
title: "Demo v1 Schedule workspace"
type: product
status: draft
version: "0.2.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-001
  - DOC-BA-015
  - REQ-EQPT-001
  - REQ-MILE-001
---

# Demo v1 Schedule workspace

> **certainty:** hypothesis
>
> D10–D11 = `approved UX decision`; D12 = `deferred decision`. Schedule = визуализация хранимых дат, **не** scheduling engine.

## 1. Scope (D11)

**Строки (view-model, не новая доменная сущность):**

- `Milestone` — baselineDate / forecastDate / rag
- `EquipmentDelivery` — baselineDelivery / forecastDelivery / status / isCritical

Опционально Decision.dueDate — только если поле присутствует и отдельно решено показывать.

**Запрещено в Demo v1 Schedule:** Activity / Task / WBS; CPM; task dependencies FS/SS; auto-schedule; drag-and-drop reschedule; фейковые bars длительности без duration в модели.

## 2. Table-first (D10)

**TanStack Table** — основное представление (`approved UX decision`, D10).

Колонки (только из данных): Type, ID, Name, Baseline date, Forecast date, Variance (derived), Status/RAG, Critical (**только** Equipment.isCritical), linked Issue/Risk при наличии реальных links.

Группировка: по type; по Phase — только если есть экземпляры Phase (`open_question` / не требовать).

Фильтры: дата, type, status/rag, critical, variance≠0, upcoming vs scenarioAsOfDate.

## 3. Read-only Gantt (secondary)

Toggle Table | Split | Gantt.

- Milestone — маркер на forecastDate; baseline — secondary/ghost marker (custom; не заявлять SVAR PRO baseline)
- Equipment — маркер на forecastDelivery (не multi-month task без duration)
- Без стрелок schedule-dependencies; causal viz — на Dashboard **только** с прямыми Domain links (не narrative chain как рёбра)

**Disclaimer в UI (proposal):** визуализация контрольных дат — не рассчитанный critical path.

## 4. Library (D12)

| Кандидат | Статус |
|----------|--------|
| SVAR React Gantt OS (`@svar-ui/react-gantt`) | Кандидат №1; MIT OS; baseline/CPM PRO **не** брать молча |
| Custom read-only timeline | Полноценная альтернатива |
| gantt-task-react | Допустимый lightweight alt |

> **certainty:** fact
>
> **D12 resolved:** `dhtmlx-gantt` Community Edition **MIT `10.0.3`** + project React adapter — [ADR-0004](../06-architecture/decisions/0004-d12-dhtmlx-gantt-community.md). Read-only Gantt as secondary view (D10) remains `approved UX decision`.

## 5. Navigation

Строка → Entity Detail. Breadcrumbs: `Schedule / <id>`. См. [entity-detail](./demo-v1-entity-detail.md).
