---
id: DOC-PROD-003
title: "Архитектура Demo v1"
type: product
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-002
  - DOC-PROD-004
  - DOC-ADR-0003
---

# Архитектура Demo v1

## Цель Demo v1

> **certainty:** hypothesis
>
> Показать связку FE + BE через реальный HTTP API без усложнения инфраструктуры БД.

## Границы компонентов

> **certainty:** hypothesis
>
> ```mermaid
> flowchart LR
>   FE[Next.js FE]
>   API[NestJS API]
>   MOCK[Mock persistence\nhardcoded TS]
>   FE -->|REST OpenAPI| API
>   API --> MOCK
> ```

## Обязательные правила Demo v1

> **certainty:** fact
>
> Зафиксированные для направления Demo v1 ограничения (как договорённость плана; реализация кода — другие волны):

1. **FE + BE** оба присутствуют.
2. **Mock только в NestJS** — hardcoded TypeScript (in-memory / константы), за persistence adapter.
3. **FE ходит только через API** — никакого локального mock-слоя данных во фронтенде как замены API.
4. **NO PostgreSQL** в Demo v1.
5. Смена хранилища позже — через adapter, см. [persistence-transition](./persistence-transition.md).

## Вне Demo v1

> **certainty:** assumption
>
> Auth, реальная БД, фоновые jobs, полноценный ACL — не обязательны для первого демо-контура.

## Локальные URL

См. [ADR-0003](../06-architecture/decisions/0003-local-dev-urls-and-proxy.md) (`localhost`, `api.localhost`, `docs.localhost`, Caddy, `ppc-net`).
