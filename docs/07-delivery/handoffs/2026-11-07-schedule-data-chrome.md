---
id: DOC-HANDOFF-2026-11-07-SCHEDULE-DATA-CHROME
title: 'Handoff: schedule-data-chrome P1 remediation (open)'
type: handoff
status: draft
version: '0.2.0'
created: '2026-11-07'
updated: '2026-11-07'
owner: apps-demo
related:
  - DOC-RPT-2026-11-07-SCHEDULE-DATA-CHROME
---

# Handoff: schedule-data-chrome (P1 remediation — не закрыт)

## Мета

- **От:** P1 remediation wave (session 1c199ddd)
- **Кому:** human review / archive OpenSpec
- **Дата:** 2026-11-07
- **Статус волны:** требования переработаны и прогнаны gates/evidence; **приёмка человеком не зафиксирована** — handoff **не** называет change закрытым.

## Цель

Устранить reject Codex: per-snapshot data, no forecast→progress, links all WS, group rollup e2e, semantic fills, strict evidence.

## Сделано

- BASE topology + `schedule-work-states` overlays A–S (не 19 alias C).
- Removed `progressFromAsOf`; EQ/MS via `schedule-control-progress` authored phases.
- 21 works / 17 links across all 8 workstreams; stable EQ/MS WBS sort-by-id.
- FE `readProgress` keeps group rollup; `--schedule-fill-*` table+chart+marker.
- View toggle `title` + `data-schedule-view-toggle`.
- Strict evidence ok; inventory matrix full A–S.
- Living + change specs + UX sync (RU).

## Не сделано / ограничения

- Старый chart screenshot **не найден** — reference matching limitation; fill/end-marker = documented assumption.
- Full `api:test` architecture.boundary (dashboard/portfolio fixtures) — preexisting, не чинилось.
- `docs:build` EACCES `website/.docusaurus` — preexisting, без chmod.
- Native `window.gantt.getScale` в evidence недоступен (module scope); asserted sticky data-* abut + domWidth vs attributed width (vendor-sourced in adapter).

## Артефакты

| Path | Note |
|------|------|
| `/tmp/pharma-demo-artifacts/schedule-data-chrome-1c199ddd/` | evidence + inventory-matrix + screenshots |
| `openspec/changes/schedule-data-chrome/` | validate OK |
| `docs/07-delivery/reports/2026-11-07-schedule-data-chrome-inventory.md` | matrix |

## Gates (this wave)

| Gate | Exit |
|------|------|
| web:test 388 | 0 |
| web/api typecheck | 0 |
| api schedule (+integrity) 37 | 0 |
| openspec validate schedule-data-chrome | 0 |
| docs frontmatter touched | 0 |
| browser evidence | 0 |
| api:test full | 1 preexisting architecture |
| docs:build | 1 EACCES |

## Рекомендации

1. Human visual accept expanded/collapsed screenshots.
2. Optional: expose getScale probe on host for stricter vendor cell equality in browser.
3. Archive OpenSpec только после явного human OK.
