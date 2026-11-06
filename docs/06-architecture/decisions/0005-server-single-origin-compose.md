---
id: DOC-ADR-0005
title: 'ADR-0005: Server single-origin Compose'
type: adr
status: draft
version: 0.2.0
created: '2026-11-05'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-ADR-0003
  - DOC-OPS-003
---
# ADR-0005: Server single-origin Compose

- **Статус решения:** accepted (направление для server/demo host)
- **Дата:** 2026-11-05 · **обновлено:** 2026-11-06

## Контекст

Локальный стек (ADR-0003) использует `localhost` / path-routing на `HOST_PORT`. На удалённом Linux с доступом по `http://IP:PORT` поддомены `*.localhost` у браузера посетителя не работают. `NEXT_PUBLIC_*`, зашитый в Next bundle как `http://api.localhost`, нельзя исправить runtime env контейнера.

Demo v1 — **mock-данные в NestJS**, без PostgreSQL.

## Решение

> **certainty:** fact (маршруты и файлы Compose); assumption (достаточность для типичного demo-host)

| Внешний маршрут | Upstream | Примечание |
|-----------------|----------|------------|
| `/` | `web:3000` | Next standalone |
| `/backend/*` | `api:3000` | Caddy **strip** `/backend` |
| `/docs/*` | `docs:80` | Caddy **strip** `/docs`; Docusaurus `baseUrl=/docs/`, docs plugin `routeBasePath: '/'` |

- Browser API base (build-arg): `NEXT_PUBLIC_API_BASE_URL=/backend` (относительный URL, тот же origin).
- Swagger: UI `/backend/api`, OpenAPI JSON `/backend/api-json`; в документе `servers: [{ url: '/backend' }]` для Try it out.
- Docs: HTML/assets/search ссылаются на `/docs/...`; OpenSpec living specs — `/docs/openspec/...`; nginx отдаёт файлы с корня после strip.
- **Фиксированные префиксы:** `/backend` и `/docs` заданы в `Caddyfile.server`. Env не обещает произвольные префиксы — другие значения без правки Caddy и пересборки **не поддерживаются**.
- **Legacy `/portal`:** Caddy **308** на эквиваленты под `/docs/` (корень, `/portal/docs/*`, openspec, assets) — см. ops guide.
- Локальный DX ADR-0003 **не** заменяется: `docker-compose.dev.yml` + `localhost:PORT` остаются.
- Server stack: `docker-compose.server.yml` + `Caddyfile.server`, Compose project `pharma-demo-server`, порт `HOST_PORT` (default 8080). Основной запуск на сервере — Docker Compose без Node/npm на хосте.

### Схема strip для `/docs`

1. Сборка Docusaurus с `baseUrl=/docs/` и `routeBasePath: '/'` для основного docs-плагина (без `/docs/docs/...`).
2. Caddy `handle_path /docs/*` снимает префикс перед nginx.
3. nginx document root = содержимое `build/` (пути `/assets/...`, `/openspec/...`, doc slugs в корне после strip).

Не смешивать: preserve prefix на Caddy **и** `baseUrl=/` — ломает assets.

## Последствия

### Положительные

- Один origin; IP:port без DNS.
- Нет `api.localhost` у посетителя.
- Local и server Compose не делят порт 80 при проверке server на 8080.

### Отрицательные / компромиссы

- Пересборка web при смене public API base (ожидаемо для `NEXT_PUBLIC_*`).
- Swagger/Try it out зависят от `PUBLIC_API_PREFIX=/backend` в API env.

## Альтернативы

- Отдельные поддомены на сервере — требуют DNS.
- Dev runtime в Docker вместо production build — отклонён без доказанного build-блокера.

## Ссылки

- [server-compose-demo](../../10-operations/server-compose-demo.md)
- [ADR-0003](./0003-local-dev-urls-and-proxy.md)
