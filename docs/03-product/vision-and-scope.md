---
id: DOC-PROD-001
title: "Vision и scope"
type: product
status: draft
version: "0.4.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-002
  - DOC-PROD-003
  - DOC-ADR-0002
  - DOC-DISC-012
  - DOC-DISC-019
  - DOC-DISC-021
  - DOC-DISC-011
  - DOC-BA-017
  - DOC-PROD-011
---

# Vision и scope

Актуализировано по итогам Discovery (PO) и BA/PD Demo v1. Certainty утверждений о предприятии **не** повышалась до `fact` без эксперта/заказчика.

## Контекст названия

> **certainty:** hypothesis
>
> **Pharma Project Control** — рабочее имя системы управленческой видимости facility-проекта в фармацевтическом контексте. Детали домена и оргструктуры заказчика — в Discovery как кандидаты, не как enterprise-fact. См. [product-context](../01-discovery/product-context.md), [domain-overview](../01-discovery/domain-overview.md).

## Предполагаемая ценность (направление)

> **certainty:** hypothesis
>
> Единый контур статуса проектных активностей, вех, готовности и связанных артефактов (web UI + API), с убедительным Demo v1. **Ведущая** гипотеза ценности — для директора (H-002); **supporting** — для PM (H-003). Детали и фиксация выбора PO: [discovery-summary](../01-discovery/discovery-summary.md), [human-input-pack](../01-discovery/human-input-pack.md), [product-context](../01-discovery/product-context.md).

## Аудитория и demo narrative (решение PO)

> **certainty:** fact
>
> Product Owner зафиксировал направление демо (не enterprise-process confirmation):
>
> - Primary audience — директор фармацевтического предприятия; secondary — PM / Project Controls; UX-приоритет — управленческий вид директора.
> - Primary demo story — **SCN-001 → SCN-007**; SCN-006 — необязательная доп. сцена без расширения Demo v1 ради неё.
>
> Источник формулировок: [human-input-pack](../01-discovery/human-input-pack.md). Каталог сценариев: [management-scenarios](../01-discovery/management-scenarios.md).

## Scope in (на уровне направления)

> **certainty:** hypothesis
>
> - Web (Next.js) + API (NestJS); см. [target-technology-stack](./target-technology-stack.md).
> - Demo v1 capabilities C-01…C-05 и proposed functional scope: [demo-v1-capabilities](./demo-v1-capabilities.md), [demo-v1-functional-scope](./demo-v1-functional-scope.md) (**proposed freeze**; PO BA-OQ-001). Discovery MoSCoW: [demo-v1-scope-candidates](../01-discovery/demo-v1-scope-candidates.md).
> - Draft behavior REQ: [`04-requirements/`](../04-requirements/README.md).
> - Документация как первоклассный артефакт (`docs/**`, портал).
> - Demo v1 без PostgreSQL (mock в NestJS) — [demo-v1-architecture](./demo-v1-architecture.md).

## Scope out (явно)

> **certainty:** fact
>
> - Выдуманные FR и GMP/валидационные требования заказчика в этом документе **не** формулируются.
> - Полная GxP-валидация продукта, ERP/CAD/EDMS-замена — вне текущего направления; см. [product-boundaries](../01-discovery/product-boundaries.md).
> - SCN-006 как обязательная сцена Demo v1 — вне scope (HIP-006).

## Открытые вопросы

> **certainty:** open_question
>
> PO freeze Demo v1 scope (BA-OQ-001); messaging GMP/CSV (HIP-003); горизонт (HIP-004); framing platform vs MVP (HIP-007); применимость к заказчику (HIP-005). Сводка: [ba-pd-summary](../02-business-analysis/ba-pd-summary.md), [discovery-summary](../01-discovery/discovery-summary.md), [human-input-pack](../01-discovery/human-input-pack.md).

## Связанные документы

- BA/PD: [ba-pd-summary](../02-business-analysis/ba-pd-summary.md), [demo-v1-functional-scope](./demo-v1-functional-scope.md)
- Discovery: [discovery-summary](../01-discovery/discovery-summary.md), [product-boundaries](../01-discovery/product-boundaries.md), [human-input-pack](../01-discovery/human-input-pack.md)
- [target-technology-stack](./target-technology-stack.md)
- [demo-v1-architecture](./demo-v1-architecture.md)
- [ADR-0002](../06-architecture/decisions/0002-target-technology-stack-direction.md)
