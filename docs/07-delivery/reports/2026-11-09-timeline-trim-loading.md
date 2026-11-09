---
id: DOC-DEL-R-TL-TRIM-2026-11-09
title: Отчёт — trim loading + meta row + air
type: report
status: draft
version: 0.1.0
created: '2026-11-09'
updated: '2026-11-09'
owner: docs-engineering
related:
  - DOC-UX-022
---
# Отчёт — trim loading / meta / air

> **certainty:** assumption — результат Auto; не human-approved.

## План (коротко)

1. Убрать видимый «Загрузка снимка …» у SnapshotSelector → `sr-only` + `aria-live` / `aria-busy`.
2. Удалить весь meta-ряд карточки «Вехи портфеля» (phase + PS legend), в т.ч. program scope.
3. Сократить header→plot gap (`mt-1.5`, `grid.top` 48→38); `grid.bottom` 28 сохранить.
4. Test First → unit → browser `:3080` → docs.

## Изменения

| Seam | Что |
|------|-----|
| [`snapshot-selector.tsx`](../../../apps/web/src/components/snapshot/snapshot-selector.tsx) | loading status → `sr-only` |
| [`executive-timeline-experiment-host.tsx`](../../../apps/web/src/components/dashboard/executive-timeline-experiment-host.tsx) | meta row удалён; body `mt-1.5` |
| [`executive-timeline-universe-chrome.tsx`](../../../apps/web/src/components/dashboard/executive-timeline-universe-chrome.tsx) | оставлен только Toolbar (Phase/PsLegend/UniverseChrome удалены — usage check) |
| [`timeline-caption-gap.ts`](../../../apps/web/src/lib/dashboard/timeline-caption-gap.ts) | gap 14, block 24 → grid.top 38 |
| Docs | dashboard chrome; SnapshotSelector a11y note |

## FAIL→PASS

`snapshot-selector.test` «during loading»: ожидание `sr-only` на «Загрузка снимка» — сначала FAIL (`text-xs…`), после fix PASS.

## Browser (`browser-trim.json`)

- Reload 05 delayed: `visibleLoading=[]`, sr-only «Загрузка снимка 05…», trigger bounds 152×39 @ top 6 без сдвига; persist активный 05.
- Card 03: no meta; header→body gap **6**; gridTop **38**, gridBottom **28**; cardH 1440/wide **422** (было ~466), 390 **465** (было ~565).
- Program / 19: no legend/meta; tooltip Перейти entered.

## Gates

| Gate | Exit |
|------|------|
| vitest scoped (54) | 0 |
| u1 R2-U1-R9 (3) | 0 |
| tsc | 0 |
| eslint | 0 |
| next build | 0 |
| markdownlint (2) | 0 |
| Playwright | 0 |

## Blockers (не эта волна)

- Чужой WIP / docs handoff broken link (baseline) — не ослабляли gates.
- API membership / gantt МАЙ — вне scope.

## Evidence

`/tmp/pharma-timeline-trim-loading/` — `browser-trim.json`, `after-03-*.png`, `after-19-1440.png`, `before-*-with-meta.png`, logs.
