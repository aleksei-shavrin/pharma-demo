---
id: DOC-UX-010
title: Demo v1 — Visual Direction
type: product
status: draft
version: 0.2.0
created: '2026-10-31'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-UX-001
  - DOC-UX-011
  - DOC-UX-012
  - DOC-UX-002
---
# Demo v1 Visual Direction

> **certainty:** fact
>
> **VD-A — Industrial Control Lattice** утверждён как **Visual Direction baseline** для Demo v1 (решение владельца Demo v1 через делегирование UX/UI decision-making; не организационный/корпоративный approval). Frontmatter `status: draft` = lifecycle документа, не отмена baseline. D1–D11 / shell/stack остаются `approved UX decision` и **не** пересматриваются.

## 1. Purpose

Задать визуальный характер и принципы для последующего **UI Design / Design Specification** поверх принятого UX pack (shadcn/ui, TanStack Table, Recharts). Не Design System encyclopedia и не apps.

## 2. Constraints inherited (`approved UX decision`)

- Shell: Left Sidebar + Top Application Bar + breadcrumbs + Page Surface; Light/Dark; Snapshot A/B/C.
- D1–D11; D12 = **RESOLVED** (ADR-0004).
- KPI group ≥4 or omit; Links = direct Domain only; Schedule = Milestone + Equipment Delivery only.
- BR-006: PrioritizeRecovery без ложного улучшения forecast/RAG.
- Один shell Director + PM.

## 3. Direction selection

| ID | Name | Role for Demo v1 |
|----|------|------------------|
| **VD-A** | Industrial Control Lattice | **`approved Visual Direction baseline`** — единственное выбранное направление |
| **VD-B** | Precision Workbench | Рассмотренная альтернатива; **не** выбрана |
| **VD-C** | Narrative Ops Desk | Рассмотренная альтернатива; **не** выбрана |

Tokens и compositions ведутся под VD-A ([design-tokens](./demo-v1-design-tokens.md), [screen-compositions](./demo-v1-screen-compositions.md)).

## 4. VD-A identity (`approved Visual Direction baseline`)

### 4.1 Target character

Современный **enterprise project controls** product: зрелый промышленный инструмент управления проектом, а не шаблонный admin dashboard.

Сочетать: высокую информационную плотность; строгую типографическую иерархию; выразительную композицию зон; быструю считываемость отклонений; понятную управленческую историю на Dashboard; сдержанную, но заметную идентичность.

### 4.2 Anti-patterns (не целевой вид)

- Холодная «таблица Excel» на весь viewport.
- Чрезмерно техническая SCADA-панель (mimic HMI / mimic boards).
- Монотонный набор одинаковых прямоугольников и таблиц без иерархии.
- Типовой admin: сетка одинаковых KPI-карточек, marketing chrome, purple gradients, glow.

### 4.3 Visual principles (утверждены в рамках VD-A)

1. **Hierarchy over decoration** — зоны отвечают на вопросы Director (PS, Δ, causal, Decision).
2. **Surface depth with purpose** — background → Page Surface → panels → tiles → table → nested; elevation 0–2; без multi-layer shadow stacks.
3. **Status is multi-channel** — label + color + marker/shape + placement; не только цвет.
4. **Dense but scannable** — tabular figures для дат/Δ; clear row rhythm; whitespace как структура, не «воздух ради воздуха».
5. **Honesty** — Snapshot C не «зеленеет» после PrioritizeRecovery (BR-006).
6. **shadcn-native** — визуальный язык как theme tokens поверх shadcn, не отдельный widget kit.

## 5. Mapping to D1–D11

| UX | Visual implication (VD-A baseline) |
|----|-------------------------------------|
| D1/D3/D8 Dashboard | Narrative-first composition; не KPI gallery |
| D2/D9 Sidebar | Compact nav; clear active state; brand quiet |
| D4 Detail | Tabs Overview/Links/Impact; Links quieter than Impact callouts |
| D5 Δ strip | High visual priority for delivery→PS relationship; labels ≠ confuse delivery with PS |
| D6 Decision | Distinct panel; honesty strip (unchanged forecast/RAG) |
| D7 One shell | No role-skin variants |
| D10/D11 Schedule | Table primary visual weight; Gantt secondary, marker-based, no dependency arrows |
| D12 | Look of read-only timeline; lib **RESOLVED** (ADR-0004) |

## 6. Approved vs still open

| Topic | Status |
|-------|--------|
| VD-A as Demo v1 Visual Direction | `approved Visual Direction baseline` |
| Visual language principles + screen composition under VD-A | approved within VD-A |
| Illustrative / final HEX and exact token values | **UI Design** (not finalized here) |
| Contrast / accessibility measurement | **UI Design / implementation** (principle only in tokens doc) |
| D12 Gantt library | **RESOLVED** (ADR-0004, I7) |
| BA-OQ / HIP (006, 004/005, 002, …) | remain open if previously open |
| Mock data volume | `hypothesis` (not approved volume) |

Отдельный APPROVE VD-A **больше не требуется** — baseline принят. Следующий допустимый этап: **UI Design / Design Specification** (не стартует автоматически).

## 7. Related

- [design-tokens](./demo-v1-design-tokens.md) · [screen-compositions](./demo-v1-screen-compositions.md) · [visual-references](./demo-v1-visual-references.md) · [ux-concept](./demo-v1-ux-concept.md)
