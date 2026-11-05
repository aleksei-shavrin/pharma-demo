---
id: DOC-ARCH-001
title: arc42 (subset)
type: architecture
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-10-30'
owner: docs-engineering
related:
  - DOC-PROD-001
  - DOC-PROD-002
  - DOC-PROD-003
  - DOC-ADR-README-001
---
# arc42 (subset)

Используется **подмножество** arc42. Неиспользуемые секции **намеренно опущены**, чтобы не плодить пустые заголовки.

Ссылки на product-документы вместо дублирования.

## 1. Введение и цели

См. [vision-and-scope](../03-product/vision-and-scope.md).

> **certainty:** hypothesis
>
> Цель архитектуры на ранней стадии — поддержать Demo v1 (FE+BE, mock persistence) и путь к PostgreSQL без ломки API-контракта.

## 2. Ограничения

> **certainty:** hypothesis
>
> - TypeScript на FE и BE.
> - REST + OpenAPI как стиль API.
> - Локальный контур через Compose + proxy (см. ADR-0003).
> - Docs без секретов.

## 3. Контекст и границы системы

См. [demo-v1-architecture](../03-product/demo-v1-architecture.md).

> **certainty:** open_question
>
> Внешние системы (IdP, ERP, LIMS и т.д.) не идентифицированы — не рисовать выдуманный context map.

## 4. Стратегия решения (Solution strategy)

> **certainty:** hypothesis
>
> - Монорепо/мультипакет по мере появления кода; пока docs-first.
> - Hexagonal-ish persistence port на NestJS.
> - Docusaurus + OpenSpec для документации и change-specs (ADR-0001).

Детали стека: [target-technology-stack](../03-product/target-technology-stack.md), [ADR-0002](./decisions/0002-target-technology-stack-direction.md).

## 5. Строительные блоки (Building blocks) — обзор

> **certainty:** hypothesis
>
> | Блок | Роль |
> |------|------|
> | Next.js App Router | UI |
> | NestJS | API, mock/Postgres adapters |
> | PostgreSQL | целевое хранилище (не Demo v1) |
> | Caddy/nginx proxy | локальные hostnames |
> | docs / Docusaurus | портал знаний |

## 8. Cross-cutting concepts

> **certainty:** hypothesis
>
> - OpenAPI как контракт.
> - Certainty/status дисциплина в docs.
> - Test-first для bugfix (политика AI/quality).

## 9. Архитектурные решения

Журнал: [decisions/](./decisions/README.md).

## 10. Quality requirements

См. направление в [08-quality](../08-quality/README.md). Пороги — политика; app enforcement — **FUTURE**.

## Намеренно опущенные секции arc42

Не заполняются, пока нет содержания:

- Runtime view (детальный)
- Deployment view (prod)
- Scenarios / риски как полный каталог
- Глоссарий arc42 (есть [terminology](../standards/terminology.md))

При появлении материала — добавить секцию явно, не «для галочки».
