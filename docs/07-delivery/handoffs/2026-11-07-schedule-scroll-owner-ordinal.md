---
id: DOC-HANDOFF-2026-11-07-SCHEDULE-SCROLL-OWNER
title: 'Handoff: schedule scroll owner, №, progress, toolbar'
type: handoff
status: draft
version: '0.5.1'
created: '2026-11-07'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-UX-005
  - DOC-ADR-0004
---

## Мета

- **От:** Cursor executor (session `1c199ddd-bdae-4ab6-b70e-7c5d28b6626a`)
- **Кому:** Codex coordinator / reviewer
- **Дата:** 2026-11-07
- **Область:** `apps/web` schedule (не трогать параллельный form-login)

## Сделано

- Единый `[data-schedule-scroll-owner]`; wheel forward (table+chart+sticky).
- Chart sticky scale: vendor `posFromDate`/`dateFromPos`; **без** stretch `scrollWidth`.
- H owner: `.gantt_hor_scroll` + sticky `.scrollHor_cell`; `.gantt_task` `overflow-x:hidden` для vendor pan.
- Browser login через DX files на `http://localhost:3080`.

## Gates

| Command | Exit |
|---------|------|
| `npm run web:test` | **0** — 373 passed |
| `npm run typecheck:web` | **0** |

## Browser evidence

`/tmp/pharma-demo-artifacts/schedule-scroll-owner-1c199ddd/evidence.json`

- **ok: true**, **stepsOk: true**, **errors: []**, **productErrors: []**, **harnessErrors: []**, **blockers: []**
- wheel / H-scroll / mode-hop / screenshots — all steps ok
- screenshots: `schedule-c-split-1440x900.png`, `y600-sticky.png`, `1920x1080.png`

### pageerror proof (не продукт)

Путь: `/tmp/pharma-demo-artifacts/schedule-scroll-owner-1c199ddd/pageerror-proof.json`

**Причина 6×** `TypeError: Cannot read properties of null (reading 'appendChild')` в предыдущем evidence:

- Playwright `addInitScript` делал `document.documentElement.appendChild(style)` при `documentElement === null` (`readyState: loading`).
- То же на iframe `about:blank`, который vendor `Zr()` (`gantt_container_resize_watcher`) создаёт в `gantt.init` → stack выглядел как `Zr` / `DhtmlxGanttAdapter.useEffect`, но throw был в **harness initScript**, не в adapter overlays.

**A/B:** unsafe initScript → pageerror>0; без initScript / `page.addStyleTag` после DOM ready → **0**.

**Исправление:** только harness (`addStyleTag` после load). Product code **не менялся**.

**ok semantics:** `ok = stepsOk && blockers=[] && productErrors=[]` (`errors` = product/unknown only).

### Tool limits (не дефекты продукта)

1. headless `sbw=0` → PageDown fallback
2. Playwright `mouse.wheel` без ctrlKey → `WheelEvent.ctrlKey`

## Не трогали

`apps/api/src/auth/**`, login pages, ADR-0007, form-login OpenSpec; schedule adapter/CSS в этом проходе pageerror **не** правились.

## Human-only

- Thumb-drag scrollbar в headed Chromium
- Commit/push по запросу
