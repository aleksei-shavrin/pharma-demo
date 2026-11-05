---
id: DOC-PORTAL-FINAL-001
title: Итоговый отчёт портала
type: portal
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PORTAL-001
  - DOC-ADR-0001
  - DOC-ADR-0002
  - DOC-ADR-0003
---
# Итоговый отчёт: Docs Engineering System

> **certainty:** fact
>
> Отчёт фиксирует фактически выполненную работу волны W1–W3 на 2026-10-30. Непроверенное отмечено отдельно.

## 1. Что реализовано по волнам

### W1 (параллельно)

| Пакет | Результат |
|-------|-----------|
| W1-Docs | Фундамент `docs/**` (53 MD): стандарт status≠certainty, шаблоны, portal/product/architecture/ADR/quality/AI, handoffs |
| W1-Portal | Docusaurus 3.10.2 в `website/`: multi-instance `../docs` + `../openspec/specs`, Mermaid, local search `ru`+`en`, без Algolia/Ask AI |
| W1-Docker | `docker-compose.yml` (`ppc-net`), Caddy `http://docs.localhost`, Dockerfile multi-stage, profile `app` для web/api |

### W2 (параллельно)

| Пакет | Результат |
|-------|-----------|
| W2-Agents | OpenSpec init (Cursor), `AGENTS.md`, `.cursor/rules`, CONTRIBUTING/README, политика `.cursor/plans/` |
| W2-Scripts | Root `package.json`, scripts проверок, `.gitignore`, `.editorconfig`, `.env.example`, markdownlint |

### W3 (интегратор)

- Исправлены broken links OpenSpec ↔ Docusaurus.
- `npm run test:docs` — OK.
- `docker compose up --build -d` — только `proxy` + `docs`.
- Проверен Host-routing и `http://docs.localhost`.

## 2. Структура репозитория (ключевое)

```text
.cursor/plans/          # согласованные планы AI в Git
.cursor/rules/          # thin Cursor rules
AGENTS.md
CONTRIBUTING.md
README.md
Caddyfile
Dockerfile
docker-compose.yml
docs/                   # SoT документации
openspec/specs/         # living specs (публикуются)
openspec/changes/       # не публикуются
scripts/                # quality gates
website/                # Docusaurus (без копий контента)
```

Приложения Next.js/NestJS **не** создавались (вне scope).

## 3. ADR и OpenSpec

**ADR (MADR, RU):**

- `docs/06-architecture/decisions/0001-documentation-stack.md`
- `docs/06-architecture/decisions/0002-target-technology-stack-direction.md`
- `docs/06-architecture/decisions/0003-local-dev-urls-and-proxy.md`

**OpenSpec:**

- `openspec/config.yaml` (без telemetry)
- `openspec/specs/README.md` (индекс; living capabilities пока пустые — ожидаемо до discovery)
- `openspec/changes/` + archive (не на портале)
- Cursor skills/commands: `.cursor/skills/openspec-*`, `.cursor/commands/opsx-*`

## 4. Правила Cursor / AGENTS

- `AGENTS.md` — Documentation First, Test First, Demo v1 boundaries, plans in Git, no auto-approve.
- Rules: `core.mdc`, `docs.mdc`, `openspec.mdc`, `website.mdc`, `cursor-plans.mdc`.

## 5. Политика хранения планов Cursor

- Каталог: `.cursor/plans/` (в репозитории).
- Согласованный план: `.cursor/plans/docs-engineering-system.md`.
- Описание: `.cursor/plans/README.md`, `docs/11-ai-engineering/cursor-plans-in-git.md`.
- Cursor поддерживает **Save to Workspace** (перенос из `~/.cursor/plans`); автоматический default storage **не** гарантируется; на WSL/remote пункт меню может отсутствовать — допустимо ручное копирование. Глобальные настройки Cursor не менялись.

## 6. Выполненные проверки

| Проверка | Результат |
|----------|-----------|
| `npm run check:frontmatter` | OK (53) |
| `npm run check:ids` | OK (53 unique) |
| `npm run check:certainty` | OK (10 seed) |
| `npm run lint:docs` | OK (0 errors) |
| `npm run lint:links` | OK (после фикса OpenSpec README) |
| `npm run docs:build` | OK |
| `npm run check:portal-excludes` | OK (нет утечки routes `changes/`) |
| `npm run test:docs` | OK |
| `docker compose config` | default: `docs`, `proxy` |
| `docker compose up --build -d` | OK |
| `curl -H 'Host: docs.localhost' http://127.0.0.1/` | **200** |
| `curl http://docs.localhost/` | **200** |
| `/docs/`, `/openspec/` | **200** |
| `Host: localhost` (без app) | **502** (ожидаемо) |
| `--profile app` services | `web`, `api` добавляются |
| `search-index.json` remotely | **200**; индекс содержит RU/EN термины (архитектур*, требован*, OpenSpec, NestJS, …) |
| Внешние CDN в build HTML (googleapis/algolia/unpkg) | **не найдено** grep-ом |
| Mermaid assets в build | присутствуют |

> **certainty:** assumption
>
> Полноценный интерактивный клик по UI поиска в браузере с DevTools Network offline не автоматизировался; проверены наличие индекса, HTTP 200 и вхождение русскоязычных токенов в `search-index.json`.

## 7. Ограничения и открытые вопросы

- `http://localhost` / `api.localhost` отдают 502, пока нет profile `app` с реальными сервисами.
- Living OpenSpec capabilities пустые до product discovery.
- Auth на портале нет (см. access-and-security).
- Build docs требует npm/Docker registries (offline **runtime** собранного сайта — цель; offline **build** не заявлен).
- ORM / monorepo / auth / contract-tool — ADR backlog.
- CORS и Server Components fetch strategy — при Demo v1.

## 8. Вне текущего scope (следующий этап)

- Реализация Next.js / NestJS / PostgreSQL.
- Coverage CI 80% для apps.
- Architecture/contract/e2e tests на коде приложения.
- Наполнение FR/NFR после discovery с заказчиком.
- GMP/регуляторные требования — только из подтверждённых источников.

## Запуск

```bash
docker compose up --build -d
# Портал: http://docs.localhost
docker compose down
```

Опционально для разработки портала: `npm run docs:dev`.
