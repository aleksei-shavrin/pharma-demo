---
id: DOC-RPT-2026-11-08-TIMELINE-ONLY-ECHARTS
title: 'Report: portfolio timeline ECharts-only'
type: delivery
status: draft
version: '0.2.0'
created: '2026-11-08'
updated: '2026-11-08'
owner: apps-engineering
---

# Plan (executed)

User 2026-11-08: remove timeline variants 1/2; keep Apache ECharts only; remove toggle; remove vis-timeline dep if unused; decisions page out of scope.

## Steps

1. Doc-first: dashboard UX §7 + OpenSpec change — ECharts only, no experiment toggle.
2. Host ECharts-only + shared chrome/filters (no variant state).
3. Deleted strip, vis renderer, PS-cluster UI, strip-only helpers/tests.
4. Removed `vis-timeline` / `vis-data` (npm uninstall); `transpilePackages: ["echarts"]`.
5. Dashboard tests adapted; vitest/typecheck/eslint own paths green.
6. Playwright card screenshots → `/tmp/pharma-timeline-only-echarts/`.

## Deleted code

- `executive-milestone-strip.tsx`
- `executive-timeline-vis.tsx` (+ test)
- `production-start-cluster.tsx` + lib/test
- `timeline-marker.tsx`
- `timeline-date-track-geometry.ts` (+ test)
- `timeline-marker-a11y.ts` (+ test)

## Kept shared

- `executive-timeline.ts` / ids / experiment model / labels
- universe chrome, snapshot chrome, ECharts renderer

## Residual mentions

- Historical docs/reports/plans (C09–C14, closeout) — archive only
- Host test asserts absence of `vis-timeline` button name
- `apps/web/coverage-r7/**` generated coverage HTML (not source)

## Evidence

`/tmp/pharma-timeline-only-echarts/echarts-{A,C,F}-*-card.png`, narrow/overview, `results.json`
