---
id: DOC-HANDOFF-2026-11-09-GANTT-STRAY-MARKS
title: 'Handoff: pharma-gantt-stray-marks (hide timedProjectBar stubs)'
type: handoff
status: draft
version: '0.2.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: auto-agent
related:
  - DOC-UX-005
---

# Handoff: pharma-gantt-stray-marks

## Мета

- **От:** Auto (Cursor agent)
- **Кому:** human / Codex review
- **Дата:** 2026-11-09
- **Артефакты:** `/tmp/pharma-demo-artifacts/pharma-gantt-stray-marks-1c199ddd/fix/` (+ `r2/`)
- **No commit/push**; чужие dirty сохранены

## Repro

Снимок K (asOf 20.07.2027), «Базовый план», zoom 768 (и 384), split equal. На group-строках (1.2 / 1.3 / 1.4 / project2 / 2.1) слева от summary — pink/grey обрубки у начала Aug 2026.

## Root cause

DHTMLX `timedProjectBar` под `.gantt_task_line.ppc-summary.gantt_project` рисует children:

- `.gantt_task_line_planned` — span по `start/end` (геометрия скобки)
- `.gantt_task_line_actual` — span по вырожденным `$auto_*` (часто Jul31→Aug1 ≈ 25px, color error `#E3334E` @ 0.3)

Outer product-bar без left/width (~2px shell). Это не baseline/fact/КТ series.

## Scoped fix

1. CSS hide vendor children:  
   `.ppc-gantt-host .gantt_task_line.ppc-summary.gantt_project > .gantt_task_line_planned|actual`.
2. Adapter `promoteProductSummaryBarGeometry`: outer `left/width` из `getTaskPosition(start,end)`.
3. **r2:** outer `.ppc-summary` = thin rail (2px gradient) + `::before`/`::after` dropped ends (vendor planned shape), height 10 — не filled rectangle. Content rail не используется (узел внутри hidden planned).

## Proof (fact)

| Check | Result |
|-------|--------|
| stubs planned/actual visible | **0 / 0** |
| 1.2 / 1.3 / 1.4 width | 199 / 372 / 198 (Δ0); rail+pseudos present |
| AppBar on r2 PNG | **`data-snapshot-active=K`**, aria `Снимок 11, 20.07.2027` (assert before capture) |
| forecast ghosts / progress / links | preserved |

**Честно:** `fix/after-K-*.png` (до r2) — **mislabeled** (на кадре был Снимок 16 / 10.09.2027). Канон: `fix/r2/after-K-baseline-768.png` (+384, forecast).

## Не сделано

Commit/push · dates/API/zoom/split не трогались.
