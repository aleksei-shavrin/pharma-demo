---
id: DOC-QA-001
title: Стратегия тестирования
type: quality
status: draft
version: 0.2.0
created: '2026-10-30'
updated: '2026-11-01'
owner: docs-engineering
related:
  - DOC-QA-002
  - DOC-QA-003
  - DOC-AI-003
---
# Стратегия тестирования

## Направление инструментов

> **certainty:** hypothesis
>
> | Слой | Инструмент (направление) |
> |------|--------------------------|
> | Unit/UI logic FE | Vitest |
> | Unit/integration BE | Jest (экосистема NestJS) |
> | E2E | Playwright (`e2e/`, `npm run test:e2e`; optional Compose via `test:e2e:compose`) |
> | Contract (OpenAPI) | Nest OpenAPI contract Jest (`apps/api/src/openapi.contract.spec.ts`) |
> | Architecture fitness | FE `check-no-api-imports.mjs` + API `architecture.boundary.spec.ts` (см. architecture-tests); dependency-cruiser — FUTURE |

## Принципы

> **certainty:** hypothesis
>
> - Тесты рядом с кодом; демо-сценарии не заменяют автоматизацию.
> - Bugfix — test-first ([политика](../11-ai-engineering/test-first-bugfix.md)).
> - FE не тестирует «фейковые данные вместо API» как замену контракта; mock на границе сети — осознанно в тестах, не в prod-сборке Demo.

## Enforcement

> **certainty:** fact
>
> Локальные Demo readiness gates (I8): `npm run test:apps`, `npm run test:e2e`, `npm run test:docs`, `openspec validate --all --strict`. CI fail-on-threshold / обязательный pipeline — **FUTURE**.
