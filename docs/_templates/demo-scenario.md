---
id: DOC-TPL-DEMO-001
title: "Шаблон: Demo scenario"
type: template
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-003
---

# Шаблон: Demo scenario

```yaml
id: DOC-DEMO-...
title: "Demo: <сценарий>"
type: product
status: draft
version: "0.1.0"
created: YYYY-MM-DD
updated: YYYY-MM-DD
owner: "docs-engineering"
related: []
```

## Цель демонстрации

`<что показываем>`

## Предусловия окружения

- FE: `<URL>`
- API: `<URL>`
- Docs: `<URL>` (если нужно)

## Скрипт

1. `<шаг актёра>`
2. `<ожидаемый отклик UI/API>`

## Вне scope демо

- `<что не показываем>`

## Заметки по mock

> **certainty:** fact
>
> Для Demo v1 данные — mock в NestJS; FE ходит только через API.
