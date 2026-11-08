---
id: DOC-HO-2026-11-08-TIMELINE-ONLY-ECHARTS
title: 'Handoff: portfolio timeline ECharts-only'
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-08'
updated: '2026-11-08'
owner: apps-engineering
---

# Handoff — timeline ECharts-only

## Context

Explicit user ask 2026-11-08: card «Вехи портфеля» keeps only Apache ECharts; remove variants 1/2, toggle, vis deps. Decisions page out of scope. No commit/push. Auto-only session.

## Done

- UX §7 + OpenSpec change `timeline-echarts-decisions-register` updated (ECharts-only).
- Host = ECharts + chrome/filters; obsolete strip/vis/PS-cluster/helpers deleted.
- `vis-timeline` / `vis-data` uninstalled; lock synced.
- Tests adapted; vitest 56 pass; web typecheck 0; eslint own paths 0.
- Playwright evidence under `/tmp/pharma-timeline-only-echarts/`.

## Verify

| Check | Exit |
|-------|------|
| vitest (7 files / 56) | 0 |
| `apps/web` typecheck | 0 |
| eslint own paths | 0 |
| npm uninstall vis-* | 0 |
| Playwright visual | 0 |
| `npm run lint:docs` (repo) | 3 baseline errors unrelated |

## Next (Codex)

- Human review of draft docs/OpenSpec; archive change when ready.
- Optional: scrub historical plan wording (non-blocking).
