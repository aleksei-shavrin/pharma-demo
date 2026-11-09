---
id: DOC-HANDOFF-2026-11-09-DASH-CARD-COMPOSITION
title: 'Handoff: dashboard card composition (critical / ChangeTile / Decision)'
type: handoff
status: draft
version: 0.1.1
created: '2026-11-09'
updated: '2026-11-09'
owner: demo-engineering
certainty_note: 'Execute wave after plan acceptance by Codex (human-relayed). This handoff does not stamp Codex-accepted on the result.'
related:
  - DOC-UX-004
---

# Handoff — dashboard card composition

## Мета

- **От:** Auto (основная сессия)
- **Кому:** Codex / human visual review
- **Дата:** 2026-11-09
- **Область:** 3 FE-компонента + isolated tests + UX/OpenSpec draft; shared layout / programs / people / API не трогались
- **Отчёт:** `/tmp/pharma-dashboard-card-composition/FINAL-RESULT.md`
- **План:** `.cursor/plans/dashboard-card-composition.md`

## Цель волны

Три визуальные правки: critical inset border + gutters; ChangeTile semantic 1px border; Decision one-control-object composition. Без API/field/status/critical-policy изменений.

## Сделано

1. [`top-exceptions-panel.tsx`](../../../apps/web/src/components/dashboard/top-exceptions-panel.tsx) — critical `border` border-box вместо outer ring; list `px-1 py-1`.
2. [`trend-panel.tsx`](../../../apps/web/src/components/dashboard/trend-panel.tsx) — ChangeTile tone bg + matching `--status-*-border`.
3. [`decision-panel.tsx`](../../../apps/web/src/components/dashboard/decision-panel.tsx) — «Объект контроля: Запуск производства» ×1; метрика+даты; «Связанное решение»; footer CTA; inner body scroll.
4. Tests: [`card-composition.test.tsx`](../../../apps/web/src/components/dashboard/card-composition.test.tsx).
5. Docs draft: `docs/05-ux-ui/demo-v1-dashboard.md` (assumption); OpenSpec delta в `openspec/changes/dashboard-management-cards/`.
6. Browser geometry+screenshots: `/tmp/pharma-dashboard-card-composition/`.

## Concurrent / preserve

- Дождались завершения PID **766977** перед правками; **764721** уже был неактивен.
- `dashboard-layout.ts` / `dashboard-view.tsx` / programs / people / snapshots **не писались**.
- Foreign dirty сохраняется.

## Gates (фактические exit)

См. FINAL-RESULT.md. FE composition coverage ≥80; tsc/lint 0; browser ok 0.

### Residual gate 2026-11-09 (u1 program-layout)

**Причина:** устаревший expectation `data-program-layout="compact-rag"` + row `data-rag-surface=persistent` после принятой волны `dashboard-program-people-layout` / `program-badge-compact`. Source of truth: [`workstream-readiness.tsx`](../../../apps/web/src/components/dashboard/workstream-readiness.tsx) → `name-badge-progress`; UX assumption в DOC-UX-004; handoffs `2026-11-09-dashboard-program-people-layout.md`, `2026-11-09-program-badge-compact.md`. Не регрессия 3 composition-панелей.

**Fix:** только [`dashboard-u1.test.tsx`](../../../apps/web/src/components/dashboard/dashboard-u1.test.tsx) — assert `name-badge-progress`, 7 строк, badge status tokens, fixed progress, row surface neutral. Product programs/layout не менялся. Лог: `/tmp/pharma-dashboard-card-composition/fe-u1-gate.log`.

## Checklist

- [x] Critical first/last geometry под scroll (05) + screenshots
- [x] ChangeTile computed 1px semantic border light+dark
- [x] Decision needed / in_progress / completed + 768 footer visible
- [x] Nav decision→back snapshot 11 persist
- [x] dashboard-u1 program-layout expectation aligned to `name-badge-progress`
- [ ] Codex accepted result — **не заявляется этим handoff**

## Non-goals

commit / push / deploy / new deps / API changes.
