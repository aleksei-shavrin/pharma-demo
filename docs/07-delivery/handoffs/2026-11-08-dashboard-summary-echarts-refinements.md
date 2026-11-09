---
id: DOC-HO-2026-11-08-DASHBOARD-ECHARTS-REFINE
title: 'Handoff: dashboard summary + ECharts refinements'
type: handoff
status: draft
version: '0.5.0'
created: '2026-11-08'
updated: '2026-11-09'
owner: apps-engineering
---

# Handoff — dashboard / ECharts refinements

## Контекст

Codex closeout + honest H/V schedule focus evidence. Auto-only; **без commit/push**. Чужие dirty diffs не откатывались.

## План

`.cursor/plans/dashboard-summary-echarts-refinements.md`

## Evidence

`/tmp/pharma-dashboard-refinements/REPORT.md` — Playwright **EXIT 0**, `ok: true`; diamond screenshots; sticky header sync.

## Wave-3 (H-scroll / sticky / diamond)

- Y: re-apply owned `ver.scrollTop` after parse/render so smart_rendering paints the focused row.
- H: scale-wide `$task` scrollWidth + `$task.scrollLeft` / hor / publish (fixes cull of late milestones).
- Sticky: seed header from vendor X after geometry mount.
- Oracle: `.gantt_task_line[task_id]` / `.gantt_task_content` ∩ `.gantt_task` clip; visible sticky months only.

## Gates (final)

| Check | Exit |
|---|---|
| vitest (sticky, focus-scroll, echarts, tip) | 0 |
| Playwright browser-refinements | 0 |
| web tsc | 0 |
| web lint | 0 |
| web build | 0 |

## Next (optional)

- Human review of diamond screenshots under `/tmp/pharma-dashboard-refinements/`.
