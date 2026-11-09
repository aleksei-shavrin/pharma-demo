# Plan: timeline tooltip + portfolio PRT-01

Accepted by Codex with refinements (2026-11-09). Auto-only; no commit/push; preserve foreign WIP.

## Scope

1. Raise forecast + «Дата снимка» captions (~10px / shared gap); desktop+narrow no clip.
2. Tooltip: one bold full API name; wrap; no short+full duplicate; escape HTML.
3. Status: shared StatusPill presentation → React + ECharts HTML; outline «Перейти»; enterable.
4. Portfolio container id `PRT-01` on active code/data/API/docs; `AN-*`/`PRG-*` unchanged; no PRJ alias.

## Non-goals

- Rewrite historical audit/handoff as if PRJ-01 never existed.
- Blind global replace of every PRJ string.
- react-dom/server in browser bundle.
- Rename API path `/projects/{id}` or field name `projectId` this wave.

## Evidence

`/tmp/pharma-tooltip-portfolio-prt/`

## Refs

- ADR-0006 superseding note (user decision; draft doc status unchanged)
- UX: `docs/05-ux-ui/demo-v1-dashboard.md`
