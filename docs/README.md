---
id: DOC-PORTAL-001
title: "Портал документации Pharma Project Control"
type: portal
status: draft
version: "0.1.1"
created: 2026-10-30
updated: 2026-11-01
owner: "docs-engineering"
related:
  - DOC-PORTAL-HOME-001
  - DOC-STD-001
  - DOC-GUIDE-001
---

# Портал документации Pharma Project Control

Карта разделов `docs/**`. Источник истины для продуктовых, архитектурных и delivery-артефактов. Технические термины (OpenSpec, ADR, Mermaid, Docusaurus, NestJS и др.) сохраняются на английском.

## Карта разделов

| Раздел | Назначение |
|--------|------------|
| [00-portal](./00-portal/home.md) | Вход, навигация, доступ, исследование стека docs |
| [standards](./standards/documentation-standard.md) | Правила документации и глоссарий |
| [_templates](./_templates/README.md) | Шаблоны артефактов |
| [01-discovery](./01-discovery/README.md) | Discovery-брифы и гипотезы контекста |
| [02-business-analysis](./02-business-analysis/README.md) | Бизнес-анализ |
| [03-product](./03-product/README.md) | Vision, scope, стек, demo-архитектура |
| [04-requirements](./04-requirements/README.md) | Требования (REQ-AREA-NNN) |
| [05-ux-ui](./05-ux-ui/README.md) | UX/UI артефакты |
| [06-architecture](./06-architecture/README.md) | arc42 (subset) и ADR |
| [07-delivery](./07-delivery/README.md) | Quality gates, handoffs |
| [08-quality](./08-quality/README.md) | Стратегия тестов, coverage, architecture tests |
| [09-release](./09-release/README.md) | Релизы |
| [10-operations](./10-operations/README.md) | Эксплуатация |
| [11-ai-engineering](./11-ai-engineering/README.md) | Правила работы AI-агентов |
| [guides](./guides/README.md) | Практические гайды (Diátaxis); [живой показ Demo v1](./guides/how-to/demo-v1-live-presentation.md) |

## Быстрый старт

1. Прочитайте [Как пользоваться](./00-portal/how-to-use.md).
2. Следуйте [стандарту документации](./standards/documentation-standard.md).
3. Для новых артефактов берите шаблон из [`_templates/`](./_templates/README.md).

## Важные правила

- `status` документа (draft|review|approved|deprecated|archived) ≠ `certainty` утверждения (fact|assumption|hypothesis|open_question).
- AI **никогда** не повышает `hypothesis` → `fact` и не выставляет `approved` без человека.
- Секреты, ключи и credentials в docs запрещены.
