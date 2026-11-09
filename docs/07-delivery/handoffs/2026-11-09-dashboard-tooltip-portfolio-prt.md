---
id: DOC-HO-2026-11-09-TOOLTIP-PORTFOLIO-PRT
title: 'Handoff: timeline tooltip + portfolio PRT-01'
type: handoff
status: draft
version: '1.0.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: apps-engineering
---

# Handoff — tooltip / captions / PRT-01

## Контекст

User + Codex-accepted plan `.cursor/plans/dashboard-tooltip-portfolio-prt.md`. Auto-only; no commit/push; foreign WIP preserved.

## Итог

Done + review-fix wave. Full report: `/tmp/pharma-tooltip-portfolio-prt/REPORT.md`.

## Scope delivered

1. Caption gaps: shared geometry `GAP=20`, `BLOCK=28`, `GRID_TOP=48`, snapshot `top=2` (not `-12`); forecast `distance=GAP`; equal measured bottom→mark gaps (~21/20).
2. Forecast label: `align=right` near edge, `overflow:none`, series `clip:false` — full «Прогноз … (+21 день)» fits card.
3. Tooltip: one bold full API name; StatusPill HTML; outline «Перейти».
4. Portfolio **`PRT-01`** via explicit `DEMO_PORTFOLIO_ID` only (no `DEMO_PROJECT_ID` alias); API path/field names unchanged.
5. ADR-0006 superseding note (doc `status` still `draft`).

## Evidence

`/tmp/pharma-tooltip-portfolio-prt/` — `timeline-card-*.png`, `gap-forecast-report.json`, API/docs gate logs.
