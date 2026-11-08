---
id: DOC-HANDOFF-2026-11-08-REALISTIC-SIM
title: 'Handoff: realistic master-schedule r4b (edge audit + UI)'
type: handoff
status: draft
version: 0.5.0
created: '2026-11-08'
updated: '2026-11-08'
owner: demo-engineering
---

# Handoff: realistic simulation r4b

## Главное (delta vs 0.4)

1. **Edge audit r4b** — imported source `cross_project_predecessor` (`LNK-X-####`, 131/snap) проверяются как **FS** на baseline/forecast/actual (как `buildAnalystFsEdges`). Curated demo cross (`LNK-X-PWR-HVAC`, `LNK-X-PANEL-CLN`) — **topology-only skip** с reason, **не** в `temporalEdgesChecked`.
2. **UI ProgramDetail** — убрана фраза «Сумма по WS bridge без double-count»; оставлено «Резерв портфеля не входит в бюджет программы». Техника — в OpenSpec design.
3. Даты объектов **не** менялись → browser пруфы r3/r4 без точечного обновления.

## r4-edge-audit.json (phase r4b)

| Metric | Value |
|---|---|
| snaps × links | 19 × 679 = **12901** link evaluations |
| `temporalEdgesChecked` | **12863** (= scheduling 10374 + imported cross 2489) |
| `topologyOnlySkipped` | **38** (= 19×2 curated demo) |
| `topologySkipReasons.curated_demo_cross_no_planning_type` | **38** |
| `edgesSkippedGroup` / unresolved | **0** / **0** |
| `kindCounts` | scheduling **10374**, cross_project_predecessor **2527** (=19×133) |
| `violationCount` | **0** (dating already satisfied FS for imported ⇢) |

Strict split: temporal = planning contract; topology = documented non-temporal skip. Sum: 12863+38=12901.

## Gates (точные exit)

| Command | Exit |
|---|---|
| `jest …schedule-master-simulation.spec.ts -t r4` | **0** |
| `check:ids` | **0** (188 ids / 188 files) |
| `check:certainty` | **0** (10 seed files) |
| `check:cross-ref` | **0** (211 entries) |
| `lint:links` | **0** (630 links / 197 files) |

Не перезапускались полный api/web suite / coverage — код dating не менялся; затронуты audit assertion + одна UI-строка. Pre-existing `lint:docs` MD037/MD001 вне scope — не чинились.

## Limits

OpenSpec draft; no commit/push; auth/deploy dirty untouched. Artifacts: `/tmp/pharma-demo-artifacts/pharma-realistic-simulation-programs-1c199ddd/r4-edge-audit.json`.
