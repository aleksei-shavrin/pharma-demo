---
id: DOC-HANDOFF-SERVER-001
title: Server Compose Demo + подготовка к GitLab
type: delivery
status: draft
version: 0.3.0
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
- Push в GitLab блокирован отсутствием URL / рабочей авторизации.
- Данные демо: **только mock в NestJS** (без PostgreSQL).

## Что подготовлено

- ADR-0005 и [server-compose-demo](../../10-operations/server-compose-demo.md)
- `docker-compose.server.yml`, `Caddyfile.server`
- Единый origin: фиксированные префиксы `/backend` и `/portal` (маршруты Caddy; произвольные env-пути не поддерживаются)
- API client: `resolveApiBaseUrl` / `joinApiUrl` (локальный fallback `localhost:3001` сохранён)
- Healthchecks, `restart: unless-stopped`, образы Node 24
- Основной запуск на сервере — **только Docker Compose** (Node/npm на хосте не нужны)
- Команды typecheck: `npm run typecheck:web` / `typecheck:api` / `typecheck` (включают тестовые файлы)

## Различие typecheck и production build

| Проверка | Что покрывает |
|----------|----------------|
| `npm run typecheck` | Полный `tsc --noEmit` apps/web и apps/api, **включая** `*.test.ts(x)` / `*.spec.ts` |
| `nest build` / `next build` (Docker) | Production emit; `tsconfig.build.json` API **исключает** `**/*spec.ts`; Next собирает app-код (eslint может затронуть test-файлы в src) |

## Локальные проверки (факт на момент handoff)

| Проверка | Результат |
|----------|-----------|
| `npm run typecheck` | **0 ошибок** (было: web 8, api 45 на HEAD `16ad1b7`) |
| `npm run api:test` | 27 suites / **171** tests passed |
| `npm run web:test` | 37 files / **174** tests passed + architecture guard |
| Production Compose rebuild (`pharma-demo-server`) | OK |
| UI `/`, `/backend/health`, Swagger `/backend/api`, `/backend/api-json`, `/portal/`, dashboard JSON | OK |
| Dev stack `:80` | не останавливался |

### Группы исправленных tsc-ошибок

1. **Устаревшие fixtures** — `ownerFullNameRu`, `leadFullNameRu`; FakeDataSource без `listNotifications`; stub SnapshotFixture в `projects.service.spec`.
2. **Mock typings** — `use-entity-detail-query.test` (SnapshotId / Parameters).
3. **Discriminated unions** — доступ к `rag`/`status` без сужения `kind` в schedule tests.
4. **Контракт list vs catalog** — `WorkstreamListDto` требует `rag`.
5. **OpenAPI `$ref` unions** — helpers вместо прямого доступа к `content`/`schema`.
6. **Literal duration** — assertion через JSON, без сравнения `0 === 21`.

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
