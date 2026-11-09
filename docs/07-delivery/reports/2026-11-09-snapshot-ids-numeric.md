---
id: DOC-DEL-R-SNAP-NUM-2026-11-09
title: Отчёт — канонические SnapshotId 01…19 (без букв)
type: report
status: draft
version: 0.4.0
created: '2026-11-09'
updated: '2026-11-09'
owner: docs-engineering
related:
  - DOC-GUIDE-001
  - DOC-PROD-024
---
# Отчёт — SnapshotId `01`…`19`

> **certainty:** assumption — результат прогона Auto; источник требований — явное решение пользователя. Не human-approved.

## Canon

| Поле | Значение |
|------|----------|
| SnapshotId | `'01'`…`'19'` |
| Default | `'01'` |
| Letters / `1` / `001` / `00` / `20` | API 400 |
| sessionStorage | только numeric; legacy → clear + bootstrap `01` |

## Remapper review-fix (v0.2)

Механический remap ошибочно заменил **не-snapshot** тестовые id групп в [`visible-rows.test.ts`](../../../apps/web/src/lib/schedule/visible-rows.test.ts): `stage_group` id `S`→`19`, `project_group` `G`→`07`, `A`/`B`→`01`/`02`, при этом `parentKey`/`expandedKeys` остались буквенными → падали summary dates. **Исправлено:** id/expectations восстановлены к pre-migration (`S`/`G`/`A`/`B`); warning-семантика WIP сохранена. После fix: `visible-rows` **15/15 PASS**.

Living/current docs residual (G/H, A/B/C tables, GUIDE intro tech wording) почищены. `snapshotDisplayLabel` упрощён до identity.

## Semantics

**Stale note:** pre-cleanup `semantics-compare.json` (19/19) is obsolete after residual remapper damage.

**Re-verified v0.4** — `/tmp/pharma-snapshots-numeric/semantics-compare-full.json`:

- Baseline `fixture-A…S.json`: snapshotId, asOf, project PS dates, milestones(id/name/dates/rag), decisions(id/type/due/note/owner), issues(id/status/title), risks(id/rag/title), equipment(id/status/deliveries), costs(eacRub/vacRub).
- Additionally: `topExceptions` vs HEAD `snapshot-states` (id/title/causeImpact/priority/links); notifications prefix `NTF-<NN>-*`.
- Allowed transforms only: snapshotId letter↔ordinal; `TEX|NTF-<letter>-*` first segment ↔ ordinal; domain tokens (HVAC…) unchanged.
- Result: reduced **19/19**, topExceptions **19/19**, notifications **19/19**, mismatches **0**.

## Gates (wave 2)

| Gate | Exit | Notes |
|------|------|-------|
| api `nest build` | 0 | |
| api `tsc --noEmit` | 0 | |
| api lint | **1** | 3× `@typescript-eslint/no-unsafe-assignment` в **чужом WIP** `dashboard.service.spec.ts:303–305` (не remapper) |
| api jest full | **1** | 381 pass / **1 fail**: новый тест `membership bridge…` (**нет в HEAD**, +284 строки WIP). Ошибка schedule/MS-PS isolation — не group-id remapper |
| api coverage (excl. dashboard.service.spec) | см. log | полный suite blocked тем же WIP-тестом |
| web `next build` | 0 | |
| web `tsc` / lint / `check:architecture` | 0 | |
| web vitest full | **1** | см. blockers ниже |
| docs frontmatter/ids/certainty/cross-ref/portal/lint:docs/links/docs:build | 0 | |

## Browser `:3080` (prior wave, scenarios unchanged)

`/tmp/pharma-snapshots-numeric/browser-report.json`: 19 numeric options; letter→400; omit→01; legacy→01; persist 03; GUIDE без correspondence.

## Independent baseline blockers (не SnapshotId remapper)

