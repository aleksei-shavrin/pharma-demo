---
id: DOC-REPORT-2026-11-08-COMPREHENSIVE-AUDIT
title: 'Отчёт: comprehensive audit r8 — findings'
type: report
status: draft
version: 0.1.0
created: '2026-11-08'
updated: '2026-11-08'
owner: demo-engineering
certainty_note: 'Findings from live DX stack audit; dating ALAP assumptions unchanged. r9 review wave corrected false-green proofs.'
---

# Comprehensive audit r8/r9 — реестр findings

Артефакты: `/tmp/pharma-demo-artifacts/pharma-comprehensive-audit-1c199ddd/`
Связанный handoff: [2026-11-08-dashboard-pages-consistency.md](../handoffs/2026-11-08-dashboard-pages-consistency.md).

## r9 review wave — false greens → real proofs

| Claim (r8 / early r9) | Verdict | Evidence |
|---|---|---|
| Calendar `schedule-dom.json` snaps={} / timeout; followup yLeft=null synced=true | **не proof** Y/splitter/hover/compare | superseded by `r9-schedule-proof.json` (0 findings) |
| API `programsSample.nullBudgets=7`, projects=null, probe 404 | **false endpoints/shape** | `r9-api-invariants.json` — `/backend`, 7 PRG / 25 AN, cost 5+2 null, 189×19, 0 findings |
| RecordMissing AN-99 → «К списку программ» | **bug → fixed** | CTA `/projects`; `r9-retry-race.json` + unit |
| Status filter Green/Yellow/Red EN labels | **bug → fixed** | RU via `projectStatusLabel`, raw enum values |
| Net abort «есть Повторить» | **weak** → retry click restores + A→C→S race | `r9-retry-race.json` |
| Strip readability «accepted» without screenshot review | **unverified** | `r9-keyboard-strip.json` stripVisual |
| EntityDetailAbsent data-attr alone as UX fix | **not counted as P2 UX** | attr ok; copy already clear |

## Покрытие проверок (с пруфом)

| Проверка | Результат | Evidence |
|---|---|---|
| API typed temporal edges / membership / alias / progress / 189 | OK | `r9-api-invariants.json` |
| Schedule A/C/S Y shared-id BCR, splitter Δwidth, hover both panes, 3 modes | OK | `r9-schedule-proof.json` |
| RecordMissing project→/projects, program→/programs | OK | `r9-retry-race.json` |
| Retry restore + snap race S | OK | `r9-retry-race.json` |
| Strip 189 markers + keyboard focus/Tab; splitter ArrowRight | OK | `r9-keyboard-strip.json` |
| Strip label/marker BCR + toast density (r10) | OK collisions=0; toast≤1 | `r10-visual-proof.json` + PNG |
| Attention / ALAP / strip overlaps (r8) | OK | `api-invariants.json`, `browser-followup.json` |

## Findings

### F-P1-001 — Program/Project Red status without milestone count in summary

| Field | Value |
|---|---|
| Severity | **P1** |
| Area | program/project summary |
| Repro | `/programs/PRG-CON` snap C via AppBar |
| Expected | Сводка объясняет Red (есть красная веха MS-CLN-PANEL) |
| Actual | Красные риски/EQ/проблемы = 0; статус Red без счётчика вех |
| Root cause | `attention` без `redMilestoneCount`; UI не показывал red milestones |
| Fix | API `redMilestoneCount`; FE «Вехи под риском»; project delayed EQ только `critical` |
| Test | `portfolio.service.spec` PRG-CON C; `portfolio-views.test` summary |
| Evidence | `shots/program_PRGCON_C_audit.png` → `shots/program_PRGCON_after_fix.png` |
| Status | **fixed** |

### F-P1-002 — Person 404 shown as load error with Retry

| Field | Value |
|---|---|
| Severity | **P1** |
| Area | people detail |
| Repro | `/people/PERSON-NOPE` snap C |
| Expected | absent state like equipment/issue |
| Actual | «Не удалось загрузить…» + «Не найдено» + Повторить |
| Root cause | `people/[id]` mapped `absent` → `EntityDetailError` |
| Fix | `EntityDetailAbsent` + `data-page-state="absent"`; EntityRefType `person` |
| Test | browser reverify `reverify-fixes.json` |
| Evidence | `shots/dead_people_NOPE.png` → `shots/people_NOPE_after_fix.png` |
| Status | **fixed** |

