---
id: DOC-UX-004
title: "Demo v1 Dashboard"
type: product
status: draft
version: "0.1.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-001
  - REQ-IMPCT-001
  - REQ-IMPCT-002
  - DOC-BA-014
  - DOC-PROD-012
---

# Demo v1 Dashboard

> **certainty:** hypothesis
>
> Композиция Dashboard — UX proposal (D1, D3, D5, D6, D8). Данные и integrity — REQ-IMPCT / BR / mock. BA-OQ-006 **не** закрывается.

## 1. Назначение

Director-first home: состояние production start, драйвер отклонения, causal visualization по Domain links, Decision.

> **certainty:** assumption
>
> **Narrative vs Domain links.** Сюжетный порядок mock `EQ → ISS → RISK → MS → PS` (DOC-PROD-012) — storytelling sequence, **не** схема прямых рёбер и **не** layout causal viz. Рёбра viz = только прямые связи [DOC-BA-015](../02-business-analysis/domain-model-demo-v1.md): Equipment—Issue, Equipment—Risk, Issue—Risk, Issue—Milestone, Risk—Milestone (плюс Project ownership). **Нет** прямой Equipment—Milestone. Путь EQ→MS только через Issue и/или Risk. `PS` / Project.forecastProductionStart — alignment с MS-PS по BR-004 (атрибут/агрегат), не отдельное Domain-ребро EQ→PS. Опосредованные отношения в UI помечать как derived/indirect.

## 2. Page composition (внутри Page Surface)

| Block | User question | Data source |
|-------|---------------|-------------|
| Project header | Какой проект / asOf? | PRJ-01; scenarioAsOfDate (mock) |
| KPI row | Каков PS и slip? | baselineProductionStart, forecastProductionStart; Δ derived; MS-PS.rag; EQ-HVAC-01.status (и агрегаты при расширении mock — hypothesis) |
| Causal viz | Почему угроза PS? | Только **прямые** Domain links (DOC-BA-015), присутствующие в snapshot; узлы EQ/ISS/RISK/MS (+ PS как label MS/Project aggregate). Не рисовать линейную цепочку narrative как рёбра; не рисовать EQ—MS |
| Δ strip | Как delay связан с PS? | BR-004; delivery dates ≠ PS labels (REQ-EQPT / REQ-IMPCT); Δ = derived math, не Domain edge |
| Decision panel | Какое решение зафиксировано? | Decision type; Issue Mitigating; honesty: forecast/RAG unchanged (BR-006) |
| Exceptions preview | Что открыть дальше? | Top ISS/RISK refs → Issues & Risks |
| Compact Schedule widget | Что ближайшее / slipping? | Subset control points → Schedule |
| Optional chart | Как двигался forecast A/B/C? | Три точки mock snapshots (Recharts); не runtime forecast engine |

## 3. KPI rules

Только реальные поля или derived Δ (forecast−baseline). Не обязательны «ровно 4» декоративных плитки при нехватке данных — предпочтительнее честная композиция.

При расширении mock (hypothesis): агрегаты Dashboard **должны** совпадать со счётчиками реестров.

## 4. BA-OQ-006

> **certainty:** open_question
>
> Layout Issue vs Risk на полном реестре Issues & Risks — **open** (BA-OQ-006). На Dashboard допустим typed preview (две колонки type или явные labels) как **proposal**, не закрытие OQ.
