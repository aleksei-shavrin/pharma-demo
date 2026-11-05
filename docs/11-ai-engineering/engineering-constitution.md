---
id: DOC-AI-001
title: Инженерная конституция (AI)
type: ai-policy
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-STD-001
  - DOC-AI-002
  - DOC-AI-003
  - DOC-AI-004
---
# Engineering constitution (AI)

Краткая конституция для агентов. Детали — в связанных политиках и стандартах.

## Обязательные нормы

1. **Scope discipline** — менять только согласованные пути; для W1-Docs — только `docs/**`.
2. **No invented domain REQ** — не выдумывать pharma/GMP/FR.
3. **status ≠ certainty** — см. [documentation-standard](../standards/documentation-standard.md).
4. **AI never auto-approves** — запрещено выставлять `status: approved` и повышать `hypothesis`/`assumption`/`open_question` → `fact` без человека.
5. **No secrets** в docs и примерах.
6. **Documentation-first** — [documentation-first](./documentation-first.md).
7. **Bugfix test-first** — [test-first-bugfix](./test-first-bugfix.md).
8. **Не дублировать** ADR / OpenSpec / roadmap — ссылаться; планы Cursor — [cursor-plans-in-git](./cursor-plans-in-git.md).
9. **Язык docs** — русский + EN tech terms.

## Чеклист задачи

См. [`ai-task-checklist`](../_templates/ai-task-checklist.md).
