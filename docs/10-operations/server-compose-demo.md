---
id: DOC-OPS-003
title: Server Compose Demo (single-origin)
type: delivery
status: draft
version: 0.3.0
created: '2026-11-05'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-ADR-0005
  - DOC-OPS-002
  - DOC-OPS-FORM-LOGIN-001
---
# Server Compose Demo

Production-like запуск Demo v1 на одном публичном origin (IP:port или домен).  
**Это mock demo:** данные только в NestJS; PostgreSQL нет; **не** использовать для реальных производственных данных.

Не путать с [local-dev-and-demo](./local-dev-and-demo.md) (ADR-0003, `localhost:PORT`, default 3080).

На сервере достаточно **Git + Docker + Compose** (Node.js / npm на хосте **не** нужны). Скрипты `npm run server:*` — локальные алиасы разработчика.

## Поддерживаемые префиксы (фиксированы)

Маршруты заданы в `Caddyfile.server` и **не** конфигурируются произвольными значениями env:

| Префикс | Назначение |
|---------|------------|
| `/backend` | API (strip перед Nest) |
| `/docs` | Docs (strip перед nginx; Docusaurus `baseUrl=/docs/`, docs plugin `routeBasePath: '/'`) |

Значения `NEXT_PUBLIC_API_BASE_URL`, `PUBLIC_API_PREFIX` и `DOCUSAURUS_BASE_URL` в `.env` должны оставаться `/backend` и `/docs/` соответственно. Смена на другие пути **не поддерживается** без правки Caddy и пересборки образов.

> **certainty:** assumption — docs-ci-links 2026-11-09
>
> **Link contract:** registry хранит **site paths** от `routeBasePath: '/'` (`/requirements/…`, `/portal/DOC-PORTAL-HOME-001`, `/openspec/…`) **без** `DOCUSAURUS_BASE_URL`. При сборке base (`/` или Compose `/docs/`) присоединяется **один раз** (remark + footer). Не писать `/docs/…` в registry — иначе при `baseUrl=/docs/` получится broken `/docs/docs/…`. Категория `00-portal` → site path `/portal/…`. Compose: `handle_path /docs/` + nginx root.
>
> **Out-of-tree repo links:** относительные markdown-ссылки на пути вне `docs/` и `openspec/specs/` (например `apps/…`, `docker-compose*.yml`) **не** являются маршрутами портала. Docs Dockerfile не копирует `apps/`; remark `demote-out-of-tree-links` превращает такие ссылки в inline code. `onBrokenLinks: throw` сохраняется — не suppress и не exclude docs.

## Legacy `/portal` → `/docs` (308)