1. **`gantt-month-scale-geometry.test.ts` — ровно 3 FAIL** (ожидают `май 27`, runtime `МАЙ 27`). Файл теста: **0 строк diff vs HEAD** (remapper не трогал). Impl имеет параллельный WIP (`scales?` в geometry.ts). **Не чинили** — чужая задача.
2. **Full-suite 5s timeout** на E4/E5 register/schedule (2 теста): с `--testTimeout=20000` **15/15 PASS** — нагрузка suite, не remapper.
3. **API dashboard `membership bridge` + lint unsafe-any** — чужой WIP, отсутствует в `HEAD`.

## TEX ID corruption fix (v0.4 — blocking)

Residual range remap ate `C-H`/`D-H`/`F-H`/`G-H` **inside** entity ids (not snapshot ranges). Restored from HEAD originals → numeric-prefix:

| Was (broken) | HEAD | Restored |
|---|---|---|
| `TEX-03–08VAC-PS` | `TEX-C-HVAC-PS` | `TEX-03-HVAC-PS` |
| `TEX-04–08VAC-PS` | `TEX-D-HVAC-PS` | `TEX-04-HVAC-PS` |
| `TEX-04–08VAC-IQ` | `TEX-D-HVAC-IQ` | `TEX-04-HVAC-IQ` |
| `TEX-06–08VAC-PS` | `TEX-F-HVAC-PS` | `TEX-06-HVAC-PS` |
| `TEX-07–08VAC-PS` | `TEX-G-HVAC-PS` | `TEX-07-HVAC-PS` |

Same wave collateral (exact restores, no global remap): `MS-BLD-STR`, `DOC-HANDOFF-*`, `PRG-ORG`, integrity title `IDs unique` (was `09Ds`). FE fixture/test refs updated. Integrity: `topException ids follow TEX-<snapshotSeg>-…; no en-dash; unique globally`.

Browser smoke `:3080` 03/06/19 — API+`data-exception-id` show restored HVAC TEX; no en-dash ids (`browser-tex-smoke.json`).

## Residual identity (Codex wave — closed)

Codex list: **106** lines / **37** files (`/tmp/pharma-snapshots-numeric/codex-residual-candidates.txt`). Semantic pass + hotspot fixes (matrix headings/story table, lifecycle I–S, blueprints/cost stories, UX `A|B|C`, living/openchanges, schedule comments/test titles).

| Class | Count | Notes |
|-------|------:|-------|
| Current snapshot-letter identity | **0** | residual0 — product/UX/guides/ops/living/openchanges + snapshot chronology comments |
| Allowed non-snapshot | keep | GMP `C/D`·`A/B`; `VD-A/B/C`; `C-01…C-05`; observation/group ids; greenfield sha `9958582606ed…` unchanged |
| Historical / archive | out of migrate | e.g. archive `examples/tests only`; delivery handoffs/reports not rewritten for letters |
| Leftover constant align | comments/ids | `POPULATED_SCHEDULE_SNAPSHOTS` letters→`01…19` (typed `SnapshotId`); no scenario semantics change |

No GUIDE correspondence table. Source GUIDE/matrix + Playwright `:3080` bodies OK (`browser-guide-matrix.json`).

## Gates (residual cleanup)

| Gate | Exit | Notes |
|------|------|-------|
| check:frontmatter/ids/certainty/cross-ref/portal | 0 | |
| lint:docs | 0 | after table `01\|02\|03` → `01/02/03` |
| lint:links | **1** | broken link in **чужой WIP** handoff `2026-11-09-dashboard-management-cards-impl.md` → `dashboard.service.spec.ts` |
| docs:build | **1** | same broken link (Docusaurus) |
| typecheck api/web | 0 | |
| Semantics 19/19 | kept | prior `semantics-compare.json`; runtime scenarios not re-expanded |

Independent blockers from wave 2 (gantt МАЙ, E4/E5 timeout@5s, API membership WIP) — unchanged; not claimed green.

## Evidence

`/tmp/pharma-snapshots-numeric/` — `codex-residual-candidates.txt`, `residual-final-inventory.json`, `browser-guide-matrix.json`, `docs-*-residual*.log`, `api-tsc-residual.log`, `web-tsc-residual.log`.
