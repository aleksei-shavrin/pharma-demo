---
id: DOC-HANDOFF-2026-11-08-DASHBOARD-PAGES
title: 'Handoff: dashboard/pages consistency r6+r7 (ALAP, 189, residual gates)'
type: handoff
status: draft
version: 0.4.0
created: '2026-11-08'
updated: '2026-11-08'
owner: demo-engineering
certainty_note: 'Dating numbers are demo assumptions from synthetic workDays + ALAP; not source-MD calendar facts.'
---

# Handoff: dashboard-pages-consistency (r6 + r7 + r8 audit)

## Dating (P1) — ALAP, no floors proof

- Method: **backward/latest-start CPM** from PS gate `2027-09-15` (`alap_from_gate`).
- `floorsUsed: false` — project window.start/end are **soft** (later-only when float allows), not hard floors / global slide.
- Critical path (ASAP unconstrained for duration proof): **pathLen=74**, **criticalPathDurationDays=376** (sum of synthetic leaf `workDays`).
- `earliestNecessaryStart=2026-09-04` → span to gate 376d. Preproject before Feb UI label is a **demo consequence of synthetic durations**, not a domain proof that February is impossible.
- Feb `2027-02-01` remains UI construction-gate label only.
- UI copy: «Предпроект: … Основное исполнение: …» (no lecture about source dependencies).
- Artifact (local scratch, not in repo): `r6-dating-feasibility.json` under agent artifacts for that wave.

## 189 strip (P1)

- Default universe **189**; program rows with collision lanes + min hit area; horizontal/vertical scroll.
- Overview is an explicit **named filter** («Фильтр: обзор ключевых (12)»), not the same ID scope as 189.
- Program `<select>` uses RU names, not bare `PRG-*`.
- KT membership → `programId` via WBS→AN→PRG (was dumping 177 pts into `none`).
- Browser 1440/1920: **0 in-row overlaps** after mapping; A/C/S chips switched via AppBar (URL `?snapshot=` is not session owner).

## Loading / race (P1)

- `useSnapshotResource`: `resourceKey` gates ready data — active change → immediate loading, no stale snap payload (tests: race/late/retry).
- Skeletons: `PageListLoading`, `RegisterLoading`, `EntityDetailLoading`, dashboard `app/page`.
- Browser delayed `/programs` fetch: `aria-busy` + `.animate-pulse` observed.

## Project detail (P2)

- Summary attention counts + composition; milestones/EQ/issues/risks/decisions as shared tables.
- Risks/decisions membership: milestone/`equipment` primary project rules (no invent).
- Budget: honest «не выделен» at project level (allocation is program-level).

## Filters / browser (P2)

On snapshot **C** (via selector):

| Deep-link | Rows | Summary |
|---|---|---|
| `issues-risks?type=Issue&issueStatus=active` | 2 | Open 2 / Mitigating 0 |
| `issues-risks?type=Risk&rag=Red` | 1 | Red risks 1 |
| `equipment?status=Delayed` | 2 | Delayed 2 (r6 goto; see r7 for `critical=1`) |

Back/forward preserved filter URLs. Toolbars show real counts.

## r7 residual gates (executed)

1. **API typecheck FakeDataSource** — `ScheduleImportedCheckpointFixture` fully typed (no `any`); `npm run typecheck` **exit 0**; `dashboard.service.spec` **7/7**.
2. **FE per-file manifest** — `r7-fe-manifest.json`: **92 files / 0 missing / 0 failed / 452 tests**. Root cause of sole OOM: vitest `useSearchParams` returned new object each render → register `useEffect([searchParams])` loop. Fix: stable mock + `searchKey` deps on equipment/issues-risks/milestones pages. Added `page-list-states.test.tsx`.
3. **Browser attention clicks** (`tools/r7-browser-attention.mjs`, snap C): actual Link clicks — issues 2=2, risks 1=1, equipment **`critical=1&status=Delayed`** 2=2, milestones Red **3=3** (catalog-only attention predicate excludes `KT-*`). `r7-browser-attention.json` **ok:true**.
4. **Copy** — strip: «Всего {N} вех» (no ID-stability sentence); project: «Состав проекта» / «Отдельный бюджет проекта не выделен.»
5. **Coverage (scoped new surfaces)** — `useSnapshotResource` stmts/lines **84.9** branch **82.35**; `page-list-states` **100**; `management-attention` **100**. FE typecheck **0**; FE architecture **0**; API architecture **0**.

### Docs — not green

`npm run docs:build` remains **exit 1** (pre-existing broken MD links). **Not** claimed all-green.

## Gates (exact)

| Check | Exit | Notes |
|---|---|---|
| API typecheck (r7) | **0** | FakeDataSource typed fixture |
| API dashboard.service.spec | **0** | 7 tests |
| API architecture jest | **0** | 4 tests |
| FE manifest per-file | **0** | 92 / 0 missing / 0 failed / 452 tests |
| FE typecheck | **0** | |
| FE `check:architecture` | **0** | |
| Browser attention clicks | **0** | `r7-browser-attention.json` ok |
| `npm run docs:build` | **1** | Pre-existing broken links — docs not green |

Auth/deploy dirty files preserved. **No commit/push.**

## Artifacts

Directory: `/tmp/pharma-demo-artifacts/pharma-dashboard-pages-consistency-1c199ddd/`

- r6: `r6-dating-feasibility.json`, `r6-browser-acceptance.json`, `r6-gates.json`, screenshots
- r7: `r7-gates.json`, `r7-fe-manifest.json`, `r7-fe-manifest.log`, `r7-browser-attention.json`, `r7-api-typecheck.log`, `r7-fe-typecheck.log`, `r7-fe-coverage.log`, `coverage-r7/`

## Auth for browser (authorized)

Absolute paths only: `.env.dev-auth` (`LOGIN_USERNAME`) + `.dev-login-password`. Values not printed.

## r8 comprehensive audit

Full audit → findings → fixes. Report: [2026-11-08-comprehensive-audit-findings.md](../reports/2026-11-08-comprehensive-audit-findings.md).
Artifacts: `/tmp/pharma-demo-artifacts/pharma-comprehensive-audit-1c199ddd/`.

### Fixed P1

1. **Program/Project summary** — `redMilestoneCount` + UI «Вехи под риском» (PRG-CON C was Red with 0/0/0 attention). Project delayed EQ count now requires `critical`.
2. **People 404** — `absent` → `EntityDetailAbsent` (not load-error + Retry); `data-page-state="absent"`.

### Audit coverage without defect

API A–S baseline/membership/catalog; attention agreement C; ALAP dates; strip 0 in-row overlaps; narrow 768 no bleed; schedule Y-sync; net abort→retry when fully aborted.

### Gates (r8)

| Check | Exit | Notes |
|---|---|---|
| API full unit | **0** | 53 suites / 306 tests |
| API typecheck | **0** | |
| API architecture | **0** | 4 |
| FE per-file manifest | **0** | 93 files / 0 missing / 0 failed / 454 tests |
| FE typecheck | **0** | |
| FE architecture | **0** | |
| Docs build | **≠0** | preexisting: broken links + `.docusaurus` EACCES on new report path — not claimed green |

No commit/push. Auth/deploy dirty preserved.

## Follow-ups (optional)

- URL `?snapshot=` sync into SnapshotProvider (today AppBar owns session).
- Docs broken-link inventory + `.docusaurus` volume permissions are pre-existing portal debt.
