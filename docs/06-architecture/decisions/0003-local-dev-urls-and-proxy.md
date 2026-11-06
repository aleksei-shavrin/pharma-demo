---
id: DOC-ADR-0003
title: 'ADR-0003: Локальные URL и proxy'
type: adr
status: draft
version: 0.3.0
created: '2026-10-30'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-PORTAL-004
  - DOC-PROD-003
  - DOC-ADR-0005
---
# ADR-0003: Локальные URL и proxy

- **Статус решения:** accepted (направление)
- **Дата:** 2026-10-30 · **обновлено:** 2026-11-06

## Контекст

Локально нужны стабильные URL для FE, API и docs. Ранее использовались `*.localhost` на порту 80. Для унификации с server single-origin и требованием `http://localhost:<port>/` локальный Docker DX переведён на path-routing.

## Решение

> **certainty:** fact (текущий `docker-compose.dev.yml` + `Caddyfile.dev`)
>
> **Docker DX (основной):** один origin на `HOST_PORT` (default **3080**):
>
> | URL | Назначение |
> |-----|------------|
> | `http://localhost:3080/` | Frontend (Next.js) |
> | `http://localhost:3080/backend/...` | API (NestJS; strip prefix) |
> | `http://localhost:3080/docs/` | Docs (Docusaurus; prefix **не** снимать в dev) |
>
> Порт задаётся корневым `.env.local` и передаётся как  
> `docker compose --env-file .env.local -f docker-compose.dev.yml …`  
> (подстановка `HOST_PORT` в `ports:`).
>
> Reverse proxy: **Caddy**. Сеть Compose: **`ppc-net`**.  
> Auth на docs в local dev **не** требуется.
>
> **Legacy /portal (обратная совместимость):** Caddy отдаёт **308** на эквиваленты под `/docs/` (см. [local-dev-and-demo](../../10-operations/local-dev-and-demo.md)).
>
> **Legacy / native:** `localhost` / `api.localhost` / `docs.localhost` — production-like Compose или запуск без proxy.

## Последствия

### Положительные

- Те же path-префиксы docs, что ADR-0005 (server), без удвоения `/docs/docs` (`routeBasePath: '/'`, `baseUrl=/docs/`).
- Один bookmark `localhost:PORT` без зависимости от `*.localhost` в WSL/Windows.

### Отрицательные / компромиссы

- Docusaurus dev требует `baseUrl=/docs/` и proxy **без** strip (в отличие от static nginx на server).
- `NEXT_PUBLIC_API_BASE_URL=/backend` задаётся Compose env; корневой `.env.local` ≠ `apps/web/.env.local`.

## Альтернативы

- Только `*.localhost` на :80 — прежний DX (оставлен как legacy).
- Отдельные localhost-порты на каждый сервис — проще proxy, хуже единообразие с server.
- Оставить `/portal/` как канон — отклонено (F03: вход документации `/docs/`).

## Ссылки

- [ADR-0005](./0005-server-single-origin-compose.md)
- [access-and-security](../../00-portal/access-and-security.md)
- [local-dev-and-demo](../../10-operations/local-dev-and-demo.md)
