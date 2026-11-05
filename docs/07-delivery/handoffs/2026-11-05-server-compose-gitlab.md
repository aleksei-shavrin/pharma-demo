---
id: DOC-HANDOFF-SERVER-001
title: Server Compose Demo + подготовка к GitLab
type: delivery
status: draft
version: 0.2.0
created: '2026-11-05'
updated: '2026-11-05'
owner: docs-engineering
related:
  - DOC-ADR-0005
  - DOC-OPS-003
  - DOC-OPS-002
---
# Handoff: Server Compose Demo + GitLab

## Статус

- Локальный server stack проверен на `http://127.0.0.1:8080/` (Compose project `pharma-demo-server`).
- Удалённый production deploy **не** выполнялся (нет доступа к хосту).
- Push в GitLab — по факту наличия URL и рабочей авторизации (см. итог агента).
- Данные демо: **только mock в NestJS** (без PostgreSQL).

## Что подготовлено

- ADR-0005 и [server-compose-demo](../../10-operations/server-compose-demo.md)
- `docker-compose.server.yml`, `Caddyfile.server`
- Единый origin: фиксированные префиксы `/backend` и `/portal` (маршруты Caddy; произвольные env-пути не поддерживаются)
- API client: `resolveApiBaseUrl` / `joinApiUrl` (локальный fallback `localhost:3001` сохранён)
- Healthchecks, `restart: unless-stopped`, образы Node 24
- Основной запуск на сервере — **только Docker Compose** (Node/npm на хосте не нужны)

## Локальные проверки

| Проверка | Результат |
|----------|-----------|
| Production-образы web/api/docs | OK |
| Браузер: dashboard → только `/backend/v1/...` | OK (без `api.localhost`) |
| Деталь сущности `/equipment/EQ-BLD-02` | OK |
| `/backend/health`, Swagger UI + Try it out | OK |
| Portal ADR-0005 / DOC-OPS-003, поиск, assets, 404 | OK |
| Restart → healthy; dev `:80` | OK |
| Clean-tree `docker compose build` без host `node_modules`/`.env` | OK |

Актуальные результаты unit/typecheck — в итоговом ответе агента после прогона.

## Команды на сервере

```bash
cp .env.example .env
# WEB_ORIGIN / PUBLIC_ORIGIN = http://SERVER_IP:HOST_PORT
# NEXT_PUBLIC_API_BASE_URL=/backend
# PUBLIC_API_PREFIX=/backend
# DOCUSAURUS_BASE_URL=/portal/

docker compose -p pharma-demo-server -f docker-compose.server.yml up --build -d
docker compose -p pharma-demo-server -f docker-compose.server.yml logs -f
# остановка:
docker compose -p pharma-demo-server -f docker-compose.server.yml down
```

## Параметры `.env`

| Переменная | Назначение |
|------------|------------|
| `HOST_PORT` | Порт на хосте (по умолчанию 8080) |
| `WEB_ORIGIN` / `PUBLIC_ORIGIN` | Точный origin браузера (CORS + URL docs) |
| `NEXT_PUBLIC_API_BASE_URL` | Только `/backend` (build-arg; не runtime override) |
| `PUBLIC_API_PREFIX` | Только `/backend` (Swagger server) |
| `DOCUSAURUS_BASE_URL` | Только `/portal/` |

## Ограничения и откат

- Mock demo, не GMP production.
- Push ≠ deploy.
- Откат: `git checkout <sha>` и повторный `docker compose ... up --build -d`.
- Измерения ресурсов — в DOC-OPS-003.

## Состав отправки в GitLab

**Включать:** продуктовые правки apps/docs/openspec, server compose/Caddy/ADR/ops, хелперы и тесты API/web, cross-ref scripts.

**Исключать:** `.env`, `.env.local`, `node_modules/`, `website/build/`, `.next*`, caches, playwright reports, agent scratch в `/tmp`.

Секреты не класть в remote URL, коммиты и docs.
