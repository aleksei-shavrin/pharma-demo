---
id: DOC-DISC-019
title: "Preliminary product boundaries"
type: discovery
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-DISC-012
  - DOC-DISC-013
  - DOC-PROD-001
  - DOC-PROD-003
  - DOC-DISC-020
---

# Preliminary product boundaries

Предварительные границы продукта и Demo v1 по итогам D1–D3. **Не** утверждённые FR. Tech constraints Demo v1 — в [demo-v1-architecture](../03-product/demo-v1-architecture.md) (не дублировать).

## 1. Целевой продукт (направление)

> **certainty:** hypothesis
>
> **Pharma Project Control** — web-система управленческой видимости и контроля facility-проекта фармацевтического объекта: график/вехи, готовность, риски/проблемы, изменения, документация/handover, impact на дату запуска производства — с опорой на роли директора, PM и functional leads ([product-context](./product-context.md)).

> **certainty:** assumption
>
> Целевой стек (Next.js, NestJS, PostgreSQL, …) уже зафиксирован как **направление** в [target-technology-stack](../03-product/target-technology-stack.md) / ADR-0002; Discovery его не пересматривает.

## 2. В scope Discovery / будущего продукта (кандидат)

> **certainty:** hypothesis
>
> - Единый контур статуса проекта (отвечает на P-001 / P-002).
> - Вехи / gates и связь с equipment, CQV/readiness, документацией (HYP-001…003).
> - Risks, issues, change с влиянием на вехи и readiness (SCN-004, SCN-008).
> - Управленческая отчётность / exception view для директора и PM (PROC-011).
> - Концептуальные сущности из [information-concepts](./information-concepts.md).

## 3. Вне scope продукта на горизонте Discovery (явно)

> **certainty:** assumption
>
> - Полноценная GxP/CSV валидация самой системы как GxP-record.
> - Замена ERP/accounting, CAD, EDMS «как единственный SoT документов».
> - Утверждённые customer SOP / org RACI без expert/customer (HIP-005).
> - Multi-tenant SaaS / enterprise IAM — отложено (ADR backlog auth).

> **certainty:** open_question
>
> Нужна ли регуляторная лексика (GMP/CSV) в UI демо — HIP-003 / OQ-003.

## 4. Demo v1 vs целевой продукт

> **certainty:** fact
>
> Demo v1: FE+API, mock только в NestJS, без PostgreSQL, FE только через HTTP — см. [demo-v1-architecture](../03-product/demo-v1-architecture.md).

> **certainty:** hypothesis
>
> Demo v1 показывает **сквозной управленческий narrative** (один проект, ключевые сущности и 1–2 сценария из каталога), а не полный process inventory PROC-001…011.

## 5. Горизонт объекта демо

> **certainty:** open_question
>
> Один завод / один проект / multi-project — HIP-004 / OQ-004. До ответа: рабочее допущение ниже.

> **certainty:** assumption
>
> Для кандидатов Demo v1 принимаем **один facility-проект** (один Project) как минимальный связный контур данных, пока product owner не решит иначе.
