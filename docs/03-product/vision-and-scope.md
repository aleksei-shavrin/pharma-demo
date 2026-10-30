---
id: DOC-PROD-001
title: "Vision и scope"
type: product
status: draft
version: "0.2.0"
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
---

# Vision и scope

Актуализировано ссылками на Discovery (D5). Certainty утверждений **не** повышалась без человека.

## Контекст названия

> **certainty:** hypothesis
>
> **Pharma Project Control** — рабочее имя системы управленческой видимости facility-проекта в фармацевтическом контексте. Детали домена и оргструктуры заказчика — в Discovery как кандидаты, не как enterprise-fact. См. [product-context](../01-discovery/product-context.md), [domain-overview](../01-discovery/domain-overview.md).

## Предполагаемая ценность (направление)

> **certainty:** hypothesis
>
> Единый контур статуса проектных активностей, вех, готовности и связанных артефактов для директора предприятия, PM и functional leads (web UI + API), с убедительным Demo v1. Детализация ценности по ролям: [product-context](../01-discovery/product-context.md). Сценарии: [management-scenarios](../01-discovery/management-scenarios.md).

## Scope in (на уровне направления)

> **certainty:** hypothesis
>
> - Web (Next.js) + API (NestJS); см. [target-technology-stack](./target-technology-stack.md).
> - Управленческие возможности вокруг project status, milestones/readiness, equipment/delivery, risks/issues, impact на дату запуска — кандидаты в [demo-v1-scope-candidates](../01-discovery/demo-v1-scope-candidates.md) (**MoSCoW ≠ FR**).
> - Документация как первоклассный артефакт (`docs/**`, портал).
> - Demo v1 без PostgreSQL (mock в NestJS) — [demo-v1-architecture](./demo-v1-architecture.md).

## Scope out (явно)

> **certainty:** fact
>
> - Выдуманные FR и GMP/валидационные требования заказчика в этом документе **не** формулируются.
> - Полная GxP-валидация продукта, ERP/CAD/EDMS-замена — вне текущего направления; см. [product-boundaries](../01-discovery/product-boundaries.md).

## Открытые вопросы

> **certainty:** open_question
>
> Primary audience и demo narrative (HIP-001, HIP-006, HIP-008); применимость процессов к заказчику (HIP-005); messaging GMP/CSV (HIP-003). Сводка: [discovery-summary](../01-discovery/discovery-summary.md), [human-input-pack](../01-discovery/human-input-pack.md).

## Связанные документы

- Discovery: [discovery-summary](../01-discovery/discovery-summary.md), [product-boundaries](../01-discovery/product-boundaries.md)
- [target-technology-stack](./target-technology-stack.md)
- [demo-v1-architecture](./demo-v1-architecture.md)
- [ADR-0002](../06-architecture/decisions/0002-target-technology-stack-direction.md)
