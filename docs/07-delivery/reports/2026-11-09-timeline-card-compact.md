---
id: DOC-DEL-R-TL-COMPACT-2026-11-09
title: Отчёт — уплотнение chrome «Вехи портфеля»
type: report
status: draft
version: 0.2.0
created: '2026-11-09'
updated: '2026-11-09'
owner: docs-engineering
related:
  - DOC-UX-022
---
# Отчёт — compact timeline card chrome

> **certainty:** assumption — результат Auto; не human-approved.

## Изменения

- Header: title слева; «Показано X/Y» + 2 select справа (`max-w-[8rem]`, `aria-label`, без visible «Объём»/«Программа»).
- Удалены `/schedule` links из карточки (filled + empty). Sidebar / tooltip «Перейти» сохранены.
- Meta-ряд: phase слева + PS legend справа (один mount; legend убран из ECharts DOM).
- Caption: runtime bottom-align через `convertToPixel` (Δ≤2px на 03 desktop; 19 Δ=1).
- `gridBottom` 48→28 (`TIMELINE_GRID_BOTTOM_PX`); host 8 lanes 384→364 (−20).

## Geometry / browser

| Viewport | Δ bottoms | gridBottom | hostH | cardH |
|----------|----------:|-----------:|------:|------:|
| wide 2048 | 0 | 28 | 364 | 466 |
| 1440 | 0 | 28 | 364 | 466 |
| 768 | 0 | 28 | 364 | 486 |
| 390 | 0 | 28 | 364 | 562 |
| 19@1440 | 1 | 28 | 240 | 342 |

Filters: all `189/189`, overview `12/189`, program PRG-CON `21/189`.

## Gates

| Gate | Exit |
|------|------|
| vitest scoped (view/host/echarts/caption) | 0 (35) |
| web tsc | 0 |
| eslint touched | 0 |
| web next build | 0 |
| docs fm | 0 |
| lint:docs | 0 |

## Post-review regressions (исправлено той же волной)

1. **390 caption × forecast X-overlap** — `resolveTopCaptionLayout` (end-align caption + multiline forecast width 72) + runtime horizontal collision shrink; bottoms остаются совмещены (Δ=0). Evidence 390: caption `[145,218]`, forecast `[235,307]`, `liveXOverlap=false`.
2. **Meta legend Δ clip** — `ExecutiveTimelinePsLegend` `min-w-0`/`max-w-full`/wrap; span boundingRect vs card clip на 390/768 (не `document.scrollWidth`). Δ полностью видна.
3. **`?program=` PS legend** — meta/legend вне `showUniverseControls`; host test `PRG-CON`; browser `?program=PRG-CON` → legend + краткий phase, toolbar скрыт.
4. **Tooltip** — реальный hover → enterable «Перейти» (`hasGoto`+`entered`), не mount-host fake.
5. Optional: select-pair same row на 390 (`selectPairSameRow=true`).

SnapshotId numeric `01`–`19` не менялись.

## Gates (regression wave)

| Gate | Exit |
|------|------|
| vitest layout/host/echarts | 0 (18) |
| web tsc | 0 |
| eslint | 0 |
| web next build | 0 |
| markdownlint demo-v1-dashboard | 0 |
| Playwright `browser-fix.json` | 0 (`ok:true`, blockers `[]`) |

## Independent blockers (не эта волна)

- `dashboard-u1` program `compact-rag` — чужой WIP (fail вне scoped layout suite).
- API membership / gantt МАЙ / docs handoff broken link — прежние.
- Клик «Строительство» в матрице ведёт на `/programs/PRG-CON` (не `?program=`); legend под query покрыт отдельно.

## Evidence

`/tmp/pharma-timeline-compact/` — `browser-fix.json`, `fix-summary.json`, `fix-03-*.png`, `after-03-390.png` / `after-03-wide.png`, `fix-03-program-PRG-CON.png`, gate logs.
