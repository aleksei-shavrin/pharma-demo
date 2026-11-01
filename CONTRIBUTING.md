# CONTRIBUTING — Pharma Project Control

Как работать с репозиторием: портал документации, OpenSpec, добавление docs.

Проза на русском; EN tech terms без перевода. Нормы для AI: [`AGENTS.md`](AGENTS.md).

---

## Локальный runtime (два сценария)

Одинаковые URL:

| URL | Сервис |
|---|---|
| http://localhost | Web (Next.js) |
| http://api.localhost | API (NestJS) |
| http://docs.localhost | Docs (Docusaurus) |

По [RFC 6761](https://www.rfc-editor.org/rfc/rfc6761.html) имена `*.localhost` резолвятся в loopback. Не запускайте **Development** и **Production-like** одновременно (порт 80).

Подробности: [`docs/10-operations/local-dev-and-demo.md`](docs/10-operations/local-dev-and-demo.md).

### Development (hot reload)

```bash
npm run dev
# docker compose -f docker-compose.dev.yml up --build -d
```

Остановка: `npm run dev:down`

Web HMR + Nest watch + Docusaurus live reload за Caddy (`Caddyfile.dev`).

Опционально без Compose (только docs): `npm run docs:dev`.

### Production-like Demo

```bash
docker compose --profile app up --build -d
curl -fsS http://api.localhost/health
# UI: http://localhost ; docs: http://docs.localhost
```

Остановка: `docker compose --profile app down` / `docker compose down`.

Docs без app-profile: `docker compose up --build -d` (статика nginx).

Narrative Playwright (локальные процессы, без Compose):

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

Против уже поднятого Compose:

```bash
npm run test:e2e:compose
```

---

## OpenSpec CLI

### Установка (предпочтительно project-local / документированный способ)

Глобально (удобно для агентов и локальной машины):

```bash
npm i -g @fission-ai/openspec
```

Альтернативы без глобальной установки:

```bash
npx @fission-ai/openspec --version
# или бинарь с релизов upstream — см. https://github.com/Fission-AI/OpenSpec
```

Инициализация в корне репозитория (уже сделана для Cursor):

```bash
openspec init --tools cursor
```

Структура: `openspec/config.yaml`, `openspec/specs/`, `openspec/changes/` (+ `archive/`). Skills/commands: `.cursor/skills/`, `.cursor/commands/`.

Living specs публикуются на портале; **`openspec/changes/` не публикуются**.

### Telemetry — ВЫКЛЮЧИТЬ (machine-global, не project YAML)

Telemetry **не** хранится в `openspec/config.yaml` репозитория. Opt-out — на машине разработчика / в CI env:

```bash
openspec config set telemetry.enabled false
```

и/или в окружении (имеет приоритет над config):

```bash
export OPENSPEC_TELEMETRY=0
# или
export DO_NOT_TRACK=1
```

В CI telemetry обычно отключается автоматически при `CI=true`. Не коммитить API-ключи telemetry в проект.

Проверка:

```bash
openspec config list
# telemetry.enabled: false
```

---

## Добавление и правка документации

1. Source of Truth: **`docs/**`** и living **`openspec/specs/`**.
2. Соблюдать [стандарт документации](docs/standards/documentation-standard.md): frontmatter, `status` ≠ `certainty`.
3. Не копировать контент в `website/` — портал multi-instance читает каталоги напрямую.
4. Существенные изменения поведения/архитектуры — Documentation First + при необходимости OpenSpec change и/или ADR (MADR).
5. Согласованные планы работ — в [`.cursor/plans/`](.cursor/plans/README.md).

Шаблоны: `docs/_templates/`. Handoff между агентами: `docs/07-delivery/handoffs/`.

---

## Проверки качества docs

Когда появятся scripts и root `package.json` (агент W2-Scripts), ожидаемые команды:

| Команда | Назначение |
|---|---|
| `npm run lint:docs` | markdownlint / стиль MD |
| `npm run lint:links` | проверка ссылок |
| `npm run test:docs` | агрегат gates docs |
| `npm run docs:build` | сборка Docusaurus |

До появления scripts: визуальная проверка портала после `docker compose up --build -d` и ручной review MD.

Portal exclude: `openspec/changes` не должны попадать в build — отдельный check появится в scripts.

---

## Pull requests

- Менять только согласованный scope (path-prefix волны/задачи).
- Для >1 сессии агента или смены роли — handoff в Git.
- Не коммитить секреты (`.env` с секретами, credentials).
- AI не выставляет `status: approved` и не повышает hypothesis→fact.