Те же правила, что в [local-dev-and-demo](./local-dev-and-demo.md#development).

## Маршруты

| URL | Сервис |
|-----|--------|
| `http://HOST:PORT/` | UI (Next) |
| `http://HOST:PORT/backend/health` | API health |
| `http://HOST:PORT/backend/api` | Swagger UI |
| `http://HOST:PORT/backend/api-json` | OpenAPI JSON |
| `http://HOST:PORT/docs/` | Docs portal |
| `http://HOST:PORT/docs/openspec/` | OpenSpec living specs |

Browser вызывает API только как `/backend/...` на **том же** origin.

## Требования

- Git (clone репозитория)
- Docker 24+ / Compose v2 plugin
- Свободный порт `HOST_PORT` на хосте (пример: `8080`); снаружи открыть тот же порт или reverse-proxy
- В `.env`: `WEB_ORIGIN` и `PUBLIC_ORIGIN` = точный URL браузера (`http://SERVER_IP:PORT` или `https://demo.example.com`)
- **RAM:** ориентир ≥ 4 GiB на машине сборки; пик при параллельной сборке web+api+docs выше (на слабом хосте ограничить параллелизм BuildKit)
- **Диск:** ориентир ≥ 8 GiB свободно под layers/images
- Образы: Node **24** (web, api, docs) — внутри Docker, на хост Node не ставить

### Измерения (локальная проверка 2026-11-05)

Машина разработчика, `docker compose -p pharma-demo-server -f docker-compose.server.yml up --build -d`, `HOST_PORT=8080`:

| Метрика | Значение |
|---------|----------|
| Время `up --build` (холодная/пересборка) | ~3 мин |
| Image sizes | web ~424 MB, api ~389 MB, docs ~115 MB, caddy:2-alpine ~93 MB |
| Runtime RSS (healthy idle) | web ~48 MiB, api ~51 MiB, docs ~11 MiB, proxy ~11 MiB |
| Публичный URL проверки | `http://127.0.0.1:8080/` |

На целевом сервере с меньшим RAM ограничьте параллелизм BuildKit и заложите запас диска под layers.

## Auth bootstrap (после form-login)

Перед первым `server:up` создайте **отдельные** server secrets (не DX `.env.dev-auth`):

```bash
npm run server:auth:ensure
# gitignored: .env.server-auth, .server-login-password, .server-login-password-hash
# report password path only: .server-login-password
```

`PUBLIC_ORIGIN` / `WEB_ORIGIN` в `.env` = URL браузера. Caddy снимает клиентский `X-Middleware-Subrequest` и выставляет `X-Real-IP` на `/backend`. Подробнее: [demo-form-login](./demo-form-login.md).

## Запуск (основной способ — Docker Compose)

```bash
git clone <repo-url> pharma-demo && cd pharma-demo
cp .env.example .env
# Отредактируйте .env:
#   HOST_PORT=8080
#   WEB_ORIGIN=http://SERVER_IP:8080
#   PUBLIC_ORIGIN=http://SERVER_IP:8080
# Префиксы оставьте как в примере: /backend и /docs/
npm run server:auth:ensure
npm run server:up
# или: docker compose -p pharma-demo-server -f docker-compose.server.yml up --build -d
```

Логи:

```bash
docker compose -p pharma-demo-server -f docker-compose.server.yml logs -f
```

Остановка:

```bash
docker compose -p pharma-demo-server -f docker-compose.server.yml down
```

Локальные алиасы (нужен npm только на машине разработчика): `npm run server:up` / `server:logs` / `server:down`.

## Обновление и откат

```bash
git pull
docker compose -p pharma-demo-server -f docker-compose.server.yml up --build -d

# откат на предыдущий commit
git checkout <sha>
docker compose -p pharma-demo-server -f docker-compose.server.yml up --build -d
```

## Проверки после up

```bash
curl -fsS "http://127.0.0.1:${HOST_PORT:-8080}/backend/health"
curl -fsS "http://127.0.0.1:${HOST_PORT:-8080}/backend/api-json" | head -c 200
curl -fsSI "http://127.0.0.1:${HOST_PORT:-8080}/docs/"
# legacy redirect smoke (optional):
curl -fsSI "http://127.0.0.1:${HOST_PORT:-8080}/portal/" | head -5
```

UI и загрузку dashboard проверяйте **в браузере** (Network: только same-origin `/backend/...`, без `api.localhost`).

## Typecheck (разработчик / CI локально)

Полная проверка TypeScript **включая тесты**:

```bash
npm run typecheck:web
npm run typecheck:api
npm run typecheck          # оба подряд
```

Отличие от production Docker build: `typecheck` гоняет `tsc --noEmit` по всем `*.ts(x)` / `*.spec.ts`; `nest build` исключает `**/*spec.ts` через `tsconfig.build.json`, а `next build` собирает приложение (не заменяет полный typecheck).

## Ограничения

- Это demo с mock API, not production GMP-система.
- Push в remote ≠ deployment на сервер; для выкладки нужны адрес и доступ к хосту.
- Не запускайте server compose на том же `HOST_PORT`, что занимает local `npm run dev` (обычно 3080).
