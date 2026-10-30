---
id: DOC-PROD-002
title: "Целевой технологический стек"
type: product
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-ADR-0002
  - DOC-PROD-003
  - DOC-PROD-004
---

# Целевой технологический стек

Направление стека приложения. Статус решения: см. [ADR-0002](../06-architecture/decisions/0002-target-technology-stack-direction.md).

## Стек (направление)

> **certainty:** hypothesis
>
> | Слой | Выбор |
> |------|--------|
> | Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
> | Backend | NestJS, TypeScript |
> | API | REST + OpenAPI |
> | БД (целевая) | PostgreSQL |
> | Локальный runtime | Docker Compose |
> | Язык UI-кода / API-кода | TypeScript end-to-end |

## Demo vs target

> **certainty:** fact
>
> Для **Demo v1** PostgreSQL **не** используется; хранение — mock в NestJS. Переход описан в [persistence-transition](./persistence-transition.md).

## Не зафиксировано здесь

> **certainty:** open_question
>
> Конкретные версии major-пакетов, ORM, очередь, object storage, IdP — вне seed; появятся отдельными ADR при выборе.
