---
id: DOC-DISC-021
title: Сводка Discovery
type: discovery
status: draft
version: 0.2.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PHASE-DISC-001
  - DOC-DISC-011
  - DOC-DISC-012
  - DOC-DISC-019
  - DOC-DISC-020
  - DOC-DISC-018
  - DOC-HANDOFF-DISC-001
---
# Discovery summary

Синтез фазы Discovery (D0–D5). Certainty: source-`fact` ≠ применимость к предприятию.

## Статус фазы

> **certainty:** fact
>
> Артефакты Discovery D0–D5 созданы в `docs/01-discovery/`. Решения Product Owner по HIP-001, HIP-006, HIP-008 зафиксированы ([human-input-pack](./human-input-pack.md)). Фаза Discovery — **completed**. `openspec/specs/` и `openspec/changes/` **не** изменялись.

## Решения Product Owner

> **certainty:** fact
>
> Ниже — решения владельца продукта о направлении демо. Они **не** подтверждают процессы / org chart конкретного предприятия.

| Тема | Решение | HIP |
|------|---------|-----|
| Primary audience | Директор фармацевтического предприятия | HIP-001 |
| Secondary audience | Руководитель проекта / Project Controls | HIP-001 |
| UX-приоритет | Управленческое представление для директора | HIP-001 |
| Роль PM | Операционный пользователь: актуальность информации, статусов, рисков, отклонений | HIP-001 |
| Ведущая ценность | **H-002** (готовность, контрольные точки, угрозы дате запуска) — остаётся `hypothesis` о ценности | HIP-008 |
| Supporting ценность | **H-003** (единый контур для PM) — остаётся `hypothesis` | HIP-008 |
| Primary demo narrative | **SCN-001 → SCN-007** как единая связная история | HIP-006 |
| Доп. сцена | **SCN-006** необязательна; не расширять Demo v1 ради неё | HIP-006 |

Детали формулировок: [human-input-pack § Решения Product Owner](./human-input-pack.md). Сценарии: [management-scenarios](./management-scenarios.md). Кандидаты Demo v1: [demo-v1-scope-candidates](./demo-v1-scope-candidates.md) (**MoSCoW ≠ FR**).

## Что известно (с оговорками)

| Тема | Итог | Certainty |
|------|------|-----------|
| Контекст ценности | Единый контур; primary UX — директор; PM — операционный контур | hypothesis + PO direction ([product-context](./product-context.md), HIP) |
| Отраслевой LC | design→construction→equipment→CQV→readiness; EV-001…010 | source-fact в Evidence; применимость = hypothesis |
| Роли | 11 кандидатов SH-001…011 | hypothesis; не org chart заказчика |
| Процессы | PROC-001…011 inventory | hypothesis |
| Концепты | [information-concepts](./information-concepts.md) | conceptual, не ER |
| Сценарии | SCN-001…008; primary = SCN-001→SCN-007 | demo hypothesis; PO narrative = fact of choice |
| Границы | [product-boundaries](./product-boundaries.md) | preliminary |
| Demo v1 candidates | MoSCoW C-01…C-12 | **не FR**; preliminary rank |

## Гипотезы (ключевые)

- H-002 **po_selected_leading**, H-003 **po_selected_supporting**; H-001/H-004 и HYP-001…009 — см. [registers](./registers.md).
- HYP-010: primary SCN-001→SCN-007 (PO); SCN-006 optional.

## Открытое (человек)

| ID | Тема | Адресат | Почему open |
|----|------|---------|-------------|
| HIP-002 | Доступ к эксперту | product owner | Не решалось при закрытии Discovery |
| HIP-003 | GMP/CSV messaging | product owner | Не в пакете HIP-001/006/008 |
| HIP-004 | Один проект vs multi | product owner | Рабочее допущение boundaries; явного ответа нет |
| HIP-005 | Реальные процессы/роли заказчика | expert/customer | Enterprise applicability |
| HIP-007 | Platform showcase vs MVP framing | product owner | P-004 / framing |
| HIP-009 | Demo cast / применимость SH-* | expert/customer (+ PO) | Enterprise + personas |
| OQ-002…014 (кроме closed OQ-001/015) | См. [registers](./registers.md) | разное | Не закрыты решениями HIP-001/006/008 |

## Кандидатные OpenSpec capability-имена (гипотезы, не созданы)

> **certainty:** hypothesis
>
> Для **следующей** фазы (после планирования BA): `project-status-overview`, `milestone-readiness`, `equipment-delivery-status`, `risk-issue-impact`, `management-exception-report`. Living specs / changes в Discovery **не** создавались.

## Следующая фаза

1. **Business Analysis & Product Definition** по утверждённому narrative SCN-001→SCN-007 и audience (директор / PM supporting).
2. **Отдельно:** первые OpenSpec changes → human review → apply.
3. Затем Demo v1 implementation (не в этой фазе).
