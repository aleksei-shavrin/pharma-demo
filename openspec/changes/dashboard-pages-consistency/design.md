# Design: dashboard-pages-consistency

## Dating feasibility (fact vs assumption)

- **fact:** analyst MD / `demo-pharma-greenfield.md` SHA `9958582606ed60acfc6191f45cea7bb5be745f5021f22d6a21684fa3a3f664ef` — календарных дат нет.
- **fact (computed):** при текущих workDays + FS critical-path ≈ 400+ work-days; окно 2027-02-01→2027-09-15 = 226 calendar days — **недостаточно**. Старт «всё с февраля» ломает PS gate или требует duration 0.
- **assumption (demo scenario):** forward CPM + **one** whole-program slide to PS (fittedMin ≈ **2026-05-11** after -82d slide); phase **Предпроект** до 2027-01-31; phase **Исполнение** с 2027-02-01 (label, не доменный «факт старта стройки»).
- **constraints kept:** PS baseline 2027-09-15; C forecast 2027-10-06; S actual 2027-09-22; 564 rows / 688 items / 679 links; 19-snap temporal contracts.
- **algorithm:** forward CPM + whole-program slide to gate; **no post-slide per-leaf hard floor** (ломает FS). Feasibility audit row `phase_feasibility` recorded in sim audit.

## Milestone universe 189

`147 KT (source) + 42 catalog-only MS` (catalog 44 − 2 aliases into KT). Stable membership and baseline-date order A–S. Dashboard shows full set via lanes/scroll/program filter; overview density optional, count always visible. Snapshot change updates dates/status only.

## Deep-link filters

| Card predicate | Query |
|---|---|
| Open\|Mitigating issues | `type=Issue&issueStatus=active` |
| RAG=Red risks | `type=Risk&rag=Red` |
| critical && Delayed EQ | `critical=1&status=Delayed` |
| milestone RAG=Red | `rag=Red` |

`attention=active` не подменяет RAG.

## Loading

`loading|ready|error` on every data-driven route; skeleton≠empty; snapshot race ignore stale; filter of already-loaded data без network skeleton.

## Program cost / Project detail

Reuse existing ProgramCostSummary fields; lift visible block. Project uses shared section/table composition; no invented budgets.
