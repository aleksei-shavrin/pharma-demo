---
id: DOC-HANDOFF-2026-11-09-PROGRAM-BADGE-COMPACT
title: 'Handoff: program status badge compact'
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: demo-v1
related:
  - docs/05-ux-ui/demo-v1-dashboard.md
  - docs/07-delivery/handoffs/2026-11-09-dashboard-program-people-layout.md
---

# Handoff: program status badge compact

## Мета

- **От:** Auto agent
- **Кому:** review
- **Дата:** 2026-11-09
- **Область:** `apps/web` program-readiness badge only

## Цель

Менее закруглённый и компактнее status-badge в «Состояние по программам» (как people-focus).

## Сделано

- `rounded-full` → `rounded-[var(--radius-sm)]` (6px); `px-2` → `px-1.5`; height ~16px; `leading-none` + `whitespace-nowrap`.
- Status col `8.5rem` → `8.75rem` (однострочный Yellow без clip). Progress geometry без изменений.
- Tests + clean browser 09 light/dark 1440/768 → `/tmp/pharma-demo-artifacts/pharma-program-badge-compact/`.

## Не сделано

- commit/push; другие карточки; BE.

> **certainty:** assumption — UI density only.