### F-P2-001 — EntityDetailAbsent без data-page-state

| Field | Value |
|---|---|
| Severity | P2 |
| Area | entity detail a11y/test hooks |
| Repro | `/equipment/EQ-NOPE` |
| Expected | machine-readable absent state |
| Actual | clear copy, no `data-page-state` |
| Fix | `data-page-state="absent"` |
| Status | **fixed** |

### F-P1-003 — Schedule hover lit table only (chart pane silent)

| Field | Value |
|---|---|
| Severity | **P1** |
| Area | schedule hover sync |
| Repro | Playwright hover table row A/C/S; chart `[data-schedule-row-hover]` absent |
| Expected | same row id hover in table + chart |
| Actual | only table; gantt rows lack `data-schedule-row` |
| Root cause | `applyScheduleRowHover` matched only `[data-schedule-row]`; layered gantt ids for project_group/stage_group not parsed |
| Fix | match `.gantt_task_row` via `presentationIdToSelectionKey`; extend layered id parse; clear left-hover |
| Test | `schedule-row-hover.test.ts`; `to-gantt-presentation.test.ts` |
| Evidence | `r9-schedule-proof.json` hoverPanes=["table","chart"] |
| Status | **fixed** |

### F-P2-002 — RecordMissing project CTA → programs list

| Field | Value |
|---|---|
| Severity | P2 |
| Area | portfolio absent |
| Repro | `/projects/AN-99` |
| Expected | «К списку проектов» → `/projects` |
| Actual | «К списку программ» |
| Fix | `RecordMissing({kind})` on project/program routes |
| Test | `portfolio-views.test`; browser `r9-retry-race.json` |
| Status | **fixed** |

### F-P2-003 — Programs/projects status filter EN enum labels

| Field | Value |
|---|---|
| Severity | P2 |
| Area | portfolio filters |
| Repro | `/programs` status `<select>` |
| Expected | RU labels, raw Green/Yellow/Red values |
| Actual | English option text |
| Fix | `projectStatusLabel` in options |
| Test | `portfolio-views.test` |
| Status | **fixed** |

### F-P2-004 — Program row label overlaps early milestone markers

| Field | Value |
|---|---|
| Severity | P2 |
| Area | dashboard executive strip |
| Repro | Dashboard C; row «Проектирование и разрешения»; early markers |
| Expected | Program name gutter never intersects marker hitbox (1440/1920/768); 189 preserved; full `title`/`aria-label` |
| Actual | Label x≈281 overlaps markers from x≈325; aria used truncated shortLabel («Геология при») |
| Fix | Dedicated label gutter + track; accessible string = full name + date + status + program |
| Test | strip layout/a11y unit; r10 PNG |
| Evidence | `r10-visual-proof.json` collisions=0 @1440/1920/768; markers=189; full aria |
| Status | **fixed** |

### F-P1-004 — r10 gutter broke date-to-pixel (axis full-bleed vs markers in track)

| Field | Value |
|---|---|
| Severity | **P1** |
| Area | dashboard executive strip geometry |
| Repro | After r10 gutter: month axis left≈277, marker track left≈460; Sep-2026 markers under Nov labels |
| Expected | One date track: month ticks, axis, phase, asOf, markers, PS share `left:ratio%` after shared gutter |
| Actual | Axis/months still `inset-x-0` on full canvas; markers only in gutter-shifted track |
| Fix | Flex `label-column` + `data-timeline-date-track`; all temporal layers inside track |
| Test | `timeline-date-track-geometry.test.tsx`; browser BCR vs `dateToRatio` (tol≤2px) |
| Evidence | `r11-date-align-proof.json` marker/asOf/sep/phase Δ≈0 @1440/1920/768 |
| Status | **fixed** |

### F-P2-005 — Triple large toast overlay after snapshot change

