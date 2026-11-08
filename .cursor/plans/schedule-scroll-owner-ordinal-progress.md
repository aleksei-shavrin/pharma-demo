---
name: Schedule scroll owner ordinal progress
overview: "Единый Y owner; vendor-matched sticky chart scale; №; progress; toolbar. Browser evidence на localhost DX login."
todos:
  - id: docs
    content: OpenSpec change + UX/ADR/walkthrough drafts
    status: completed
  - id: scroll
    content: Shared outer scroll owner; vendor sticky scale; wheel forward
    status: completed
  - id: toolbar
    content: Toggles right of Тип точки; comparison icons
    status: completed
  - id: ordinal-progress
    content: Column № + progress dash for non-work
    status: completed
  - id: verify
    content: web:test/typecheck + browser evidence + handoff
    status: completed
isProject: false
---

# Schedule: scroll owner, №, progress, toolbar

## Решения

1. **Scroll:** один `[data-schedule-scroll-owner]`; wheel capture на owner для nested H-ports; без dual Y bind.
2. **Chart sticky:** внешняя шапка из `extractGanttMonthScaleGeometry` (`posFromDate`/`dateFromPos`), не `buildScheduleHorizon`+fixed 72px; `scale_height=0`; **без** stretch `scrollWidth`. H: `.gantt_hor_scroll` + sticky `.scrollHor_cell`; `.gantt_task` overflow-x hidden для vendor pan.
3. **№ / progress / toolbar:** как ранее.
4. **Browser:** `http://localhost:3080` + `.env.dev-auth` / `.dev-login-password` (без печати секретов).

## Evidence

`/tmp/pharma-demo-artifacts/schedule-scroll-owner-1c199ddd/` — см. handoff v0.4.0.

## Вне scope

commit/push; form-login волна; docs EACCES/MD001/API architecture.
