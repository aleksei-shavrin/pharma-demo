---
id: DOC-QA-001
title: "Стратегия тестирования"
type: quality
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
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
> | E2E | Playwright |
> | Contract (OpenAPI) | contract tests против спеки |
> | Architecture fitness | dependency-cruiser (+ см. architecture-tests) |

## Принципы

> **certainty:** hypothesis
>
> - Тесты рядом с кодом; демо-сценарии не заменяют автоматизацию.
> - Bugfix — test-first ([политика](../11-ai-engineering/test-first-bugfix.md)).
> - FE не тестирует «фейковые данные вместо API» как замену контракта; mock на границе сети — осознанно в тестах, не в prod-сборке Demo.

## Enforcement

> **certainty:** fact
>
> Подключение и обязательность в CI — **FUTURE**. Этот документ задаёт направление, не pipeline.
