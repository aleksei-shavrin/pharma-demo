---
id: DOC-OPS-002
title: Локальная разработка и production-like Demo
type: delivery
status: draft
version: 0.2.0
created: '2026-11-01'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-OPS-README-001
  - DOC-ADR-0003
  - DOC-GUIDE-001
---
# Local development and production-like Demo

Два явных сценария для Demo v1. Не смешивать.

| Сценарий | Назначение |
|----------|------------|
| **Development** | Hot reload Web + API + Docs при разработке |
| **Production-like Demo** | Образы/билды как для показа (Live Presentation Guide) |

**Development** (single-origin, default `:3080`):

| URL | Сервис |
|------|--------|
| [http://localhost:3080/](http://localhost:3080/) | Web |
| [http://localhost:3080/backend/...](http://localhost:3080/backend/health) | API |
| [http://localhost:3080/docs/](http://localhost:3080/docs/) | Docs |

**Legacy `/portal` → `/docs` (308, `Caddyfile.dev`):**

| Запрос | Редirect |
|--------|----------|
| `/portal`, `/portal/` | `/docs/` |
| `/portal/docs/*` | `/docs/{slug}` (prefix `/portal/docs` снимается) |
| `/portal/openspec/*` | `/docs/openspec/{rest}` |
| `/portal/assets/*` | `/docs/assets/{rest}` |
| `/portal/search` | `/docs/search` |

**Production-like** по-прежнему использует `*.localhost` на порту **80** — не запускайте вместе с другим стеком на том же порту.

**Server / IP:port demo** (обычно `:8080`): см. [server-compose-demo](./server-compose-demo.md) и [ADR-0005](../06-architecture/decisions/0005-server-single-origin-compose.md).

---

## Development

```bash
cp .env.local.example .env.local   # once
npm run dev
# = docker compose --env-file .env.local -f docker-compose.dev.yml up --build -d
```

Смена порта: `HOST_PORT` (+ `WEB_ORIGIN` / `PUBLIC_ORIGIN` / `DOCUSAURUS_URL`) в корневом `.env.local`.

Остановка:

```bash
npm run dev:down
```

Логи (опционально): `npm run dev:logs`

### Hot reload

| Слой | Поведение |
|------|-----------|
| Web | Next.js `dev` (HMR), исходники `apps/web` |
| API | Nest `start:dev` (watch), исходники `apps/api` |
| Docs | Docusaurus `start`, исходники `docs/`, `website/`, `openspec/specs/` |

File watching: native (repo на Linux FS в WSL2). Глобальный polling не включён.

Конфиг в корне репозитория: `docker-compose.dev.yml`, `Caddyfile.dev`.

`node_modules` / Next `.next` / Nest `dist` в named volumes — не перекрываются host bind mount и не портят права на хосте.

---

## Production-like Demo

```bash
docker compose --profile app up --build -d
```

Остановка app-стека (и при необходимости всего compose):

```bash
docker compose --profile app down
# или полный down, если поднят и docs/proxy без profile:
docker compose down
```

Отличия от Development:

- Web/API/Docs — **production builds** в образах (без HMR);
- Docs — статика nginx из корневого `Dockerfile`;
- Caddy — корневой `Caddyfile` (docs → `:80`);
- для живого показа директору используйте этот путь + [Live Presentation Guide](../guides/how-to/demo-v1-live-presentation.md).
