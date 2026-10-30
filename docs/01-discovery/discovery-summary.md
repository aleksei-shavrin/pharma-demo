---
id: DOC-DISC-021
title: "Discovery summary"
type: discovery
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PHASE-DISC-001
  - DOC-DISC-012
  - DOC-DISC-019
  - DOC-DISC-020
  - DOC-DISC-018
---

# Discovery summary

Синтез фазы Discovery (D0–D5). Certainty: source-`fact` ≠ применимость к предприятию.

## Статус фазы

> **certainty:** fact
>
> Артефакты Discovery D0–D4 созданы в `docs/01-discovery/`. `openspec/specs/` и `openspec/changes/` **не** изменялись.

> **certainty:** open_question
>
> Критерий Discovery **`done`** vs **`paused`**: нет ответа владельца продукта на HIP-006 (primary demo narrative). Рекомендация команды: SCN-001→SCN-007 ([demo-v1-scope-candidates](./demo-v1-scope-candidates.md)).

## Что известно (с оговорками)

| Тема | Итог | Certainty |
|------|------|-----------|
| Контекст ценности | Единый контур статуса для директора/PM/leads; showcase low-code | hypothesis ([product-context](./product-context.md)) |
| Отраслевой LC | design→construction→equipment→CQV→readiness; EV-001…010 | source-fact в Evidence; применимость = hypothesis |
| Роли | 11 кандидатов SH-001…011 | hypothesis; не org chart заказчика |
| Процессы | PROC-001…011 inventory | hypothesis |
| Концепты | [information-concepts](./information-concepts.md) | conceptual, не ER |
| Сценарии | SCN-001…008 | hypothesis demos |
| Границы | [product-boundaries](./product-boundaries.md) | preliminary |
| Demo v1 candidates | MoSCoW C-01…C-12 | **не FR**; preliminary rank |

## Гипотезы (ключевые)

- H-001…H-004, HYP-001…010 — см. [registers](./registers.md).
- Primary narrative candidate: SCN-001→SCN-007.

## Открытое (человек)

| ID | Тема | Адресат |
|----|------|---------|
| HIP-001, HIP-008 | Audience / value lead | product owner |
| HIP-006 | Demo narrative | product owner |
| HIP-003 | GMP/CSV messaging | product owner |
| HIP-004 | Один проект vs multi | product owner |
| HIP-002, HIP-005 | Expert access / real processes | product owner / expert |

## Кандидатные OpenSpec capability-имена (гипотезы, не созданы)

> **certainty:** hypothesis
>
> Для **следующей** фазы (после human review Discovery): `project-status-overview`, `milestone-readiness`, `equipment-delivery-status`, `risk-issue-impact`, `management-exception-report`. Living specs / changes в Discovery **не** создавались.

## Следующая фаза

1. Product owner: HIP-006 (+ HIP-001/008).
2. Business Analysis / Product Definition по выбранному narrative.
3. **Отдельно:** первые OpenSpec changes → human review → apply.
4. Затем Demo v1 implementation (не в этой фазе).
