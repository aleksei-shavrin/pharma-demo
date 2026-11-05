---
id: DOC-TPL-AI-001
title: 'Шаблон: AI task checklist'
type: template
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-10-30'
owner: docs-engineering
related:
  - DOC-AI-001
  - DOC-AI-002
---
# Шаблон: AI task checklist

Использовать перед стартом и перед сдачей задачи агентом.

```yaml
id: DOC-AI-TASK-...
title: "AI task: <кратко>"
type: ai-policy
status: draft
version: "0.1.0"
created: YYYY-MM-DD
updated: YYYY-MM-DD
owner: "docs-engineering"
related: []
```

## Перед стартом

- [ ] Прочитан релевантный раздел docs / OpenSpec / ADR
- [ ] Scope и out-of-scope зафиксированы
- [ ] Не изобретать доменные REQ / GMP без источника
- [ ] Секреты не попадут в docs или код-примеры

## Во время работы

- [ ] Documentation-first: артефакт/обновление docs до или вместе с кодом (если применимо)
- [ ] Утверждения помечены certainty-блоками
- [ ] `status` документа не повышен до `approved` AI
- [ ] hypothesis не повышена до fact AI

## Перед сдачей

- [ ] Список изменённых файлов
- [ ] Handoff или краткий итог
- [ ] Блокеры перечислены явно
- [ ] Ссылки на ADR/OpenSpec вместо дублирования
