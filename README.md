# Pharma Demo

Система управления фармацевтическими проектами. **Demo v1** (Next.js + NestJS + docs portal) развивается дальше; Docs Engineering System — фундамент.

---

## Быстрый старт

| Сценарий | Команда | Назначение |
|---|---|---|
| **Development** | `npm run dev` | Hot reload Web + API + Docs, один origin на **:3080** |
| **Local production-like** | `docker compose --profile app up --build -d` | Образы; host-routing `*.localhost` на :80 |
| **Server / IP:port** | `docker compose -p pharma-demo-server -f docker-compose.server.yml up --build -d` | Один origin: `/`, `/backend`, `/docs` (default **8080**) |
| **k3s (namespace `pharma`)** | push в `main` → GitLab CI | Host `https://[demo-host]/` — см. [`k8s/README.md`](k8s/README.md) |

```bash
cp .env.local.example .env.local   # HOST_PORT=3080 по умолчанию
npm run dev                        # = docker compose --env-file .env.local -f docker-compose.dev.yml up --build -d
# → http://localhost:3080/
# → http://localhost:3080/backend/health
# → http://localhost:3080/docs/
npm run dev:down                   # тома сохраняются (без -v)
```

Для k3s на ветке `main` CI собирает образы `web` / `api` / `docs` и применяет `k8s/` (нужна CI variable `KUBECONFIG_BASE64`, как в `redmineaddon`).

DX Docs: generated `website/.docusaurus` в контейнере — named volume (`ppc_dev_docs_docusaurus`), поэтому host `npm run docs:build` не ломает live `/docs/`. Детали: [local-dev-and-demo](docs/10-operations/local-dev-and-demo.md).

Смена порта: правьте `HOST_PORT`, `WEB_ORIGIN`, `PUBLIC_ORIGIN`, `DOCUSAURUS_URL` в **корневом** `.env.local`.  
`apps/web/.env.local` — только для native `npm run web:dev` (без Compose).

Откат к прежнему host-routing на :80: вернуть старый `Caddyfile.dev` из Git history и `ports: "80:80"` в compose, либо использовать production-like profile на :80.

На сервере достаточно **Git + Docker + Compose**. После `cp .env.example .env` задайте `HOST_PORT`, `WEB_ORIGIN` и `PUBLIC_ORIGIN`.  
Алиасы: `npm run server:up` / `server:down` / `server:logs`.

Префиксы `/backend` и `/docs` **фиксированы** в `Caddyfile.dev` / `Caddyfile.server`. Старые закладки `/portal/*` редиректятся на `/docs/*` (308).

**Это mock demo** (данные в NestJS без PostgreSQL).

### Local single-origin (dev, path parity with ADR-0005)

| URL | Назначение |
|---|---|
| `http://localhost:3080/` | Frontend (Next.js HMR) |
| `http://localhost:3080/backend/...` | NestJS (+ Swagger `/backend/api`) |
| `http://localhost:3080/docs/` | Docs (Docusaurus live) |

Legacy hostnames (`api.localhost` / `docs.localhost`) — только native или production-like Compose, не текущий `npm run dev`.

### Server single-origin (ADR-0005)

| URL | Назначение |
|---|---|
| `http://HOST:PORT/` | UI |
| `http://HOST:PORT/backend/...` | Mock NestJS API (+ Swagger `/backend/api`) |
| `http://HOST:PORT/docs/` | Docs |

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

- Портал (dev): http://localhost:3080/docs/ после `npm run dev`.
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
