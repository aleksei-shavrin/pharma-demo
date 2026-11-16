---
id: DOC-HANDOFF-SERVER-001
title: Server Compose Demo + подготовка к публикации
type: delivery
status: draft
version: 0.4.0
created: '2026-11-05'
updated: '2026-11-05'
owner: docs-engineering
related:
  - DOC-ADR-0005
  - DOC-OPS-003
  - DOC-OPS-002
---
# Handoff: Server Compose Demo

## Статус

- **Готово к серверному развёртыванию** из Git + Docker Compose (без Node/npm на хосте).
- Локальный server stack и **clean-tree gate** проверены (см. таблицу ниже).
- Удалённый production deploy **не** выполнялся (нет доступа к хосту).
- Push в remote **не** выполнен на момент handoff: у репозитория не было рабочего `git remote`.
- Данные демо: **только mock в NestJS** (без PostgreSQL) — **не** система для реальных производственных данных.

## Проверенный состав (до коммита handoff)

| Поле | Значение |
|------|----------|
| Parent HEAD gate | `20baa3f` (`docs(ops): clarify…`; baseUrl drop — `68b8e23`) |
| Clean checkout | `git archive` → `/tmp/pharma-demo-artifacts/pharma-demo-final-gate-*` (без `.env`, `node_modules`, build caches) |
| Compose project | `pharma-demo-final-gate` |
| Public URL | `http://127.0.0.1:18080/` (`HOST_PORT=18080`) |
| Dev stack `:80` | не останавливался (HTTP 200) |

Итоговый SHA после коммита этого handoff — текущий `HEAD` на `main` (должен совпадать с отправляемым).

## Что подготовлено

- ADR-0005 и [server-compose-demo](../../10-operations/server-compose-demo.md)
- `docker-compose.server.yml`, `Caddyfile.server`
- Единый origin: фиксированные префиксы `/backend` и `/portal`
- API client: `resolveApiBaseUrl` / `joinApiUrl` (локальный fallback `localhost:3001` только вне Docker bake)
- Healthchecks, `restart: unless-stopped`, образы Node 24
- Typecheck: `npm run typecheck` (web + api, включая тесты)

## Финальный gate (факт)

| Проверка | Результат |
|----------|-----------|
| `docker compose … up --build -d` (clean tree) | OK (~63s build); api/web/docs **healthy** |
| UI `/` + dashboard data | OK; Network только `…/backend/v1/...` |
| Карточка `EQ-HVAC-01` | OK |
| `/backend/health` | `{"status":"ok","service":"ppc-api"}` |
| Swagger `/backend/api` | servers=`/backend` |
| OpenAPI `/backend/api-json` | `servers: [{"url":"/backend"}]` |
| Try it out `GET /health` | HTTP **200**, curl `…/backend/health` |
| `/portal/`, deep link ADR-0005, DOC-OPS-003 | 200 |
| Portal search (`single-origin`) | dropdown hits ADR-0005 / ops |
| Portal assets (`/portal/assets/…css`) | 200 |
| Portal missing path | **404** |
| Нет `api.localhost` / `:3001` в browser resource entries | OK |
| `compose restart` + повторная доступность | UI 200, health OK; error-like логов нет |
| `npm run typecheck` | 0 ошибок |
| `npm run api:test` | 27 suites / **171** passed |
| `npm run web:test` | 37 files / **174** passed + architecture guard |

### Группы исправленных tsc-ошибок (ранее в сессии)

1. Устаревшие fixtures / FakeDataSource / SnapshotFixture.
2. Mock typings entity-detail.
3. Discriminated unions в schedule tests.
4. `WorkstreamListDto.rag`.
5. OpenAPI `$ref` helpers.
6. Literal duration через JSON.
7. Unused deprecated `baseUrl` в `apps/api/tsconfig.json` (`68b8e23`).

## Команды на сервере

```bash
git clone <REPO_URL> pharma-demo && cd pharma-demo
cp .env.example .env
# Обязательно выставить внешний origin браузера:
#   HOST_PORT=8080
#   WEB_ORIGIN=http://SERVER_IP:8080   # или https://demo.example.com
#   PUBLIC_ORIGIN=http://SERVER_IP:8080
# Префиксы оставить как в .env.example:
#   NEXT_PUBLIC_API_BASE_URL=/backend
#   PUBLIC_API_PREFIX=/backend
#   DOCUSAURUS_BASE_URL=/portal/

docker compose -p pharma-demo-server -f docker-compose.server.yml up --build -d
docker compose -p pharma-demo-server -f docker-compose.server.yml ps
docker compose -p pharma-demo-server -f docker-compose.server.yml logs -f
# остановка:
docker compose -p pharma-demo-server -f docker-compose.server.yml down
```

На сервере достаточно **Git + Docker + Compose**. Node/npm на хосте не нужны.

## Параметры `.env`

| Переменная | Назначение |
|------------|------------|
| `HOST_PORT` | Порт на хосте (по умолчанию 8080) |
| `WEB_ORIGIN` / `PUBLIC_ORIGIN` | Точный origin браузера (CORS + URL docs) |
| `NEXT_PUBLIC_API_BASE_URL` | Только `/backend` (build-arg) |
| `PUBLIC_API_PREFIX` | Только `/backend` (Swagger server) |
| `DOCUSAURUS_BASE_URL` | Только `/portal/` |

## Ограничения и откат

- **Mock demo**, не GMP production и не хранилище реальных производственных данных.
- Push ≠ deploy.
- Откат: `git checkout <sha>` и повторный `docker compose ... up --build -d`.
- Измерения ресурсов — в DOC-OPS-003.

## Состав отправки в remote

**Включать:** продуктовые правки apps/docs/openspec, server compose/Caddy/ADR/ops, хелперы и тесты API/web, cross-ref scripts.

**Исключать:** `.env`, `.env.local`, `node_modules/`, `website/build/`, `.next*`, caches, playwright reports, agent scratch в `/tmp`.

Секреты не класть в remote URL, коммиты и docs.

## Блокеры отправки / production

| Блокер | Статус |
|--------|--------|
| Remote URL + рабочая авторизация | **открыт** (нет `git remote`; push не выполнялся) |
| Доступ к Linux-серверу для deploy | **открыт** (deploy не заявляется выполненным) |
| Код / Compose / docs / tests | **закрыт** — готово к серверному развёртыванию после clone |
