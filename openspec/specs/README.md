# OpenSpec — living specs

Living specifications (живая спецификация) для **Pharma Demo**.

## Что публикуется

На портале документации раздел **`/openspec`** строится **только** из каталога `openspec/specs/`.

Черновики изменений в `openspec/changes/` (и `openspec/changes/archive/`) **не публикуются** на портале — это рабочий контур propose → review → apply → archive.

## Как читать

| Каталог | Роль | В портале |
|---|---|---|
| `openspec/specs/` | Утверждённые / living capabilities (SoT) | Да |
| `openspec/changes/` | Активные delta-changes | Нет |
| `openspec/changes/archive/` | Завершённые changes | Нет |

## Workflow

1. **propose** — предложение change (артефакты в `openspec/changes/<id>/`).
2. **review** — человеческий разбор (AI не auto-approve).
3. **apply** — применение delta в living specs.
4. **archive** — перенос change в archive.

Подробности для агентов: корневой `AGENTS.md`; для людей: `CONTRIBUTING.md` (в корне репозитория, вне портала). Инженерные правила — в портале: раздел **AI Engineering** (`docs/11-ai-engineering/`).

## Связь с docs

Продуктовый и архитектурный контекст — в `docs/` (vision, Demo v1, ADR). OpenSpec не заменяет ADR (MADR) и не дублирует roadmap: ссылайтесь, не копируйте.
