# AGENTS.md — Pharma Project Control

Инструкции для AI-агентов и людей, работающих с кодом и документацией в этом репозитории.
Проза — на русском; **EN tech terms** оставлять как есть.

Нормативные детали: [engineering constitution](docs/11-ai-engineering/engineering-constitution.md), [стандарт документации](docs/standards/documentation-standard.md), [Documentation First](docs/11-ai-engineering/documentation-first.md).

---

## 1. Documentation First (обязательный порядок)

1. **Изучить** требования, living specs (`openspec/specs/`), архитектуру, связанные ADR.
2. **Определить**, какие документы / OpenSpec change нужно изменить.
3. **Сначала** актуализировать документацию и/или OpenSpec change (draft).
4. **Согласовать** с существующими ADR или предложить новый ADR (MADR).
5. **Только затем** реализация (когда задача допускает код apps).
6. **Проверить** соответствие docs / specs / кода.
7. **Синхронизировать** docs при согласованных отклонениях.

Код не должен быть единственным хранилищем архитектурных решений. Docs в Git = Source of Truth до и после кода.

См. [documentation-first.md](docs/11-ai-engineering/documentation-first.md).

---

## 2. Test First для дефектов

При исправлении багов:

1. Зафиксировать ожидаемое поведение.
2. Написать автотест, воспроизводящий дефект.
3. Убедиться, что тест **падает** из-за бага.
4. Исправить код.
5. Тест зелёный.
6. Прогнать связанный / регрессионный набор.
7. Обновить docs, если изменилось ожидаемое поведение.

Запрещено «починить и заявить успех» без failing → passing теста.

См. [test-first-bugfix.md](docs/11-ai-engineering/test-first-bugfix.md).

---

## 3. status ≠ certainty; AI не утверждает факты

| Понятие | Где | Значения |
|---|---|---|
| `status` | YAML frontmatter | `draft` \| `review` \| `approved` \| `deprecated` \| `archived` |
| `certainty` | блоки в теле документа | `fact` \| `assumption` \| `hypothesis` \| `open_question` |

**Запрещено AI:**

- выставлять `status: approved` без явного человеческого решения;
- повышать `hypothesis` / `assumption` / `open_question` → `fact` без человека;
- смешивать `status` и `certainty` в одном поле;
- трактовать `approved` как доказательство истинности всех утверждений внутри.

См. [documentation-standard.md](docs/standards/documentation-standard.md).

---

## 4. Не выдумывать FR / GMP / доменные REQ

Не изобретать фармацевтические, GMP, регуляторные или функциональные требования без источника в:

- `docs/` (product / requirements / ADR), или
- living specs в `openspec/specs/`, или
- явном согласовании с человеком.

Помечай пробелы как `open_question` / `hypothesis`, не как факты.

---

## 5. Demo v1 — границы приложения

**Demo v1** (этап реализации приложения — **после** docs-engineering):

| Слой | Выбор |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind |
| Backend | NestJS + TypeScript |
| API | REST; контракты OpenAPI/Swagger на NestJS |
| Mock | **Только** в NestJS (hardcoded TS) |
| FE data | **Только** через HTTP API client |
| PostgreSQL | **Нет** в Demo v1 |

Запрещено: импорт mock-модулей backend во frontend; локальные fixture вместо API как «замена backend».

Целевой продукт позже: тот же FE/BE/API стиль + PostgreSQL. Переход mock→DB — через persistence adapter без ломки контрактов.

На **текущем** этапе Docs Engineering System код Next/Nest **не** реализуется.

---

## 6. Scope: docs-engineering vs apps

На задачах инфраструктуры документации / стандартов / портала / Compose docs:

- **Делать:** `docs/**`, `openspec/**`, `website/**` (портал), Docker/Caddy для docs, `AGENTS.md`, rules, scripts QA docs — по назначенному scope агента.
- **Не делать:** scaffold/реализацию `apps/web`, `apps/api`, PostgreSQL, feature-код продукта.

Один писатель на path-prefix внутри волны; не конфликтовать с параллельными агентами.

---

## 7. OpenSpec — единственный SDD; ADR — MADR

- **SDD:** только **OpenSpec**. Не подключать Spec Kit / BMAD / аналоги как второй SDD.
- **ADR:** Markdown Architectural Decision Records (MADR) в `docs/06-architecture/decisions/`.
- Living specs: `openspec/specs/` (публикуются на портале).
- Changes: `openspec/changes/` — **не** публикуются.
- Workflow: **propose → human review → apply → archive**.
- Конфиг проекта: `openspec/config.yaml` (контекст; **без** telemetry keys).
- Telemetry OpenSpec — machine-global / env, см. [CONTRIBUTING.md](CONTRIBUTING.md).

Cursor skills/commands после `openspec init --tools cursor`: `.cursor/skills/`, `.cursor/commands/`.

---

## 8. Handoff в Git

Между сессиями агентов и при смене роли (plan → implement → review → test):

- Шаблон: `docs/_templates/handoff.md`.
- Экземпляры: `docs/07-delivery/handoffs/YYYY-MM-DD-<slug>.md`.
- Для OpenSpec change — опционально `openspec/changes/<id>/handoff.md` + ссылка из delivery/handoffs.
- Порог: >1 сессии агента или смена роли → файл handoff обязателен (не полагаться только на chat history).

---

## 9. Cursor plans в Git

Существенные **согласованные** планы сохранять в **`.cursor/plans/`**.

- В Cursor есть **Save to Workspace** (перенос из `~/.cursor/plans/` → `.cursor/plans/`).
- На **WSL / remote** пункт меню может отсутствовать — **ручное копирование** файла в `.cursor/plans/` допустимо.
- **Нет** автоматического default-сохранения всех черновиков; **не** менять global Cursor settings ради этого.
- Не дублировать ADR / OpenSpec / roadmap — **ссылаться**.
- Политика: [cursor-plans-in-git.md](docs/11-ai-engineering/cursor-plans-in-git.md).
- Текущий план этапа: [`.cursor/plans/docs-engineering-system.md`](.cursor/plans/docs-engineering-system.md).

---

## 10. Quality (ориентиры)

Когда появится код apps:

- Coverage ≥ 80% statements/branches/functions/lines **отдельно** для FE и BE.
- Architecture tests: FE ↛ mock; data-access только API client.
- См. `docs/08-quality/` (testing-strategy, coverage-policy, architecture-tests).

Сейчас обязательны gates документации (lint, links, portal excludes, docs build) — когда появятся scripts (W2-Scripts).

---

## 11. Секреты и язык

- Секреты, токены, персональные данные — **не** в docs, specs, plans, примерах.
- Язык docs: русский + EN tech terms; i18n портала зарезервирован.

---

## 12. Быстрые ссылки

| Тема | Путь |
|---|---|
| Конституция AI | `docs/11-ai-engineering/engineering-constitution.md` |
| Documentation First | `docs/11-ai-engineering/documentation-first.md` |
| Test First bugfix | `docs/11-ai-engineering/test-first-bugfix.md` |
| Cursor plans | `docs/11-ai-engineering/cursor-plans-in-git.md` |
| Стандарт docs | `docs/standards/documentation-standard.md` |
| OpenSpec living | `openspec/specs/` |
| Вклад / портал / telemetry | `CONTRIBUTING.md` |
| Обзор репо | `README.md` |
