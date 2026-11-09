---
id: DOC-HANDOFF-2026-11-09-DASH-TWO-COLUMNS
title: 'Handoff: dashboard lower cards two independent columns'
type: handoff
status: draft
version: 0.1.0
created: '2026-11-09'
updated: '2026-11-09'
owner: demo-engineering
certainty_note: 'User-requested layout change superseding B11 auto-flow. Not Codex-accepted stamp.'
related:
  - DOC-UX-004
---

# Handoff — lower cards two columns

## Мета

- **От:** Auto
- **Кому:** Codex / human visual review
- **Дата:** 2026-11-09
- **Evidence:** `/tmp/pharma-dashboard-two-columns/`

## Сделано

- UX draft DOC-UX-004 §6 → independent columns (assumption; supersedes B11 auto-flow).
- [`dashboard-layout.ts`](../../../apps/web/src/lib/dashboard/dashboard-layout.ts) + [`dashboard-view.tsx`](../../../apps/web/src/components/dashboard/dashboard-view.tsx): left People→Attention→Changes; right Exceptions→Decision?; `items-start`; Tailwind literals synced.
- Tests: `dashboard-u1` order/layout asserts.
- Browser 1440/1920/768 × snaps 01/11 — geometry ok.

## Не трогали

timeline / header / selector (e272); domain/API; programs; composition panel internals.

## Gates

| Gate | Exit |
|------|------|
| u1 + view + composition | 0 (44) |
| tsc / eslint | 0 |
| browser-two-columns | 0 |

## Checklist

- [x] Desktop side-by-side; narrow left-then-right
- [x] 01 no Decision hole; 11 Decision under Exceptions
- [ ] Codex accepted — не заявляется
