---
id: DOC-PROD-001
title: "Vision и scope"
type: product
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-002
  - DOC-PROD-003
  - DOC-ADR-0002
---

# Vision и scope

## Контекст названия

> **certainty:** hypothesis
>
> **Pharma Project Control** — рабочее имя системы для контроля/управления проектной деятельностью в фармацевтическом контексте. Детали домена, ролей и регуляторики **не зафиксированы** как факты.

## Предполагаемая ценность (направление)

> **certainty:** hypothesis
>
> Продукт должен помочь командам видеть статус проектных активностей и связанные артефакты в одном контуре (web UI + API), начиная с прозрачного Demo v1.

## Scope in (на уровне направления)

> **certainty:** hypothesis
>
> - Web-приложение (Next.js) и API (NestJS).
> - Документация как первоклассный артефакт (`docs/**`, позже Docusaurus).
> - Demo v1 без PostgreSQL (mock persistence в NestJS).

## Scope out (явно)

> **certainty:** fact
>
> - Выдуманные FR и GMP/валидационные требования в этом документе **не** формулируются.
> - Production hardening, полноценный authz-модель домена, CI enforcement coverage — не часть vision-seed W1.

## Открытые вопросы

> **certainty:** open_question
>
> Кто primary persona? Какие процессы «project control» входят в MVP? Какие регуляторные рамки реально применимы и из какого источника?

## Связанные документы

- [target-technology-stack](./target-technology-stack.md)
- [demo-v1-architecture](./demo-v1-architecture.md)
- [ADR-0002](../06-architecture/decisions/0002-target-technology-stack-direction.md)
