---
id: DOC-HANDOFF-2026-11-09-TL-COMPACT
title: Handoff — timeline card compact chrome
type: handoff
status: draft
version: 0.2.0
created: '2026-11-09'
updated: '2026-11-09'
owner: docs-engineering
related:
  - DOC-DEL-R-TL-COMPACT-2026-11-09
---
# Handoff — timeline card compact

> **certainty:** assumption

## Done

Compact chrome + post-review regressions (390 caption/forecast X, legend wrap/clip, `?program=` PS legend, real tooltip «Перейти»). Report: [2026-11-09-timeline-card-compact.md](../reports/2026-11-09-timeline-card-compact.md). Evidence `/tmp/pharma-timeline-compact/browser-fix.json` (`ok:true`).

## Not done / out of scope

Foreign WIP tests not fixed. No commit/push. Program-matrix row still routes to `/programs/:id` (query-scope legend verified via `?program=`).

## Next

Human visual check of `fix-03-390.png` / wide / program; optional commit when requested.
