---
id: DOC-HANDOFF-2026-11-09-GANTT-REGRESSIONS
title: 'Handoff: pharma-gantt-regressions (topX / bracket / selection / name240)'
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: auto-agent
related:
  - DOC-UX-005
---

# Handoff: pharma-gantt-regressions

## Мета

- **От:** Auto (Cursor agent)
- **Кому:** human / Codex review
- **Дата:** 2026-11-09
- **Артефакты:** `/tmp/pharma-demo-artifacts/pharma-gantt-regressions-1c199ddd/`
- **No commit/push**; чужие dirty сохранены

## Сделано (4 пункта)

1. **Top H-scroll** — chrome зеркала `[data-schedule-chart-header-hscroll]` скрыт (`scrollbar-width: none`); sync `scrollLeft` с bottom `.gantt_hor_scroll` сохранён. Ver Y не `display:none`.
2. **Bracket** — envelope 10px, rail 3px, ends `--dhx-gantt-scheduled-summary-bracket-size: 10px`; stubs hide + promote width без изменений.
3. **Selection** — `.ppc-schedule-row-selected` (+ sticky lead) = `var(--selected)`; `aria-selected`; `applyScheduleRowSelected` на chart rows; hover не сбрасывает selection.
4. **Name** — `SCHEDULE_COL_NAME_PX` 160→**240**; header/body shared geometry; split 50/50 не расширяется.

## Proof

Browser 1440/1920/768, снимок F (06) asOf **20.04.2027** + C/S: `FINAL.json` ok. Unit 37 pass · tsc 0 · eslint 0 · arch OK.

## Не сделано

Commit/push · BE · zoom/anchor/popover/API.
