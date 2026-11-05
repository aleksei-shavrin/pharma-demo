---
id: DOC-TPL-CERT-001
title: 'Шаблон: Certainty block'
type: template
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-10-30'
owner: docs-engineering
related:
  - DOC-STD-001
---
# Шаблон: Certainty block

`certainty` ставится **только в теле**, на конкретное утверждение или секцию — не на весь многоуровневый документ одним полем.

## Значения

| Значение | Смысл |
|----------|--------|
| `fact` | Подтверждено источником / решением человека / наблюдаемым артефактом |
| `assumption` | Принято временно без доказательства |
| `hypothesis` | Рабочая гипотеза; требует проверки |
| `open_question` | Вопрос без ответа |

## Формат

```markdown
> **certainty:** fact
>
> Утверждение…

> **certainty:** assumption
>
> Утверждение…

> **certainty:** hypothesis
>
> Утверждение…

> **certainty:** open_question
>
> Вопрос…
```

## Запрет для AI

AI **не** повышает `hypothesis` / `assumption` / `open_question` до `fact` и **не** утверждает документ (`approved`) без человека. См. [documentation-standard](../standards/documentation-standard.md).
