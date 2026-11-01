# Pharma Project Control

Система управления фармацевтическими проектами. **Demo v1** (Next.js + NestJS + docs portal) развивается дальше; Docs Engineering System — фундамент.

---

## Быстрый старт

| Сценарий | Команда | Назначение |
|---|---|---|
| **Development** | `npm run dev` | Hot reload Web + API + Docs |
| **Production-like Demo** | `docker compose --profile app up --build -d` | Образы для показа |

Остановка: `npm run dev:down` · `docker compose down`

| Host | Назначение |
|---|---|
| `localhost` | Frontend (Next.js) |
| `api.localhost` | Backend (NestJS) |
| `docs.localhost` | Портал документации |

Подробности: [`CONTRIBUTING.md`](CONTRIBUTING.md), [`docs/10-operations/local-dev-and-demo.md`](docs/10-operations/local-dev-and-demo.md). Нормы для агентов: [`AGENTS.md`](AGENTS.md).

Живой показ: [Live Presentation Guide](docs/guides/how-to/demo-v1-live-presentation.md).

---

## Структура (обзор)

```text
/
├── README.md                 # этот файл
├── AGENTS.md                 # инструкции AI / процесс
├── CONTRIBUTING.md           # портал, OpenSpec, docs
├── docker-compose.yml        # production-like: Caddy + docs; web/api за profile app
├── docker-compose.dev.yml    # development: HMR/watch + Caddyfile.dev
├── Caddyfile / Caddyfile.dev
├── Dockerfile                # образ статики docs (prod-like)
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
