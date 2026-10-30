# Pharma Project Control

Система управления фармацевтическими проектами. Сейчас в репозитории строится **Docs Engineering System**: документация как код (OpenSpec + Docusaurus), локальный портал за Caddy, инженерные стандарты для AI и качества.

Реализация приложения Demo v1 (Next.js + NestJS) — **следующий этап**, не текущий scope.

---

## Быстрый старт (портал docs)

```bash
docker compose up --build -d
```

Открыть: **http://docs.localhost**

Остановка: `docker compose down`

| Host | Назначение | Сейчас |
|---|---|---|
| `docs.localhost` | Портал документации | рабочий после compose up |
| `localhost` | Frontend (будущий Next.js) | **502**, пока нет profile `app` |
| `api.localhost` | Backend (будущий NestJS) | **502**, пока нет profile `app` |

Подробности и вклад: [`CONTRIBUTING.md`](CONTRIBUTING.md). Нормы для агентов: [`AGENTS.md`](AGENTS.md).

План этапа: [`.cursor/plans/docs-engineering-system.md`](.cursor/plans/docs-engineering-system.md).

---

## Структура (обзор)

```text
/
├── README.md                 # этот файл
├── AGENTS.md                 # инструкции AI / процесс
├── CONTRIBUTING.md           # портал, OpenSpec, docs
├── docker-compose.yml        # Caddy + docs; web/api за profile app
├── Caddyfile
├── Dockerfile                # образ статики docs
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

## Demo v1 (направление, код позже)

- **Frontend:** Next.js; данные **только** через API.
- **Backend:** NestJS; mock data **только** здесь.
- **Без PostgreSQL** в Demo v1; целевой продукт — + PostgreSQL за тем же API-контрактом.

---

## Лицензии / стек docs

OpenSpec (MIT), Docusaurus 3.x (MIT), локальный search без Algolia Ask AI. Telemetry OpenSpec отключается на машине — см. CONTRIBUTING.
