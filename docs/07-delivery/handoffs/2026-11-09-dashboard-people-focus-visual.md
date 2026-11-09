---
id: DOC-HANDOFF-2026-11-09-PEOPLE-FOCUS-VISUAL
title: 'Handoff: People-focus card visual hierarchy'
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: demo-v1
related:
  - docs/07-delivery/handoffs/2026-11-09-dashboard-people-focus.md
  - docs/05-ux-ui/demo-v1-dashboard.md
---

# Handoff: visual UX people-focus

## Мета

- **От:** Cursor Auto (people-focus visual wave)
- **Кому:** review / QA
- **Дата:** 2026-11-09
- **Область:** `apps/web/src/components/dashboard/people-focus-panel.tsx` (+ tests), UX note в dashboard

## Цель

Типографика и semantic accents на карточке без изменения BE/sort/counts. Не красить человека как «неуспешного».

## Состояния (fact)

| State | Условие | UI |
|---|---|---|
| quiet | `totalPeopleInFocus === 0` | ok pill «Без активных вопросов»; unassigned amber отдельно |
| attention | `criticalQuestionCount > 0` | danger pill «Требует внимания» |
| active | people>0 и critical=0 | warn/neutral pill «Активные вопросы» |
| new metric | `newCritical > 0` | warn tint на metric (дополнение, не отдельный impossible state) |

Zero critical / zero new → нейтральные ячейки (не red/amber alarm).

## Артефакты

`/tmp/pharma-demo-artifacts/pharma-people-focus-visual-1c199ddd/`

## Limits

- BE frozen; foreign test failures not claimed green.
- Removed green ≠ «все риски проверены».
