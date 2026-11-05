---
id: DOC-PORTAL-002
title: Как пользоваться порталом
type: portal
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-STD-001
  - DOC-PORTAL-HOME-001
---
# Как пользоваться документацией

## Для людей

1. Начните с [home](./home.md) и [карты портала](../README.md).
2. Читайте `status` в frontmatter: `draft` ≠ готово к исполнению как норма.
3. В теле ищите блоки `certainty` — не все абзацы равнозначны.
4. Новые артефакты — из [`_templates/`](../_templates/README.md).
5. Решения архитектуры — только через ADR в `06-architecture/decisions/`.

## Для AI-агентов

1. Соблюдайте [engineering-constitution](../11-ai-engineering/engineering-constitution.md) и [documentation-first](../11-ai-engineering/documentation-first.md).
2. Не выдумывайте pharma/GMP/FR требования.
3. Не повышайте certainty и не ставьте `approved`.
4. По чеклисту: [`ai-task-checklist`](../_templates/ai-task-checklist.md).
5. Существенные согласованные планы — политика [cursor-plans-in-git](../11-ai-engineering/cursor-plans-in-git.md).

## Где что лежит (Diátaxis vs структура портала)

- **Объяснения / продукт / архитектура** — нумерованные разделы `01`–`11`.
- **Практические гайды** — `guides/` (квадранты Diátaxis создаются при первой реальной странице).
- **Нормы** — `standards/`.
