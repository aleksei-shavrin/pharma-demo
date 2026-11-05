---
id: DOC-QA-003
title: Архитектурные тесты
type: quality
status: draft
version: 0.2.0
created: '2026-10-30'
updated: '2026-11-01'
owner: docs-engineering
related:
  - DOC-QA-001
  - DOC-PROD-003
  - DOC-ADR-0002
  - DOC-ADR-0004
---
# Архитектурные тесты

## Цель

> **certainty:** fact
>
> Автоматически ловить нарушения границ модулей Demo v1: FE → прямые импорты BE/mock internals; FE → vendor Gantt вне adapter; application/controllers → value-import fixture constants в обход `DemoDataSource`.

## Demo v1 enforcement (I8)

> **certainty:** fact
>
> | Guard | Где | Что ловит |
> |-------|-----|-----------|
> | FE boundary | `apps/web/scripts/check-no-api-imports.mjs` (`npm run check:architecture`) | Импорты Nest/API/fixtures; `dhtmlx-gantt` вне `dhtmlx-gantt-adapter.tsx` |
> | API boundary | `apps/api/src/architecture.boundary.spec.ts` | Value-import fixture modules вне `src/data/` |
>
> Оба входят в `npm run test:apps` / пакетные `test` scripts.

## Направление (после Demo v1)

> **certainty:** hypothesis
>
> - **dependency-cruiser** (или аналог) с полным графом пакетов.
> - Запрет `pg` / ORM вне persistence adapter (когда появится DB).

## Правила-кандидаты (черновик post-Demo)

> **certainty:** open_question
>
> 1. application/domain не импортирует `pg` / ORM вне adapter package.
> 2. Demo profile не подключает Postgres adapter как default.

## Enforcement

> **certainty:** fact
>
> Demo v1 structural guards — **active** (см. таблицу выше). Полный package-graph cruise / CI coverage enforcement — **FUTURE**.
