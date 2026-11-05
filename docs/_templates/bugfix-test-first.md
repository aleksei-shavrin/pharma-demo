---
id: DOC-TPL-BUGFIX-001
title: 'Шаблон: Bugfix test-first'
type: template
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-10-30'
owner: docs-engineering
related:
  - DOC-AI-003
  - DOC-QA-001
---
# Шаблон: Bugfix test-first

Политика: см. [test-first-bugfix](../11-ai-engineering/test-first-bugfix.md).

```yaml
id: DOC-BUG-...
title: "Bugfix: <кратко>"
type: delivery
status: draft
version: "0.1.0"
created: YYYY-MM-DD
updated: YYYY-MM-DD
owner: "docs-engineering"
related: []
```

## Симптом

`<что наблюдается>`

## Воспроизведение

1. `<шаг>`

## Ожидаемое vs фактическое

| | |
|--|--|
| Ожидание | |
| Факт | |

## Падающий тест (сначала)

- Файл теста: `<path>`
- Утверждение: `<assert>`
- Результат до фикса: **FAIL** (обязательно)

## Исправление

`<описание минимального фикса>`

## Проверка

- [ ] Тест зелёный
- [ ] Регрессия соседних тестов пройдена
- [ ] Документация/ADR обновлены при необходимости
