---
name: Projects/Programs semantic progress
overview: "Codex-accepted: /projects+/programs same schedule progress bar+% + counts column; SAME fill policy as schedule (lag/shift/asOf), not Delayed-only approx. Wait PIDs 491514+492824 then implement. Artifacts /tmp/pharma-progress-columns/."
todos:
  - id: T-WAIT
    content: Wait PIDs 491514 (1c199ddd) + 492824 (e272f632); reread targets; preserve their diffs
    status: completed
  - id: T-DOCS
    content: Doc-first draft — OpenSpec/ops/handoff; SAME fill policy + aggregation; certainty assumption
    status: completed
  - id: T-API
    content: Additive Nest progressPct/leaf counts/fillTone via canonical schedule warning+fill rules; program sum not mean
    status: completed
  - id: T-PRIMITIVE
    content: Reuse existing progress/fill helpers; one SemanticProgressBar; no duplicate color aliases
    status: completed
  - id: T-UI
    content: Approved column orders projects+programs; sticky/title; no new row sort; no page H-scroll
    status: completed
  - id: T-TEST
    content: TestFirst tone/counts/snapshots; ≥80 changed; browser I/C/S match schedule
    status: completed
  - id: T-REVIEW-NOWRAP
    content: Код/PRG nowrap+min-width; 768 table overflow only
    status: completed
  - id: T-REVIEW-BROWSER
    content: Browser I/C/S AppBar + schedule DOM tone + program ok (not C-only API%)
    status: completed
  - id: T-REVIEW-PARITY
    content: Nest↔FE schedule-fill parity harness + ScheduleService I/C/S
    status: completed
  - id: T-REVIEW-GATES
    content: Coverage≥80 changed, lint/typecheck/arch; handoff matrix
    status: completed
isProject: true
---

# Projects / Programs semantic progress

**Executor session:** `dbf0df0f-368e-4c1a-a9ff-1a2af77dc22b` (Auto only; no Task/Explore/Browser AI subagents)
**Wait gate:** PID **491514** (`1c199ddd` decisions/dashboard/portfolio-views) + PID **492824** (`e272f632` timeline/schedule). No apps/API/shared writes until both exit; then reread.
**Canonical plan:** `.cursor/plans/projects-programs-semantic-progress.md`
**Artifacts:** `/tmp/pharma-progress-columns/`
**DX:** `http://localhost:3080` — штатный `npm run dev`; no commit/push/extra stacks
**Refs:** projects text `47% · 7/15`; schedule semantic bar (AG1 red bar vs yellow status).

**Status now:** Codex review wave verified. `summary.json` **ok: true** (I/C/S × 1440/1920/768; schedule DOM + programCell). Handoff v0.3.0.

---

## Findings (code, not invented FR)

### Current /projects
- Page: [`apps/web/src/app/projects/page.tsx`](apps/web/src/app/projects/page.tsx) → [`ProjectListView`](apps/web/src/components/portfolio/portfolio-views.tsx).
- Columns today: **Код | Проект | Программа | Статус | Ответственный | Прогресс(text)**.
- Progress cell = raw `project.progressLabel` (e.g. `47% · 7/15 завершено`) — no bar.

### Current /programs
- Page: [`apps/web/src/app/programs/page.tsx`](apps/web/src/app/programs/page.tsx) → [`ProgramListView`](apps/web/src/components/portfolio/portfolio-views.tsx).
- Columns: **Код | Программа | Статус | Ответственные | Проекты** — **нет** progress.
- API [`ProgramSummary`](apps/api/src/portfolio/portfolio.service.ts) list: id/name/status/projectCount/responsibles — **без** leaf metrics.
- Program **detail** already aggregates `leafCompleted`/`leafTotal` as **sum of child project leaves** (not mean of percents) — see `getProgram` reduce + audit `docs/07-delivery/reports/2026-11-08-analyst-import-audit.md`.

### Denominator / label (existing Nest contract)
- Project metrics in `portfolio.service` `metricsForAnalystProject`:
  - **leafTotal** = works + imported/aliased checkpoints (КТ) in that analyst project WBS.
  - **leafCompleted** = subset with `status === 'Completed'`.
  - **progressPct** = `round(leafCompleted/leafTotal*100)` or empty-set label `Нет листовых работ в импорте` (not fake bar at 0% as “done”).
  - **progressLabel** = `${pct}% · ${completed}/${total} завершено` when total>0.
- Program aggregate = **sum** `leafCompleted` / **sum** `leafTotal` across child projects (same import). **Не** среднее арифметическое percent.
- Certainty: **assumption** (demo import contract); not human-approved fact / not GMP.

### Schedule progress primitive / tone
- Table UI: [`schedule-board.tsx`](apps/web/src/components/schedule/schedule-board.tsx) — track `h-1.5` + fill width `%` + tabular `%` text; tokens via `scheduleFillToken(fillTone)`.
- Fill tone resolver: [`schedule-fill-tone.ts`](apps/web/src/lib/schedule/schedule-fill-tone.ts) — **priority:** `warningTone` lag→danger, shift→warn; else work `Delayed`→danger / `Waiting`→warn; else ok. Milestone uses rag; **work fill is not % and not blind project RAG**.
- Null vs 0: schedule `progressPct === null` → «нет данных» / omit vendor 0; `0` → hollow/`ppc-progress-zero` (known zero). Groups only when rollup number known.
- Overlap: `schedule-board.tsx`, `schedule-fill-tone.ts`, gantt CSS/adapters — **dirty in 1c199ddd wave**. Do not rewrite schedule behavior; extract shared presentation **without** changing schedule semantics.

