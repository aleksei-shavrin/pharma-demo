---
id: DOC-HANDOFF-2026-11-08-UI-SEMANTICS-LINKS-SNAPSHOTS
title: 'Handoff: UI semantics, links, snapshot ordinals'
type: handoff
status: draft
version: '0.5.0'
created: '2026-11-08'
updated: '2026-11-09'
owner: docs-engineering
---

## Мета

- **От:** Cursor executor (`dbf0df0f-368e-4c1a-a9ff-1a2af77dc22b`)
- **План:** `.cursor/plans/ui-semantics-links-snapshots.md`
- **OpenSpec draft:** `openspec/changes/ui-semantics-links-snapshots/`
- **Artifacts:** `/tmp/pharma-ui-semantics-audit/`
- **Report date:** 2026-11-09

## Certainty

> **certainty:** assumption — presentation mapping; not human-approved fact / not adoption.

## Final narrow close (2026-11-09)

| Item | Result |
|---|---|
| Type vs Суть | removed `whitespace-nowrap`; `whitespace-normal break-normal`; text fits cell; gap to Суть >0; no mid-word cut |
| Dashboard error | `snapshotDisplayLabel(active)` → «снимок 03» for C |
| `app/page.tsx` coverage | stmts/lines/funcs **100%**, branches **87.5%** (all ≥80) |
| Build | `npm run build` (`NEXT_DIST_DIR=.next-build`) **exit 0** after clean `.next-build` (first attempt ENOENT standalone copy on stale dir — not font/deps) |
| Dev | `:3080` preserved (**200** /login) |

## Gates (final)

| Gate | Exit | Evidence |
|---|---|---|
| Vitest `page.test` + decisions | **0** | `/tmp/pharma-ui-semantics-audit/vitest-final.log` |
| Coverage `app/page.tsx` | **≥80 all 4** | 100 / 87.5 / 100 / 100 |
| eslint | **0** | `lint-final.log` |
| `tsc --noEmit` | **0** | `tsc-final.log` |
| `npm run build` | **0** | `web-build2.log` |
| Browser Type bbox 1440/768 | **0** | `decisions-type-final.json` ok; Status badge left of Due; Due date-only |

## Screenshots (paths)

- `/tmp/pharma-ui-semantics-audit/desktop-1440-decisions.png`
- `/tmp/pharma-ui-semantics-audit/desktop-1440-decisions-type-crop.png`
- `/tmp/pharma-ui-semantics-audit/mobile-768-decisions.png`
- `/tmp/pharma-ui-semantics-audit/mobile-768-decisions-type-crop.png`
- Prior wave: `*-dashboard-c.png`, `*-decision-callout.png`, `*-related-*.png`

## Modified this close

- `apps/web/src/app/decisions/page.tsx` — Type wrap
- `apps/web/src/app/page.tsx` — ordinal in error
- `apps/web/src/app/page.test.tsx` — loading / error 03+retry / loaded

## Remaining

- Living OpenSpec apply/archive; human approve; **no commit/push**
- First build attempt failed on stale `.next-build` standalone copy; clean rebuild succeeded — no config/package change

## Out of scope preserved

links / labels / snapshots / schedule-progress / auth / чужие dirty.