| Field | Value |
|---|---|
| Severity | P2 |
| Area | AppBar notifications |
| Repro | Snapshot commit → 3 danger toasts cover right chrome ~8s |
| Expected | ≤1 compact short-lived toast; full list in bell; aria-live; no delete-all |
| Actual | MAX_TOASTS=3 large cards block status/timeline controls |
| Fix | UX delta: 1 toast; remainder in tray; shorter TTL |
| Test | `notification-bell.test`; r10 browser A→C→S/back/login |
| Evidence | `r10-visual-proof.json` afterC count=1 compact; bell_C count=5; bootstrap=0 |
| Status | **fixed** |

### Closed as false positive / not a bug

| Id | Why |
|---|---|
| UI-DEAD-SOFT EQ/ISS NOPE | Copy already «отсутствует»; audit regex missed absent |
| P1-SNAP-CHIP-STALE | Chip was `Снимок C01…`; regex `\b` false positive; body showed C red |
| P1-NET-ERROR-UI (weak inject) | Only first of parallel requests aborted; full abort shows error+retry |
| SCH-AUDIT-CRASH | Flaky listbox wait on cold schedule; follow-up passed |
| SCH-Y-ALIGN zip-index | mid/end false fail: sticky clip; shared-id BCR Δtop=0 |
| UX-RECORD-MISSING sidebar | selector hit nav «Программы»; scoped `[data-record-missing] a` OK |
| STRIP-DENSITY / strip readability | track below fold; **visual unverified** (`r9-keyboard-strip.json`) — not accepted green |

### Recommendations (not fixed — not bugs / out of fix-wave)

| Id | Note |
|---|---|
| Rec-schedule-name-truncation | Grid name column truncates by design; use splitter |
| Rec-status-color-and-word | Status pills show colour + «Жёлтый»/«Зелёный» — product convention |
| Rec-snapshot-URL-sync | AppBar owns session; `?snapshot=` not owner (known follow-up) |

### Preexisting (not repaired)

- Docs portal broken MD links / MD037 / MD001 — `docs:build` exit 1 outside this wave.
- Full `portfolio-views.tsx` branch/funcs below 80% on whole-file measure — **preexisting debt**; r9 claims only changed-module gates below.

## Open

None for P1/P2 from r9/r10 waves.

## Gates r11 (artifacts)

| Gate | Exit / metric |
|---|---|
| FE typecheck / architecture | 0 / OK |
| Date-track geometry coverage | 100 all (`coverage-r11-changed`) |
| Affected tests | **38 / 0 failed** (`r11-fe-affected-manifest.json`) |
| BCR date align | findings=0; max abs delta ≪2px (`r11-date-align-proof.json`) |
| PNG | `shots/r11-strip-C-{1440,1920,768}.png` |

## Gates r10 (artifacts)

| Gate | Exit / metric |
|---|---|
| FE typecheck / architecture | 0 / OK |
| Changed coverage | toast-host ≥80 all; a11y 100 (`coverage-r10-changed`) |
| FE manifest | **95 / 0 failed / 462 tests** (`r10-fe-manifest.json`) |
| Visual strip+toast | collisions=0; toast≤1; bell=5 (`r10-visual-proof.json`) |
| PNG | `shots/r10-strip-C-{1440,1920,768}.png` |

## Gates r9 (artifacts)

| Gate | Exit / metric |
|---|---|
| API typecheck | 0 |
| API `portfolio.service` coverage | stmts **99.58** / branch **82.6** / funcs **100** / lines **100** (`coverage-r9-api-portfolio`) |
| FE typecheck | 0 |
| FE `schedule-row-hover` coverage | stmts/lines/funcs **100** / branch **95** (`coverage-r9-hover`) |
| FE manifest | **94 files / 0 failed / 457 tests** (`r9-fe-manifest.json`) |
| Schedule proof | 0 findings (`r9-schedule-proof.json`) |
| API invariants | 0 findings (`r9-api-invariants.json`) |
| Retry/race/RecordMissing | 0 findings (`r9-retry-race.json`) |
| Keyboard/strip | 0 findings; visual unverified (`r9-keyboard-strip.json`) |
| Docs build | ≠0 preexisting (not re-run) |

No commit/push.
