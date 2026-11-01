---
id: DOC-OPS-002
title: "Local development and production-like Demo"
type: delivery
status: draft
version: "0.1.0"
created: 2026-11-01
updated: 2026-11-01
owner: "docs-engineering"
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

URLs в обоих случаях:

| Host | Сервис |
|------|--------|
| [http://localhost](http://localhost) | Web |
| [http://api.localhost](http://api.localhost) | API |
| [http://docs.localhost](http://docs.localhost) | Docs |

Не запускайте оба стека одновременно: оба занимают порт **80**.

---

## Development

```bash
npm run dev
# equivalent: docker compose -f docker-compose.dev.yml up --build -d
```

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
