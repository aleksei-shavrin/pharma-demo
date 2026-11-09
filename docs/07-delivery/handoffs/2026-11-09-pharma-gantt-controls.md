---
id: DOC-HANDOFF-2026-11-09-GANTT-CONTROLS
title: 'Handoff: pharma-gantt-zoom-anchor (default 384 / center visible / group chrome)'
type: handoff
status: draft
version: '0.5.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: auto-agent
related:
  - DOC-UX-005
---

# Handoff: pharma-gantt-zoom-anchor

## Мета

- **От:** Auto (Cursor agent)
- **Кому:** human review
- **Дата:** 2026-11-09
- **Артефакты:** `/tmp/pharma-demo-artifacts/pharma-gantt-zoom-anchor-1c199ddd/`
- **No commit/push**; чужие dirty сохранены

## Принятый базис

r2–r4 controls (50/50, popover, headers, table fill, status pill, smart on, toolbar right).

## Сделано

1. **Default zoom** — `SCHEDULE_ZOOM_DEFAULT_INDEX = 3` → `min_column_width=384`.
2. **X-anchor** — [`schedule-zoom-anchor.ts`](../../../apps/web/src/lib/schedule/schedule-zoom-anchor.ts): selected visible (range∩viewport + midpoint) → nearest visible work/MS/EQ → row-date fallback on zoom only. Adapter centers via `centeredChartScrollX` after `setLevel`; Y preserved; no empty mid-canvas date; no reseed every render.
3. **Group chrome** — zoom/comparison/view: `border` + `bg surface-sunken`; buttons transparent, active blue / inactive grey; r4 `ml-auto` kept.

## Proofs (fact)

| Check | 1440 |
|-------|------|
| initial | level3 / minCol384 / smart / intersecting≥19 |
| + → 768 | `work:1.1.1` centerPxDelta **1.5px**, intersecting≥16 |
| − → 48 | bars remain intersecting |
| deep Y=5600 | ΔY0; reason `nearest-visible` when selection off-screen |
| groups | border≠0, bg≠transparent; btn border0 / bg transparent |

## Gates

tsc/eslint/arch 0 · unit 45+ · coverage branches aggregate ≥80 · browser A/C/S ok.

## Не сделано

Commit/push · human accept.
