---
id: DOC-HANDOFF-2026-11-08-GANTT-CLARITY
title: 'Handoff: Gantt clarity (r3 hardgate + r4 tone)'
type: handoff
status: draft
version: '0.4.0'
created: '2026-11-08'
updated: '2026-11-08'
owner: demo-engineering
related:
  - DOC-UX-SCHEDULE-001
---

# Handoff: Gantt clarity (r3 hardgate)

## Мета

- **От:** волна pharma-gantt-clarity-1c199ddd / Auto agent (Cursor исполнитель)
- **Кому:** review / следующая schedule-волна
- **Дата:** 2026-11-08
- **Область:** `apps/api` dating hardgate, `apps/web` gantt debug probe, OpenSpec/UX schedule

## Цель волны (r3)

Убрать December-terminal «limit» из r2: восстановить **terminalBaselineMax ≤ 2027-09-15**, `soft_infeasible_vs_lf = 0`, сохранив link/chain/tone UX.

## Сделано (r3 + r4)

- `alapPass`: только hard graph + gate — **без** soft `preferredStart`.
- Placement: `ES = max(hardES, min(preferredES, hardLS))`; terminalBaselineMax=`2027-09-15`, soft_infeasible=0.
- **r4 tone:** `sourceWeeks` ≠ current warning; lag только при `status===Delayed`. Completed `1.2.2` / parents → fillTone ok, bar `ppc-work-completed` green. Nest port + FE parity fixtures синхронизированы.
- FE test-only: `__ppcGanttDebug.posFromDate` / `barDatePosition` при `ppcGanttPerf=1`.
- Browser r4: свежие PNG + `data-schedule-fill-tone` для 1.2.2/1.2/AN-01/KT; C HVAC `9.3.1` fill=warn (shift).

## Honesty (приёмка proofs)

- **Не заявляем** last-visible-row = KT-25.6.3 (раньше мерили чужой id).
- **Не заявляем** independent header cell pixel anchors (`headerCount=0` в r3).
- Узкая доказанная геометрия r3: `posFromDate` mono/order + `barDatePosition` nativeVsPos=0 для известных id.

## Не сделано / вне scope

- commit/push
- чужие dirty деревья (auth/deploy/portfolio/dashboard timeline)
- идеальный PM-план без synthetic windows

## Certainty / риски

> **certainty:** assumption
>
> Календарные даты demo = `PROJECT_BASELINE_WINDOWS` + hardgate CPM; MD без дат. `planEarliestStart` ≠ critical necessary start. Aug предпроект = synthetic preferred.

## Артефакты

| Путь | Примечание |
|------|------------|
| `/tmp/pharma-demo-artifacts/pharma-gantt-clarity-1c199ddd/r3/` | hardgate FINAL-r3 |
| `/tmp/pharma-demo-artifacts/pharma-gantt-clarity-1c199ddd/r4/` | tone FINAL-r4, UI shots |
| `openspec/specs/schedule-workspace/spec.md` | hardgate requirement |
| `docs/05-ux-ui/demo-v1-schedule-workspace.md` | r3+r4 note |

## Verify

```bash
cd apps/api && npx jest src/data/fixtures/analyst/schedule-gantt-clarity.spec.ts src/data/fixtures/analyst/schedule-master-simulation.spec.ts --coverage=false
cd apps/web && npx vitest run src/lib/schedule/gantt-perf-diagnostics.test.ts src/lib/schedule/to-gantt-presentation.test.ts src/components/schedule
PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright node /tmp/pharma-demo-artifacts/pharma-gantt-clarity-1c199ddd/r3/browser-gantt-clarity-r3.mjs
```
