# Change: schedule virt + baseline-only + Участники/tables/dashboard

## Why

Schedule scroll stayed on full-content host (688×32) after hotpath; p95 rAF gap and input blocking failed acceptance. Baseline-only lacked summary rollup by mode and visible EQ/КТ markers (CSS only covered `ppc-role-forecast`).

## What changes

- **Required virtualization:** one Y scroll owner; React table window + spacers; DHTMLX `smart_rendering=true` in bounded sticky chart viewport; programmatic `scrollTo` from owner; full parse model (688/679); parse-on-scroll/hover = 0.
- **Overlays:** refresh on scroll (not only `onGanttRender`); viewport-local band under smart_rendering; baseline-only clears comparison ghosts; forecast/actual visible-window ghosts only; no double ver spacer (Ymax ≈ N×32−viewport).
- **Resize fit:** `ResizeObserver` on `.ppc-gantt-viewport` (not fixed-height host); idempotent host box + owned Y restore so end KT diamond stays inside clip after 1440↔1920.
- Comparison default `baseline`; summary/horizon/markers follow mode; `ppc-role-baseline` primary CSS; missing baseline honest (unscheduled, no fake link anchors).
- Участники; Register raised tables; no decorative left gray; dashboard Link + full RAG.

## Impact

- Specs: `schedule-workspace` (virt + baseline)
- ADR-0004 addendum (supersedes full-height host for N≈688)
- FE only; API unchanged
