---
id: DOC-HANDOFF-2026-11-06-SURFACE
title: 'Handoff: фон Page Surface и геометрия строк календаря'
type: handoff
status: draft
version: '0.2.0'
created: '2026-11-06'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-UX-015
  - DOC-UX-005
  - DOC-HANDOFF-2026-11-06-SHELL-LABELS
---

# Handoff: Page Surface и геометрия строк

## Мета

- **От:** Агент №3 / recovery 2026-11-07
- **Кому:** интегратор recovery
- **Дата:** 2026-11-07
- **Окно:** обычное. Мобильная раскладка не меняется.

## Разделение итогов

### Геометрия строк календаря — уже в Git

Закрыта коммитами `7765e32` (шаг 32 / шапки 40, ИСР, панель), `c811882` (typecheck), `801b626` (выбор полосы), `419fa12` (скрипт показа). Файлы `schedule-board*`, `demo-v1-schedule-workspace.md` и связанные тесты **не** остаются dirty этой волной.

### Page Surface + tokens — dirty → отдельный коммит P

- `apps/web/src/components/shell/page-surface.tsx` — пластина `bg-[var(--surface-raised)]`
- `apps/web/src/components/shell/page-surface.test.tsx`
- `docs/05-ux-ui/demo-v1-ui-foundations.md`
- `docs/05-ux-ui/demo-v1-design-tokens.md`

## Не трогать в этой волне

Подписи оболочки и портфель; C07 / ОСУП; адаптивность узкой ширины; код `schedule-*` (уже закоммичен).
