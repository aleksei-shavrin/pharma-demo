---
id: DOC-ADR-0003
title: 'ADR-0003: Локальные URL и proxy'
type: adr
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PORTAL-004
  - DOC-PROD-003
---
# ADR-0003: Локальные URL и proxy

- **Статус решения:** accepted (направление)
- **Дата:** 2026-10-30

## Контекст

Локально нужны стабильные hostname для FE, API и docs без ручной путаницы портов у потребителей.

## Решение

> **certainty:** hypothesis
>
> | Сервис | URL |
> |--------|-----|
> | Frontend | `http://localhost` |
> | API | `http://api.localhost` |
> | Docs | `http://docs.localhost` |
>
> Reverse proxy: **Caddy** (допустим nginx как эквивалент по роли).
> Docker Compose network: **`ppc-net`**.
>
> Auth на docs в local dev **не** требуется.

## Последствия

### Положительные

- Предсказуемые URL для демо и агентов.
- Единая сеть Compose.

### Отрицательные / компромиссы

- Зависимость от корректного разрешения `*.localhost` в окружении (WSL/Windows).
- Конкретные Compose-файлы — вне волны W1-Docs (не редактируются здесь).

## Альтернативы

- Только `localhost:PORT` без proxy — проще старт, хуже DX для cookie/CORS/hostname-sensitive сценариев.

## Ссылки

- [access-and-security](../../00-portal/access-and-security.md)
