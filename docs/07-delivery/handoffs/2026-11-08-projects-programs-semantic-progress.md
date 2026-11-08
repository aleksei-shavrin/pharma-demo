---
id: DOC-HANDOFF-2026-11-08-PROJECTS-PROGRAMS-SEMANTIC-PROGRESS
title: 'Handoff: projects/programs semantic progress columns'
type: handoff
status: draft
version: '0.3.0'
created: '2026-11-08'
updated: '2026-11-08'
owner: docs-engineering
related:
  - DOC-ADR-0006
---

## Мета

- **От:** Cursor executor (session `dbf0df0f-368e-4c1a-a9ff-1a2af77dc22b`)
- **Кому:** Codex coordinator / human
- **План:** `.cursor/plans/projects-programs-semantic-progress.md`
- **OpenSpec draft:** `openspec/changes/portfolio-semantic-progress/`
- **Evidence dir:** `/tmp/pharma-progress-columns/`

## Сделано (Codex review wave)

1. **Код nowrap:** `CODE_CELL_CLASS` / `CODE_TH_CLASS` — `whitespace-nowrap min-w-[5.5rem]`; `data-portfolio-code`; unit assert в `portfolio-views.test.tsx`. 768: page H-scroll = false, overflow внутри `[data-portfolio-table]` = true.
2. **Browser proof** (`browser-progress-columns.mjs` → `summary.json` **ok: true**): I/C/S через AppBar (`aria-label^="{id} —"`); AN-01 + representatives per tone / 0 / 100 / null; projects UI vs API; schedule DOM `[data-schedule-row="project_group:AN-01"]` fillTone+%; programCell в ok (bar/%/counts = sum project leaves); headers full equality; search/filter/program link smoke; console/pageerror gate (prelogin 401 only).
3. **Parity:** shared cases `tools/test-fixtures/schedule-semantics-parity-cases.json`; Nest `schedule-fill-semantics.parity.spec.ts` + FE `schedule-semantics-parity.test.ts`; portfolio I/C/S vs `ScheduleService` + `fillToneForProjectGroup`; program sum≠mean%.
4. **Gates (exits 0):** см. матрицу ниже. Source dirty сохранён; **no commit/push**; `:3080` up.

## Browser matrix (verified)

| VP | I samples/schedule/program | C AN-01 UI↔API↔schedule DOM | S AN-01 | nowrap | page H-scroll | table overflowX | console/pageerror |
|---|---|---|---|---|---|---|---|
| 1440 | ok/ok/ok | 47% danger 7/15 ↔ group danger 47% | 100% danger 15/15 | ok | n/a gate | n/a | 0/0 |
| 1920 | ok/ok/ok | same | same | ok | n/a | n/a | 0/0 |
| 768 | ok/ok/ok | same | same | ok | false | true | 0/0 |

Screenshots (final): `desktop-1440|1920|mobile-768-{projects,programs}.png`.

## Gates coverage

| Gate | Result |
|---|---|
| API jest semantics+portfolio + cov threshold ≥80 (stmts/branches/funcs/lines) | pass — stmts 96.8 / branches **80.2** / funcs 100 / lines 98.0 |
| FE vitest progress-bar + fill-tone + parity + portfolio-views | 32 pass |
| FE cov changed modules (progress-bar, fill-tone) ≥80 | stmts/lines/funcs 100; branches **96.6** |
| FE `portfolio-views.tsx` whole-file branches | ~60% preexisting (not thresholded alone); nowrap unit present |
| `tsc --noEmit` api + web | 0 |
| eslint changed FE files | 0 |
| eslint changed API files | 0 (prettier fix applied) |
| `npm run check:architecture` (FE ↛ api/mock) | OK |
| Browser summary.json | **ok: true**, exit 0 |

## Certainty

> **certainty:** assumption
>
> Nest `schedule-fill-semantics` mirrors FE warning+fill; portfolio tones from ScheduleService items. Not human-approved fact.

## Не сделано

- Living OpenSpec apply/archive; ADR approve; commit/push.
