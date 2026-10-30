# CONTRIBUTING — Pharma Project Control

Как работать с репозиторием: портал документации, OpenSpec, добавление docs.

Проза на русском; EN tech terms без перевода. Нормы для AI: [`AGENTS.md`](AGENTS.md).

---

## Портал документации (локально)

Основной runtime — **Docker Compose** + Caddy (Host-routing).

```bash
docker compose up --build -d
```

Открыть: **http://docs.localhost**

Остановка:

```bash
docker compose down
```

По [RFC 6761](https://www.rfc-editor.org/rfc/rfc6761.html) имена `*.localhost` резолвятся в loopback в современных браузерах. Если клиент не поддерживает — fallback `/etc/hosts` (не основной путь).

### Hosts на этапе docs

| URL | Сервис | Сейчас |
|---|---|---|
| http://docs.localhost | портал (Docusaurus static за Caddy) | ожидается HTTP 200 |
| http://localhost | future web (Next.js) | **502**, пока не включён profile `app` |
| http://api.localhost | future API (NestJS) | **502**, пока не включён profile `app` |

App-стек (когда появится код):

```bash
docker compose --profile app up --build -d
```

Опционально для авторов портала (hot-reload, не продакшен-runtime): команды `docs:dev` в root `package.json` — появятся вместе со scripts (W2-Scripts).

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
