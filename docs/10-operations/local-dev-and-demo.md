---
id: DOC-OPS-002
title: Локальная разработка и production-like Demo
type: delivery
status: draft
version: 0.2.0
created: '2026-11-01'
updated: '2026-11-09'
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
# = docker compose -p pharma-demo --env-file .env.local -f docker-compose.dev.yml up --build -d
# `-p pharma-demo` зафиксирован в scripts `dev` / `dev:down` / `dev:logs`
# (`name:` в compose перекрывается `-p` / COMPOSE_PROJECT_NAME)
```

Смена порта: `HOST_PORT` (+ `WEB_ORIGIN` / `PUBLIC_ORIGIN` / `DOCUSAURUS_URL`) в корневом `.env.local`. Повторный `npm run dev` обновляет **тот же** стек. Штатный npm script уже передаёт `-p pharma-demo`, поэтому `COMPOSE_PROJECT_NAME` из окружения на этот запуск **не влияет**. Новый ручной `-p` с другим именем на том же compose-файле создаст **отдельную** Compose-группу.

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

File watching в **dev Compose** (`docker-compose.dev.yml`): `CHOKIDAR_USEPOLLING` / `WATCHPACK_POLLING` по умолчанию **`true`** (можно переопределить через env). Это соответствует реальному docker-стеку, а не native-only запуску на хосте.

Конфиг в корне репозитория: `docker-compose.dev.yml`, `Caddyfile.dev`.

`node_modules` / Next `.next` / Nest `dist` / Docs `.docusaurus` в named volumes — не перекрываются host bind mount и не портят права на хосте.

### Docs cache isolation (DX)

`website/` bind-mount’ится в контейнер `docs`, но **`/app/website/.docusaurus`** живёт в named volume `ppc_dev_docs_docusaurus`.

**Зачем.** Host `npm run docs:build` пишет в host `website/.docusaurus` абсолютные пути вида `/home/…/website/…`. Dev-контейнер резолвит модули из `/app/website/…`. Без изоляции host build ломает live `/docs/` (`Cannot find module '/home/…/layers.css'`), хотя HTTP 200 отдаёт HTML shell.

**Как безопасно.**

| Действие | Эффект на live DX `/docs/` |
|----------|----------------------------|
| `npm run docs:build` на хосте (gates/CI) | Не трогает container `.docusaurus` — **можно** при поднятом `docs` |
| Правки `docs/**`, `website/src`, `openspec/specs` | Hot reload как раньше (исходники на bind mount) |
| Полный сброс docs cache | `docker compose -p pharma-demo --env-file .env.local -f docker-compose.dev.yml up -d --no-deps --force-recreate docs` (только сервис `docs`) |

Не смешивать: не монтировать host `.docusaurus` обратно в контейнер и не ожидать, что host-side `.docusaurus` отражает состояние DX.

**Ограничение.** Пока контейнер `docs` запущен, **не удаляйте и не переименовывайте** host-каталог `website/.docusaurus`: nested volume mount может «провалиться» в bind mount, и контейнер снова увидит host absolute paths. Если каталог на хосте уже снесли — `force-recreate` только сервиса `docs` (команда выше) восстанавливает volume mount.

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
