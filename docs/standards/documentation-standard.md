---
id: DOC-STD-001
title: "Стандарт документации"
type: standard
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-STD-002
  - DOC-TPL-CERT-001
  - DOC-AI-001
---

# Стандарт документации

Правила для всех substantive Markdown-файлов в `docs/**`.

## 1. YAML frontmatter (обязателен)

Каждый substantive MD-файл содержит frontmatter:

```yaml
id: DOC-...
title: "..."
type: ...
status: draft|review|approved|deprecated|archived
version: "0.1.0"
created: YYYY-MM-DD
updated: YYYY-MM-DD
owner: "docs-engineering"
related: []
```

Допустимые `type` (неполный список): `portal`, `standard`, `template`, `product`, `architecture`, `adr`, `quality`, `delivery`, `handoff`, `guide`, `index`, `ai-policy`.

## 2. Именование файлов и ID

- Файлы: `kebab-case.md` (например `vision-and-scope.md`).
- ADR: `NNNN-short-title.md` в `06-architecture/decisions/`.
- Handoff: `YYYY-MM-DD-<slug>.md` в `07-delivery/handoffs/`.
- ID документа: `DOC-<AREA>-<NNN>` (пример: `DOC-PROD-001`).
- ID требований (когда появятся): `REQ-<AREA>-NNN` — см. `04-requirements/`.
- ID ADR: номер в имени файла + поле `id` вида `DOC-ADR-0001`.

## 3. status ≠ certainty

| Понятие | Где | Значения |
|---------|-----|----------|
| `status` | только YAML frontmatter | draft, review, approved, deprecated, archived |
| `certainty` | только в теле документа, блоками | fact, assumption, hypothesis, open_question |

Запрещено:

- ставить одно поле `certainty` на весь документ с разнородными утверждениями;
- смешивать `status` и `certainty` в одном поле;
- трактовать `approved` как доказательство истинности всех утверждений внутри.

### Блоки certainty в теле

Использовать шаблон [`certainty-block`](../_templates/certainty-block.md):

```markdown
> **certainty:** hypothesis
>
> Текст утверждения…
```

В одном документе может быть несколько блоков с разной certainty.

## 4. AI и смена certainty / status

> **Правило (нормативное):** AI-агент **никогда** не повышает `hypothesis` → `fact`, не меняет `assumption`/`open_question` на `fact` и **не** выставляет `status: approved` без явного человеческого решения. Авто-approve запрещён.

Человек подтверждает факты и утверждает документы. AI может предлагать черновики со `status: draft` и помечать утверждения как `hypothesis` / `assumption` / `open_question`.

## 5. Ссылки

- Предпочитать относительные пути внутри `docs/`.
- В `related` указывать ID документов, не только пути.
- Не дублировать ADR / OpenSpec / roadmap — ссылаться.

## 6. Mermaid

Диаграммы — в fenced blocks ` ```mermaid `. Подписи на русском; имена компонентов/сервисов — как в коде (EN).

## 7. Версионирование

- SemVer в `version` документа (старт `"0.1.0"`).
- При смысловом изменении: bump `version`, обновить `updated`.
- Breaking-изменения структуры ID/схемы — отметить в changelog раздела или handoff.

## 8. Архивация

- Устаревшее: `status: deprecated` + ссылка на замену.
- Снятое с поддержки: `status: archived` (файл можно перенести в `archive/` позже; пока достаточно статуса).

## 9. Секреты и чувствительные данные

Запрещено в docs:

- пароли, API keys, tokens, connection strings с credentials;
- персональные данные пациентов / реальные production secrets;
- полные `.env` файлы.

Для примеров — плейсхолдеры (`<API_KEY>`, `postgres://user:***@host/db`).

## 10. Язык

Текст — **русский**. Технические имена (OpenSpec, ADR, Mermaid, Docusaurus, NestJS, Next.js, PostgreSQL, Vitest, Playwright и т.д.) — **английские**, без перевода.
