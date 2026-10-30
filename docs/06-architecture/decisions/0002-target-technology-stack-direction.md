---
id: DOC-ADR-0002
title: "ADR-0002: Target technology stack direction"
type: adr
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-002
  - DOC-PROD-003
  - DOC-ADR-0001
---

# ADR-0002: Target technology stack direction

- **Статус решения:** accepted (направление)
- **Дата:** 2026-10-30

## Контекст

Нужно зафиксировать направление стека приложения до детальной реализации, не выдавая его за финальные версии пакетов.

## Решение

> **certainty:** hypothesis
>
> Целевое направление:
>
> - **Next.js** App Router + **TypeScript** + **Tailwind CSS** (FE)
> - **NestJS** + **TypeScript** (BE)
> - **REST + OpenAPI**
> - **PostgreSQL** как целевая БД
> - **Docker Compose** для локального контура
>
> Demo v1: без PostgreSQL; mock persistence только в NestJS.

## Последствия

### Положительные

- Единый язык TS.
- Контракт API явен через OpenAPI.
- Путь эволюции persistence через adapter.

### Отрицательные / компромиссы

- Два runtime (Node FE/BE) vs BFF-only — большеmoving частей локально.
- Выбор ORM/миграций отложен.

## Альтернативы

- FE-only mock без NestJS — отвергнуто правилами Demo v1.
- GraphQL first — не выбрано на старте (можно пересмотреть отдельным ADR).

## Ссылки

- [target-technology-stack](../../03-product/target-technology-stack.md)
- [demo-v1-architecture](../../03-product/demo-v1-architecture.md)
