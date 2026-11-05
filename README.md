# Pharma Demo

Система управления фармацевтическими проектами. **Demo v1** (Next.js + NestJS + docs portal) развивается дальше; Docs Engineering System — фундамент.

---

## Быстрый старт

| Сценарий | Команда | Назначение |
|---|---|---|
| **Development** | `npm run dev` | Hot reload Web + API + Docs (`*.localhost`, порт 80) |
| **Local production-like** | `docker compose --profile app up --build -d` | Образы на `*.localhost` |
| **Server / IP:port** | `docker compose -p pharma-demo-server -f docker-compose.server.yml up --build -d` | Один origin: `/`, `/backend`, `/portal` (default порт **8080**) |
| **k3s (namespace `pharma`)** | push в `main` → GitLab CI | Host `https://[demo-host]/` — см. [`k8s/README.md`](k8s/README.md) |

На сервере достаточно **Git + Docker + Compose** (Node/npm на хосте не нужны). После `cp .env.example .env` задайте `HOST_PORT`, `WEB_ORIGIN` и `PUBLIC_ORIGIN` на внешний `http://SERVER_IP:PORT` или домен.  
Для k3s на ветке `main` CI собирает образы `web` / `api` / `docs` и применяет `k8s/` (нужна CI variable `KUBECONFIG_BASE64`, как в `redmineaddon`).

Остановка server: `docker compose -p pharma-demo-server -f docker-compose.server.yml down`  
Локальные алиасы: `npm run server:up` / `server:down` / `server:logs` · dev: `npm run dev:down`

Префиксы `/backend` и `/portal` **фиксированы** в `Caddyfile.server` (не менять через произвольный env).

**Это mock demo** (данные в NestJS без PostgreSQL) — не система для реальных производственных данных.

### Local (ADR-0003)

| Host | Назначение |
|---|---|
| `localhost` | Frontend (Next.js) |
| `api.localhost` | Backend (NestJS) |
| `docs.localhost` | Портал документации |

### Server single-origin (ADR-0005)

| URL | Назначение |
|---|---|
| `http://HOST:PORT/` | UI |
| `http://HOST:PORT/backend/...` | Mock NestJS API (+ Swagger `/backend/api`) |
| `http://HOST:PORT/portal/` | Docs |

Demo использует **mock-данные** в API (без PostgreSQL).  
Подробности: [`docs/10-operations/server-compose-demo.md`](docs/10-operations/server-compose-demo.md), [`docs/10-operations/local-dev-and-demo.md`](docs/10-operations/local-dev-and-demo.md), [`CONTRIBUTING.md`](CONTRIBUTING.md). Нормы для агентов: [`AGENTS.md`](AGENTS.md).

Живой показ: [Live Presentation Guide](docs/guides/how-to/demo-v1-live-presentation.md).

---

## Структура (обзор)

```text
/
├── README.md                 # этот файл
├── AGENTS.md                 # инструкции AI / процесс
├── CONTRIBUTING.md           # портал, OpenSpec, docs
├── docker-compose.yml        # local production-like: Caddy + docs; web/api за profile app
├── docker-compose.dev.yml    # development: HMR/watch + Caddyfile.dev
├── docker-compose.server.yml # server/IP:port single-origin (ADR-0005)
├── Caddyfile / Caddyfile.dev / Caddyfile.server
├── Dockerfile                # образ статики docs (prod-like; Node 24)
├── website/Dockerfile.dev    # Docusaurus dev
├── .cursor/
│   ├── plans/                # согласованные Cursor plans
│   └── rules/                # тонкие Cursor rules → AGENTS/docs
├── openspec/
│   ├── config.yaml           # контекст проекта (без telemetry)
│   ├── specs/                # living specs (на портале)
│   └── changes/              # delta (НЕ на портале)
├── docs/                     # Markdown SoT (RU)
├── website/                  # Docusaurus (без копий контента)
└── scripts/                  # QA docs (появляются отдельно)
```

---

## Документация

- Портал: http://docs.localhost после Compose.
- SoT: каталог [`docs/`](docs/) и living specs [`openspec/specs/`](openspec/specs/).
- AI / Documentation First / Test First: [`docs/11-ai-engineering/`](docs/11-ai-engineering/).
- Конституция: [`docs/11-ai-engineering/engineering-constitution.md`](docs/11-ai-engineering/engineering-constitution.md).
- Стандарт MD: [`docs/standards/documentation-standard.md`](docs/standards/documentation-standard.md).

---

## Demo v1

- **Frontend:** Next.js; данные **только** через API.
- **Backend:** NestJS; mock data **только** здесь.
- **Без PostgreSQL** в Demo v1; целевой продукт — + PostgreSQL за тем же API-контрактом.
- Продолжение развития: [`.cursor/plans/demo-v1-enrichment.md`](.cursor/plans/demo-v1-enrichment.md) (I1–I8 — исторический baseline).

---

## Лицензии / стек docs

OpenSpec (MIT), Docusaurus 3.x (MIT), локальный search без Algolia Ask AI. Telemetry OpenSpec отключается на машине — см. CONTRIBUTING.

Сведения о переименовании: [переименование репозитория](docs/10-operations/repository-rename.md).
