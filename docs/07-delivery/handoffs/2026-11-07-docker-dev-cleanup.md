---
id: DOC-HANDOFF-2026-11-07-DOCKER-DEV-CLEANUP
title: 'Handoff: docker-dev-cleanup (compose groups + -p scripts)'
type: handoff
status: draft
version: '0.1.1'
created: '2026-11-07'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-OPS-002
---

# Handoff: docker-dev-cleanup

## Мета

- **От:** agent / docker-dev-cleanup
- **Кому:** координатор / следующий агент по ops
- **Дата:** 2026-11-07
- **Область:** Compose project names, local containers cleanup; docs в обоих репо

## Цель волны

Оставить локально одну Compose-группу на целевой проект (`pharma-demo`, `docs-portal-dev`), убрать лишние локальные контейнеры show/server без `down -v`, закрепить стабильный `-p` в штатных npm scripts, проверить hot reload обратимыми маркерами.

## Сделано

### Очистка контейнеров

- `docker compose -p pharma-demo-show -f docker-compose.dev.yml down` (без `-v`)
- `docker compose -p docs-portal-server -f docker-compose.server.yml --profile form down` (без `-v`)
- Тома `pharma-demo-show_*` сохранены; server/файлы/`server:*` сохранены (возможность server-run)
- `onwebo*`, k8s/внешний deploy, prune, commit/push — не трогались

### Scripts / docs (эта сессия)

| Репо | Изменение |
|------|-----------|
| pharma-demo | `package.json`: `dev`/`dev:down`/`dev:logs` → `-p pharma-demo` |
| pharma-demo | `docker-compose.dev.yml`: `name: pharma-demo` + комментарий про override `-p` |
| pharma-demo | `docs/10-operations/local-dev-and-demo.md`: `-p` vs `COMPOSE_PROJECT_NAME`; polling=`true` в Compose |
| docs-portal | `README.md`: абзац про штатный `dev:docker` = `docs-portal-dev`, не плодить show/server/final-gate, временные группы снимать `down` без `-v` — **записан** (Agent, workspace = docs-portal; блокер снят). Новые строки без trailing whitespace; чужая dirty L25 (form-login) не менялась |

### Уже было до финального ревью (честно)

- `docs-portal` `dev:docker*` с `-p docs-portal-dev` — сделано **ранее в этой же сессии** (не «изначально в main»)
- `server:* --profile form` в docs-portal — **существовало до** задачи cleanup (не результат cleanup)

### Проверки

| Проверка | Результат |
|----------|-----------|
| Целевые группы | только `pharma-demo` (4), `docs-portal-dev` (1) |
| Повторный `npm run dev` | тот же `pharma-demo` |
| Повторный `npm run dev:docker` | тот же `docs-portal-dev`, count=1→1 |
| Pharma web HMR | маркер в `<title>` → restore |
| Pharma API watch | маркер в `/backend/health` → restore |
| Docs Docusaurus | маркер в `/styles.css` через `website/src/css/custom.css` → exact-byte restore |
| HTTP | `:3080/`, `/backend/health`, `/docs/`; `:8088/` |
| `compose config --quiet` / JSON `-p` | OK оба репо (на момент ревью) |

## Не сделано / вне scope

- Commit / push / deploy
- Удаление томов / prune
- Полный продуктовый test suite
- Правки `.cursor/cli.json` (временные разрешения; удаляет координатор после своего ревью)
- Разбор прочих dirty файлов в working tree (UX handoffs, form-login/server auth в docs и т.д.)

## Долгоживущие сведения

Долгоживущий итог волны — **этот handoff** (и согласованные правки в Git working tree обоих репо).
Временные `/tmp/pharma-demo-artifacts/docker-dev-cleanup/` evidence и `.cursor/cli.json` координатор удаляет после своего ревью; **не** считать их обязательными входами следующей волны.

## Working tree (не чисто)

Оба репозитория содержат **прежние** dirty/untracked файлы вне cleanup. Не считать tree чистым.

- **pharma-demo:** помимо cleanup — `page-surface*`, UX docs, handoffs 2026-11-06; также временный `.cursor/cli.json` (координатор удалит)
- **docs-portal:** помимо cleanup README/`package.json` — много server/form-login/k8s/ADR/CI dirty и untracked (`services/`, smoke scripts, theme/, rollback overlays); также временный `.cursor/cli.json` (координатор удалит)

## Блокеры

- нет

## Recovery 2026-11-07 (повторная проверка)

- Compose-группы: только `pharma-demo` (4 контейнера) и соседний `docs-portal-dev` (1); новых стеков не создавалось.
- `docker compose -p pharma-demo --env-file .env.local -f docker-compose.dev.yml config --quiet` — OK.
- HTTP: `http://localhost:3080/`, `/backend/health`, `/docs/` — 200.
- Commit этого трека — отдельный staged set (package.json, docker-compose.dev.yml, local-dev-and-demo.md, этот handoff).

## Рекомендации следующей волне

1. Опираться на этот handoff и Git-диффы cleanup; `/tmp` evidence после ревью координатора может отсутствовать.
2. Не смешивать commit cleanup с чужими dirty файлами — отдельный staged set.
