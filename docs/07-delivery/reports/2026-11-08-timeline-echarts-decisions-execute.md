---
id: DOC-RPT-2026-11-08-TIMELINE-ECHARTS-DECISIONS
title: 'Execute report: ECharts densify + decisions register (+ Codex fix waves)'
type: delivery
status: draft
version: '0.3.0'
created: '2026-11-08'
updated: '2026-11-08'
owner: apps-engineering
---

# Execute report (v0.3 — label collision + chart evidence)

## Label collision fix

- Series `labelLayout: { hideOverlap: true, moveOverlap: 'shiftY' }`
- `selectLaneAwareMilestoneLabelIds` — per-program densify (max 3 wide / 2 narrow), Red kept, overview preferred
- PS date legend (`План запуска` / `Прогноз` / `Δ`) retained outside canvas

## Chart evidence (after scrollIntoView)

| File | Content |
|------|---------|
| `/tmp/pharma-timeline-echarts-decisions/echarts-C-desktop-chart.png` | chart element, desktop |
| `…/echarts-C-desktop-full.png` | full page |
| `…/echarts-C-overview-chart.png` | overview filter chart |
| `…/echarts-C-narrow-chart.png` | narrow chart (not page top chrome only) |
| `…/label-evidence.json` | caption `128px`, PS legend, narrow attr |

Playwright: `VISUAL:0` (`label-evidence-run.log`). Caption attribute: `calc(128px + (100% - 138px) * 0.459…)`.

## Related checks

| Check | Exit | Proof |
|-------|------|-------|
| vitest echarts + labels + caption | **0** (14) | `/tmp/.../vitest-labels.log` |
| `apps/web` `npm run typecheck` | **0** | `/tmp/.../web-typecheck-labels.log` |
| eslint own echarts+labels files | **0** | `/tmp/.../own-eslint-labels.log` |
| eslint own prior set (decisions/filters/…) | **0** | `/tmp/.../own-eslint.log` |
| markdownlint own report/handoff/plan | **0** (3 files) | `/tmp/.../own-docs-lint.log` |

Repo-wide `next lint` / `lint:docs` were previously **1** on unrelated paths; this wave re-proved **own** paths only (commands above).
