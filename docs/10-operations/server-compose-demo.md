---
id: DOC-OPS-003
title: Server Compose Demo (single-origin)
type: delivery
status: draft
version: 0.2.0
created: '2026-11-05'
updated: '2026-11-05'
owner: docs-engineering
related:
  - DOC-ADR-0005
  - DOC-OPS-002
---
# Server Compose Demo

Production-like запуск Demo v1 на одном публичном origin (IP:port или хост).  
**Данные — mock в NestJS; PostgreSQL не используется.**

Не путать с [local-dev-and-demo](./local-dev-and-demo.md) (ADR-0003, `*.localhost`, часто порт 80).

На сервере **не требуется** Node.js / npm: достаточно Docker + Compose и файлов репозитория. Скрипты `npm run server:*` — удобные алиасы для локальной разработки.

## Поддерживаемые префиксы (фиксированы)

Маршруты заданы в `Caddyfile.server` и **не** конфигурируются произвольными значениями env:

| Префикс | Назначение |
|---------|------------|
| `/backend` | API (strip перед Nest) |
| `/portal` | Docs (strip перед nginx; Docusaurus `baseUrl=/portal/`) |

Значения `NEXT_PUBLIC_API_BASE_URL`, `PUBLIC_API_PREFIX` и `DOCUSAURUS_BASE_URL` в `.env` должны оставаться `/backend` и `/portal/` соответственно. Смена на другие пути **не поддерживается** без правки Caddy и пересборки образов.

## Маршруты

| URL | Сервис |
|-----|--------|
| `http://HOST:PORT/` | UI (Next) |
| `http://HOST:PORT/backend/health` | API health |
| `http://HOST:PORT/backend/api` | Swagger UI |
| `http://HOST:PORT/backend/api-json` | OpenAPI JSON |
| `http://HOST:PORT/portal/` | Docs portal |

Browser вызывает API только как `/backend/...` на **том же** origin.

## Требования

- Docker 24+ / Compose v2 plugin
- Свободный порт `HOST_PORT` (пример: 8080)
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

## Запуск (основной способ — Docker Compose)

```bash
git clone <gitlab-url> pharma-demo && cd pharma-demo
cp .env.example .env
# Отредактируйте .env:
#   HOST_PORT=8080
#   WEB_ORIGIN=http://SERVER_IP:8080
#   PUBLIC_ORIGIN=http://SERVER_IP:8080
# Префиксы оставьте как в примере: /backend и /portal/

docker compose -p pharma-demo-server -f docker-compose.server.yml up --build -d
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
curl -fsSI "http://127.0.0.1:${HOST_PORT:-8080}/portal/"
```

UI и загрузку dashboard проверяйте **в браузере** (Network: только same-origin `/backend/...`, без `api.localhost`).

## Ограничения

- Это demo с mock API, не production GMP-система.
- Push в GitLab ≠ deployment на сервер; для выкладки нужны адрес и доступ к хосту.
- Не запускайте server compose на том же `HOST_PORT`, что занимает local `npm run dev` (обычно 80).
