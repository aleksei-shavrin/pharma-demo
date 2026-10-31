---
id: DOC-UX-010
title: "Demo v1 Visual Direction"
type: product
status: draft
version: "0.1.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-001
  - DOC-UX-011
  - DOC-UX-012
  - DOC-UX-002
---

# Demo v1 Visual Direction

> **certainty:** hypothesis
>
> Визуальная концепция Demo v1. Все **новые** утверждения ниже — `proposal` до отдельного human review Visual Direction. D1–D11 / shell/stack остаются `approved UX decision` и **не** пересматриваются. Frontmatter `status: draft`.

## 1. Purpose

Задать визуальный характер и принципы для последующего UI Design / реализации поверх принятого UX pack (shadcn/ui, TanStack Table, Recharts). Не Design System encyclopedia и не apps.

## 2. Constraints inherited (`approved UX decision`)

- Shell: Left Sidebar + Top Application Bar + breadcrumbs + Page Surface; Light/Dark; Snapshot A/B/C.
- D1–D11; D12 = `deferred decision`.
- KPI group ≥4 or omit; Links = direct Domain only; Schedule = Milestone + Equipment Delivery only.
- BR-006: PrioritizeRecovery без ложного улучшения forecast/RAG.
- Один shell Director + PM.

## 3. Direction comparison (`proposal`)

| ID | Name | Character | Fit for Demo v1 |
|----|------|-----------|-----------------|
| **VD-A** | Industrial Control Lattice | Современный enterprise project controls: плотность + иерархия + выразительная композиция; slate/steel нейтрали; умеренная глубина поверхностей | **Primary (confirmed для этой волны)** |
| **VD-B** | Precision Workbench | Светлый B2B; сдержанный синий accent; ближе к stock shadcn | Альтернатива сравнения |
| **VD-C** | Narrative Ops Desk | Сильнее editorial hierarchy на Dashboard; реестры dense | Альтернатива сравнения |

**Primary:** VD-A. Tokens и compositions — под VD-A ([design-tokens](./demo-v1-design-tokens.md), [screen-compositions](./demo-v1-screen-compositions.md)).

## 4. VD-A identity (`proposal`)

### 4.1 Target character

Современный **enterprise project controls** product: зрелый промышленный инструмент управления проектом, а не шаблонный admin dashboard.

Сочетать: высокую информационную плотность; строгую типографическую иерархию; выразительную композицию зон; быструю считываемость отклонений; понятную управленческую историю на Dashboard; сдержанную, но заметную идентичность.

### 4.2 Anti-patterns (не целевой вид)

- Холодная «таблица Excel» на весь viewport.
- Чрезмерно техническая SCADA-панель (mimic HMI / mimic boards).
- Монотонный набор одинаковых прямоугольников и таблиц без иерархии.
- Типовой admin: сетка одинаковых KPI-карточек, marketing chrome, purple gradients, glow.

### 4.3 Visual principles

1. **Hierarchy over decoration** — зоны отвечают на вопросы Director (PS, Δ, causal, Decision).
2. **Surface depth with purpose** — background → Page Surface → panels → tiles → table → nested; elevation 0–2; без multi-layer shadow stacks.
3. **Status is multi-channel** — label + color + marker/shape + placement; не только цвет.
4. **Dense but scannable** — tabular figures для дат/Δ; clear row rhythm; whitespace как структура, не «воздух ради воздуха».
5. **Honesty** — Snapshot C не «зеленеет» после PrioritizeRecovery (BR-006).
6. **shadcn-native** — визуальный язык как theme tokens поверх shadcn, не отдельный widget kit.

## 5. Mapping to D1–D11

| UX | Visual implication (proposal) |
|----|-------------------------------|
| D1/D3/D8 Dashboard | Narrative-first composition; не KPI gallery |
| D2/D9 Sidebar | Compact nav; clear active state; brand quiet |
| D4 Detail | Tabs Overview/Links/Impact; Links quieter than Impact callouts |
| D5 Δ strip | High visual priority for delivery→PS relationship; labels ≠ confuse delivery with PS |
| D6 Decision | Distinct panel; honesty strip (unchanged forecast/RAG) |
| D7 One shell | No role-skin variants |
| D10/D11 Schedule | Table primary visual weight; Gantt secondary, marker-based, no dependency arrows |
| D12 | Look of read-only timeline only; lib choice deferred |

## 6. Open / deferred (не закрывать)

- BA-OQ-006, BA-OQ-004/005, BA-OQ-002 / HIP-*, Closed/Amber, mock volume `hypothesis`, D12 lib.
- Human APPROVE Visual Direction as design baseline — отдельно после review этих docs.

## 7. Related

- [design-tokens](./demo-v1-design-tokens.md) · [screen-compositions](./demo-v1-screen-compositions.md) · [visual-references](./demo-v1-visual-references.md) · [ux-concept](./demo-v1-ux-concept.md)
