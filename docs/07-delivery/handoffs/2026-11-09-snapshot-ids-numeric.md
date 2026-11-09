---
id: DOC-DEL-H-SNAP-NUM-2026-11-09
title: Handoff — SnapshotId numeric 01…19
type: handoff
status: draft
version: 0.1.0
created: '2026-11-09'
updated: '2026-11-09'
owner: docs-engineering
related:
  - DOC-DEL-R-SNAP-NUM-2026-11-09
  - DOC-GUIDE-001
---
# Handoff — SnapshotId `01`…`19`

## Context

Пользователь: полная замена буквенных SnapshotId A–S на канон `'01'…'19'` без dual API. Session: reset legacy → `01`, без letter map.

## Done

- GUIDE DOC-GUIDE-001 v0.4.0 numeric-only
- API/FE types, parse, session, meta, phases, fixtures keys, catalogs `first` / `effectiveFromSnapshot`, NTF ids `NTF-03-001` style
- Living OpenSpec + current docs sync (historical reports не переписаны)
- Semantics 19/19 vs baseline
- Playwright `:3080` all 19 + letter 400 + GUIDE
- Plan: `.cursor/plans/snapshot-ids-numeric.md`
- Report: `docs/07-delivery/reports/2026-11-09-snapshot-ids-numeric.md`

## Evidence

`/tmp/pharma-snapshots-numeric/`

## Open / blockers (после Codex review-fix)

- **Исправлено remapper:** `visible-rows` group ids `S`/`G`/`A`/`B`; living/current letter residuals; GUIDE intro; `snapshotDisplayLabel` identity. Report v0.2.0.
- **Независимые blockers:** ровно **3** FAIL `gantt-month-scale-geometry.test.ts` (МАЙ≠май; test file 0 diff vs HEAD); API `membership bridge` + lint unsafe-any — **чужой WIP** (нет в HEAD); E4/E5 5s suite timeouts (pass при 20s).
- Нет commit/push (по запрету).

## Next

- Codex/human: чужой WIP gantt casing / dashboard membership; commit when requested.
