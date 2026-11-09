---
id: DOC-HANDOFF-2026-11-09-TIMELINE-PORTFOLIO-LANE
title: 'Handoff: timeline portfolio lane gray + bold'
type: handoff
status: draft
version: '0.4.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: docs-engineering
---

## Мета

- **От:** Cursor executor (Auto only); gantt PID 673184 plan-only — no overlap
- **Follow-up artifacts:** `/tmp/pharma-portfolio-row-followup/`
- **UX note:** `docs/05-ux-ui/demo-v1-dashboard.md` § «Ряд Портфель»

## Certainty

> **certainty:** assumption — presentation only; not approved fact.

## Follow-up (v0.4)

1. Label `none` → **«Портфель»** (axis/filter/tooltip via `timelineProgramLabel`)
2. Dropdown order = chart visual top→bottom via `timelineProgramVisualTopDownIds` (source `TIMELINE_PROGRAM_ORDER` untouched)
3. Gray `splitArea` only when `programFilter === 'all'`; explicit `none` filter → no wash, bold kept; forecast x-window preserved

## Gates

| Gate | Exit |
|---|---|
| vitest labels + echarts | **0** (13) |
| tsc | **0** |
| eslint affected | **0** |
| browser K/11 1440+1920 | **0** (`summary.json` ok) |
| `:3080` | 200 |

## Browser evidence (K)

- Dropdown: Все программы → Портфель → … → Проектирование…
- All mode: canvas sunken paint + bold
- Portfolio filter: `band=absent`, paintedSunken=false, shown 33/189, bold stays
- Restore all: paint returns

## Screenshots

- `/tmp/pharma-portfolio-row-followup/desktop-1440-all-programs.png`
- `/tmp/pharma-portfolio-row-followup/desktop-1440-all-crop.png`
- `/tmp/pharma-portfolio-row-followup/desktop-1440-portfolio-filter.png`
- `/tmp/pharma-portfolio-row-followup/desktop-1440-portfolio-filter-crop.png`
- `/tmp/pharma-portfolio-row-followup/desktop-1440-dropdown.png`
- (+ 1920 counterparts)

## Remaining

No commit/push.
