---
id: DOC-PROD-004
title: Переход persistence (mock → PostgreSQL)
type: product
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PROD-003
  - DOC-ADR-0002
---
# Переход mock → PostgreSQL

## Принцип

> **certainty:** hypothesis
>
> Доменный/application слой NestJS зависит от **persistence port (adapter interface)**. Demo v1 подключает mock-adapter; позже — PostgreSQL-adapter без переписывания FE-контракта.

## Стадии (черновик)

> **certainty:** hypothesis
>
> | Стадия | Хранилище | Критерий готовности (черновой) |
> |--------|-----------|--------------------------------|
> | S0 Demo v1 | Mock TS в NestJS | API контракт стабилен для демо-сценариев |
> | S1 Schema | PostgreSQL + миграции | Схема отражает нужные агрегаты; mock ещё может быть default |
> | S2 Dual/switch | Feature flag или env выбирает adapter | Паритет поведения на smoke-наборе |
> | S3 PostgreSQL default | Mock только для тестов/dev opt-in | Compose поднимает Postgres; контрактные тесты зелёные |

## Что не делать

> **certainty:** fact
>
> - Не дублировать бизнес-данные mock'ом во FE.
> - Не обещать автоматический cutover без тестов контракта и ручного go/no-go.

## Открытые вопросы

> **certainty:** open_question
>
> ORM vs SQL; миграционный инструмент; нужны ли transactional outbox / audit tables на S1.