### Overlap map (preserve dirty)
| Area | Touch this wave? |
|------|------------------|
| `apps/web/src/components/schedule/**`, `lib/schedule/**` (except later optional thin adopt of shared primitive) | **Wait / preserve** while 1c199ddd active |
| `portfolio-views.tsx`, portfolio tests, pages projects/programs | **Yes** (after review) |
| `apps/api/src/portfolio/**` | **Yes** additive fields (file already dirty — merge carefully, no fixture-import “fix”) |
| Auth / other repos | No |

---

## Decisions (Codex-accepted, mandatory)

1. **Column order — projects:**
   `Код | Проект | Прогресс | Завершено | Статус | Программа | Ответственный`

2. **Column order — programs:**
   `Код | Программа | Прогресс | Завершено | Статус | Ответственные | Проекты`
   (`Проекты` = project **count**, distinct from completed/total leaf works+КТ).

3. **Header «Завершено»:** visible short label; `title`/aria = **«Завершённые работы и контрольные точки / всего»** matching Nest denominator (works+КТ Completed / leafTotal). Cell `7/15`. Wide name + readable owner kept. Bar+% one column; counts separate. 768: overflow **inside table** only; sticky/title; **no** page-level H-scroll. **No new row sorting** (column order only).

4. **Shared primitive:** reuse post-wave schedule progress track + `scheduleFillToken` / `resolveScheduleFillTone` (or successor). One presentation module; **no** second color alias set; preserve ECharts/timeline layout from e272f632.

5. **SAME fill policy as schedule for same project+snapshot (REJECTED: Delayed/Waiting-only approx):**
   Portfolio bar color MUST match schedule semantics for that object — including **actual** warning `lag`/`shift`/asOf and honest group aggregation (screenshot: red bar with yellow status). After waves, re-read canonical resolver. Nest additive `progressFillTone` (or equivalent) computed via **same** rules as schedule rows for leaves in that analyst project; program = consistent group/worst policy per existing schedule/group rules. Not %; not blind RAG; no activeRed if work completed and no actual warning. If evidence/fields missing after reread → **blocker**, not open_question-as-done.

6. **Additive API:** `progressPct: number | null`, `leafCompleted`/`leafTotal`, program **sum** of project leaves (not mean%). Null/0/100/no-leaf distinct. Types explicit in `api-client`. Tests by data, not hardcoded screenshot %.

7. **progressLabel:** keep for cards/detail; lists use bar + counts columns.

8. **Snapshot-safe** I/C/S; preserve search/filters/links/unrelated toolbar/calendar.

9. **No** DS migration; no frontend mocks; no inventing colors/percents.

---

## Doc-first (before code)

1. Draft note in ops or UX + OpenSpec change delta (portfolio list progress columns + fillTone rule) — `status: draft`, certainty markers.
2. Handoff `docs/07-delivery/handoffs/YYYY-MM-DD-projects-programs-semantic-progress.md` (draft).
3. Do **not** set approved / fact without human.
4. Reference ADR-0006 read-model; do not invent GMP/FR.

---

## Flat checklist (implementation after Codex + activewave)

- [x] **T-DOCS-01** OpenSpec/ops/UX draft: columns, denominator, fillTone rule, null/empty.
- [x] **T-DOCS-02** Handoff draft + link this plan.
- [x] **T-WAIT-01** Confirm 1c199ddd idle or only touch portfolio/progress new files; preserve schedule dirty.
- [x] **T-API-01** TestFirst: program list gains leaf metrics; empty leaves → progressPct null + no fake 0 bar; program sum ≠ mean %.
- [x] **T-API-02** TestFirst: progressFillTone Delayed/Waiting worst-of; Red status + all OnSchedule → still `ok` fill (proves not blind RAG).
- [x] **T-API-03** Implement Nest fields; keep existing detail aggregate.
- [x] **T-FE-01** SemanticProgressBar + unit (null/0/100/tones).
- [x] **T-FE-02** ProjectTable column reorder + bar + counts; update `portfolio-views.test.tsx`.
- [x] **T-FE-03** ProgramListView progress columns + types from API.
- [x] **T-FE-04** Optional: schedule-board thin adopt of shared primitive **only if** no visual/regression delta (else leave schedule as-is).
- [x] **T-QA-01** typecheck web/api; unit suites affected; coverage ≥80 on **changed** modules (AGENTS).
- [x] **T-QA-02** Browser `/tmp/pharma-progress-columns/`: 1440 / 1920 / 768; `/projects` `/programs` `/schedule` same objects; snapshots I/C/S via AppBar; assert bar %, fill color, counts, sorting/null/empty; preserve search/filters/links; no password dumps.
- [x] **T-SYNC-01** Plan todos→completed; handoff evidence; certainty assumption.

---

## Gates

- API: `portfolio.service.spec` (+ focused) exit 0; do not “fix” architecture.boundary fixture imports.
- Web: `portfolio-views` + progress primitive tests; `npm run typecheck:web` / `typecheck:api`.
- Coverage policy: ≥80 statements/branches/functions/lines on **changed** auth-style scoped measure for new modules.
- Docs: frontmatter/lint on touched drafts.

---

## Blockers / constraints

- **Active schedule wave** owns many schedule files — extracting/adopting shared primitive in schedule-board deferred until safe.
- Portfolio `portfolio.service.ts` already dirty — rebase/merge carefully; no silent overwrite.
- Portfolio fillTone uses Nest port of FE warning+fill (lag/shift + group fold); parity harness + ScheduleService I/C/S integration verified.
- Living OpenSpec apply/archive + ADR approve — human only.
- Other repos read-only; credentials unchanged; leave `:3080` up.

---

## Out of scope

- Changing schedule overdue/warning algorithms.
- Reworking StatusPill RAG.
- Auth, decisions dashboard features of 1c199ddd.
- Commit/push/live deploy.
