---
id: DOC-HANDOFF-2026-11-08-SCHEDULE-REFERENCE-FINAL
title: 'Handoff: schedule reference style + scroll gutter (open)'
type: handoff
status: draft
version: '0.3.0'
created: '2026-11-08'
updated: '2026-11-08'
owner: apps-demo
related:
  - DOC-HANDOFF-2026-11-07-SCHEDULE-DATA-CHROME
---

# Handoff: schedule reference-final

## Мета

- **Session:** `1c199ddd-bdae-4ab6-b70e-7c5d28b6626a`
- **Дата:** 2026-11-08
- **Статус:** remediation wave (hover rail + H-scroll + evidence); `status: draft`

## Исправлено в этой доработке

1. **Table hover** — sticky `data-schedule-row-left` брал `surface-raised` поверх row hover. Теперь тот же `--schedule-row-hover` + `data-schedule-row-left-hover`.
2. **Chart hover** — `resolveGanttHoverPresentationId` (bar/summary/milestone `task_id` + Y→row для links). Hover не сбрасывается на полосе.
3. **H-scroll** — `scroll_size` снова 15 для native H track; ver gutter width 0 + timeline fill. Narrow chart: `horMax>0`, `horH=15`, `bottomDelta≈0`, nestedMax=0.
4. Default split table `min(40rem, 40%)` (~635px@1920); финальные скрины Y=0, без divider-focus helper.

## Evidence

`/tmp/pharma-demo-artifacts/schedule-reference-final-1c199ddd/evidence.json` — `ok: true`
Screens: `schedule-c-expanded-1920.png`, `schedule-c-hover-table-1920.png`, `schedule-c-hover-chart-1920.png`, `schedule-c-hover-table-y600-1920.png`, `schedule-c-expanded-1440.png`, `schedule-{a,s}-expanded-1920.png`

## Gates

- `npm --prefix apps/web run test:unit` → 392/392
- `npm --prefix apps/web run typecheck` → 0
- `openspec validate schedule-data-chrome` → OK
- docs frontmatter OK

## Ограничения (честно)

- Headed classic scrollbar **drag** не прогонялся; H доказан через `scrollLeft` + wheel Y + `horMax`/`horH`/`bottomDelta`.
- Полная 19-snapshot BE matrix этой волной не пересобиралась (BE не трогали; API smoke A/C/S 133 в prior wave).
- `enforceFitChrome` по-прежнему ставит inline width после render — scale boundaries проверены narrow→mid→wide; риск clip last month не воспроизведён на 1440/1920 evidence.
