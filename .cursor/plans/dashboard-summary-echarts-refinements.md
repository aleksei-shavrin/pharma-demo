# План: dashboard summary + ECharts refinements (принято Codex)

Accepted 2026-11-08 with Codex review notes. No commit/push in execute wave unless asked.

## Scope (6)

1. Summary col2 title → «Запуск производства» (Test First fail→pass; commands in report).
2. Cost EAC/VAC/BAC/Резерв — visible hover+keyboard tip (not title-only; touch/click toggle OK). Full RU; EN may supplement. No accessible-only fake tip.
3. ECharts enterable tooltip + escaped HTML + `/schedule?focus=milestone:ID` via `URLSearchParams`; existing selectionKey + Gantt scroll owner; snapshot session preserved on `<a>` reload; invalid focus safe fallback; no re-center every render; expand/virtualization reveal; PS endpoints link to MS-PS. Enterable/hideDelay verified by mouse enter tooltip + click.
4. Snapshot caption near as-of: PS legend before caption; caption overlay at plot top; shared domain+insets (not just shorter h-8).
5. Unified padded plot domain covering **all** drawn dates (horizon, ordinary, PS baseline/forecast, asOf, execution divider, month ticks). Pad both sides after real min/max — not +2% of old horizon when data extends past. Caption ratio uses same domain. API horizon semantics unchanged.
6. Red `effectScatter` pulse + `prefers-reduced-motion` → static scatter; EffectScatter registered; Red points not duplicated in green+red series; matchMedia cleanup.

## Evidence

`/tmp/pharma-dashboard-refinements/` — unit fail→pass, gates, Playwright screenshots (full card / schedule), browser log.
