---
id: DOC-QA-003
title: "Архитектурные тесты"
type: quality
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-QA-001
  - DOC-PROD-003
  - DOC-ADR-0002
---

# Архитектурные тесты

## Цель

> **certainty:** hypothesis
>
> Автоматически ловить нарушения границ модулей (например FE → прямые импорты BE internals; UI → обход API-слоя; domain → конкретный Postgres driver в обход port).

## Направление

> **certainty:** hypothesis
>
> - **dependency-cruiser** (или аналог) с правилами слоёв.
> - Дополнительно: лёгкие тесты на наличие только mock-adapter в Demo profile.

## Правила-кандидаты (черновик)

> **certainty:** open_question
>
> Точный граф пакетов появится с кодом. Кандидаты:
>
> 1. `frontend` не зависит от `nestjs` модулей напрямую.
> 2. application/domain не импортирует `pg` / ORM вне adapter package.
> 3. Demo profile не подключает Postgres adapter как default.

## Enforcement

> **certainty:** fact
>
> **FUTURE** — до появления структуры пакетов.
