---
id: DOC-PORTAL-004
title: "Доступ и безопасность документации"
type: portal
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-ADR-0003
  - DOC-STD-001
---

# Доступ и безопасность документации

## Локальный контур (направление)

> **certainty:** hypothesis
>
> Документация отдаётся через reverse proxy (**Caddy** или **nginx**) на `http://docs.localhost` без аутентификации в локальном dev. App/API — `http://localhost` / `http://api.localhost`. Сеть Compose: `ppc-net`. Подробнее: [ADR-0003](../06-architecture/decisions/0003-local-dev-urls-and-proxy.md).

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
