---
id: DOC-PORTAL-004
title: Доступ и безопасность
type: portal
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-ADR-0003
  - DOC-STD-001
---
# Доступ и безопасность документации

## Локальный контур (направление)

> **certainty:** assumption
>
> **DX (основной):** после `npm run dev` документация same-origin на `http://127.0.0.1:3080/docs/` (Caddy → docs), без page-middleware auth; app `/`, API `/backend`. См. [local-dev-and-demo](../10-operations/local-dev-and-demo.md).
>
> **Production-like / historical W1:** host-routing `docs.localhost` / `api.localhost` на :80 — другой режим ([ADR-0003](../06-architecture/decisions/0003-local-dev-urls-and-proxy.md), [final-report](./final-report.md)).

> **certainty:** fact
>
> В стандарте документации запрещены секреты, ключи и credentials в `docs/**`.

## Auth на docs

> **certainty:** hypothesis
>
> На этапе локальной разработки **auth на docs не требуется**. Production/infra ACL (кто видит внутренние ADR, handoffs) — вопрос будущей инфраструктуры, не решён в W1.

## Рекомендации авторам

- Не вставлять `.env`, токены, дампы БД.
- Для примеров — плейсхолдеры.
- Чувствительные runbook-шаги с секретами — вне публичного docs или с redaction.

## Открытые вопросы

> **certainty:** open_question
>
> Нужен ли позже отдельный контур «internal docs» с ACL vs публичный портал?
